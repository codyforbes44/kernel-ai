import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DEPTH_LAYERS_3D, COLORS_3D } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

// Tron-style energy pulse traveling along grid lines
function TronPulse({ 
  startPosition, 
  direction, 
  speed = 0.5, 
  color = COLORS_3D.pulse,
  delay = 0 
}: { 
  startPosition: [number, number, number];
  direction: [number, number, number];
  speed?: number;
  color?: number;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const time = clock.getElapsedTime() + delay;
    const progress = (time * speed) % 3; // Loop every 3 seconds
    
    // Move along direction
    meshRef.current.position.x = startPosition[0] + direction[0] * progress * 400;
    meshRef.current.position.y = startPosition[1] + direction[1] * progress * 400;
    meshRef.current.position.z = startPosition[2];
    
    // Fade in and out
    const fadeIn = Math.min(progress * 2, 1);
    const fadeOut = Math.max(0, 1 - (progress - 2));
    const opacity = fadeIn * fadeOut;
    
    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.opacity = opacity * 0.8;
    }
    
    // Pulse scale
    const scale = 1 + Math.sin(time * 8) * 0.3;
    meshRef.current.scale.setScalar(scale);
  });
  
  return (
    <mesh ref={meshRef} position={startPosition}>
      <sphereGeometry args={[2, 8, 8]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function GridPlane3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { shouldAnimate } = useAdaptiveQuality();
  const materialRefs = useRef<THREE.LineBasicMaterial[]>([]);

  // Create organized Tron-style grid with cleaner divisions
  const gridGeometry = useMemo(() => {
    const size = 2000;
    const majorDivisions = 20; // Major grid lines
    const minorDivisions = 4;  // Minor divisions between major
    const totalDivisions = majorDivisions * minorDivisions;
    const step = size / totalDivisions;
    
    const vertices: number[] = [];
    const colors: number[] = [];
    
    const majorColor = new THREE.Color(COLORS_3D.grid);
    const minorColor = new THREE.Color(COLORS_3D.grid).multiplyScalar(0.3);
    const halfSize = size / 2;

    // Horizontal lines
    for (let i = 0; i <= totalDivisions; i++) {
      const y = i * step - halfSize;
      const isMajor = i % minorDivisions === 0;
      const color = isMajor ? majorColor : minorColor;
      
      vertices.push(-halfSize, y, 0, halfSize, y, 0);
      
      // Distance-based fade with stronger center glow
      const normalizedDist = Math.abs(y / halfSize);
      const distanceFade = Math.pow(1 - normalizedDist, 0.8);
      const intensity = isMajor ? distanceFade : distanceFade * 0.4;
      
      colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
      colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
    }

    // Vertical lines
    for (let i = 0; i <= totalDivisions; i++) {
      const x = i * step - halfSize;
      const isMajor = i % minorDivisions === 0;
      const color = isMajor ? majorColor : minorColor;
      
      vertices.push(x, -halfSize, 0, x, halfSize, 0);
      
      const normalizedDist = Math.abs(x / halfSize);
      const distanceFade = Math.pow(1 - normalizedDist, 0.8);
      const intensity = isMajor ? distanceFade : distanceFade * 0.4;
      
      colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
      colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Tron-style radial speed lines emanating from center
  const speedLinesGeometry = useMemo(() => {
    const vertices: number[] = [];
    const colors: number[] = [];
    const primaryColor = new THREE.Color(COLORS_3D.primary);
    const secondaryColor = new THREE.Color(COLORS_3D.secondary);
    
    const rayCount = 32;
    const innerRadius = 30;
    const outerRadius = 1800;
    
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const x1 = Math.cos(angle) * innerRadius;
      const y1 = Math.sin(angle) * innerRadius;
      const x2 = Math.cos(angle) * outerRadius;
      const y2 = Math.sin(angle) * outerRadius;
      
      vertices.push(x1, y1, 0, x2, y2, 0);
      
      // Alternate between primary and secondary colors
      const color = i % 2 === 0 ? primaryColor : secondaryColor;
      const innerIntensity = 0.9;
      const outerIntensity = 0.05;
      
      colors.push(color.r * innerIntensity, color.g * innerIntensity, color.b * innerIntensity);
      colors.push(color.r * outerIntensity, color.g * outerIntensity, color.b * outerIntensity);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Central energy ring (Tron disc style)
  const discGeometry = useMemo(() => {
    const segments = 64;
    const radius = 80;
    const vertices: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color(COLORS_3D.primary);
    
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;
      
      vertices.push(
        Math.cos(angle1) * radius, Math.sin(angle1) * radius, 0,
        Math.cos(angle2) * radius, Math.sin(angle2) * radius, 0
      );
      
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Outer horizon ring
  const horizonGeometry = useMemo(() => {
    const segments = 128;
    const radius = 1400;
    const vertices: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color(COLORS_3D.secondary);
    
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;
      
      vertices.push(
        Math.cos(angle1) * radius, Math.sin(angle1) * radius, 0,
        Math.cos(angle2) * radius, Math.sin(angle2) * radius, 0
      );
      
      // Pulsing fade effect
      const fade = 0.25 + Math.sin(angle1 * 4) * 0.15;
      colors.push(color.r * fade, color.g * fade, color.b * fade);
      colors.push(color.r * fade, color.g * fade, color.b * fade);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Animation with Tron energy pulse effect
  useFrame(({ clock }) => {
    if (!groupRef.current || !shouldAnimate) return;
    
    const time = clock.getElapsedTime();
    
    // Dynamic pulsing glow
    const pulse = 0.4 + Math.sin(time * 0.6) * 0.15;
    const fastPulse = 0.5 + Math.sin(time * 2) * 0.1;
    
    // Update material opacities for energy effect
    materialRefs.current.forEach((mat, index) => {
      if (mat) {
        if (index === 0) {
          // Main grid - subtle pulse
          mat.opacity = pulse;
        } else if (index === 1) {
          // Speed lines - faster pulse
          mat.opacity = fastPulse * 0.5;
        } else if (index === 2) {
          // Central disc - bright pulse
          mat.opacity = 0.8 + Math.sin(time * 3) * 0.2;
        } else if (index === 3) {
          // Horizon ring
          mat.opacity = 0.3 + Math.sin(time * 0.8) * 0.1;
        }
      }
    });
    
    // Slow rotation for the speed lines layer
    const speedLinesGroup = groupRef.current.children[1];
    if (speedLinesGroup) {
      speedLinesGroup.rotation.z = time * 0.02;
    }
    
    // Central disc rotation
    const discGroup = groupRef.current.children[2];
    if (discGroup) {
      discGroup.rotation.z = -time * 0.1;
    }
  });

  // Generate pulse positions along major grid lines
  const pulsePositions = useMemo(() => {
    const positions: { start: [number, number, number]; dir: [number, number, number]; delay: number; color: number }[] = [];
    
    // Horizontal pulses
    for (let i = 0; i < 4; i++) {
      const y = (i - 1.5) * 200;
      positions.push({
        start: [-800, y, 5],
        dir: [1, 0, 0],
        delay: i * 0.7,
        color: COLORS_3D.pulse,
      });
    }
    
    // Vertical pulses
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 200;
      positions.push({
        start: [x, -800, 5],
        dir: [0, 1, 0],
        delay: i * 0.5 + 0.3,
        color: COLORS_3D.secondary,
      });
    }
    
    return positions;
  }, []);

  // Position grid at bottom of viewport - y offset moves it down, rotation tilts toward viewer
  const gridY = -120;  // Push down to bottom of viewport
  const gridRotation = Math.PI / 2.8; // Tilted perspective toward viewer

  return (
    <group ref={groupRef} position={[0, gridY, 0]}>
      {/* Main grid layer */}
      <group position={[0, 0, DEPTH_LAYERS_3D.GRID]} rotation={[gridRotation, 0, 0]}>
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial
            ref={(ref) => { if (ref) materialRefs.current[0] = ref; }}
            vertexColors
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      {/* Speed lines layer */}
      <group position={[0, 0, DEPTH_LAYERS_3D.GRID - 20]} rotation={[gridRotation, 0, 0]}>
        <lineSegments geometry={speedLinesGeometry}>
          <lineBasicMaterial
            ref={(ref) => { if (ref) materialRefs.current[1] = ref; }}
            vertexColors
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      {/* Central energy disc */}
      <group position={[0, 0, DEPTH_LAYERS_3D.GRID + 10]} rotation={[gridRotation, 0, 0]}>
        <lineSegments geometry={discGeometry}>
          <lineBasicMaterial
            ref={(ref) => { if (ref) materialRefs.current[2] = ref; }}
            vertexColors
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            linewidth={2}
          />
        </lineSegments>
      </group>

      {/* Horizon ring */}
      <group position={[0, 0, DEPTH_LAYERS_3D.GRID_FAR]} rotation={[gridRotation, 0, 0]}>
        <lineSegments geometry={horizonGeometry}>
          <lineBasicMaterial
            ref={(ref) => { if (ref) materialRefs.current[3] = ref; }}
            vertexColors
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      {/* Tron energy pulses traveling along grid */}
      <group position={[0, 0, DEPTH_LAYERS_3D.GRID]} rotation={[gridRotation, 0, 0]}>
        {pulsePositions.map((pulse, index) => (
          <TronPulse
            key={index}
            startPosition={pulse.start}
            direction={pulse.dir}
            delay={pulse.delay}
            color={pulse.color}
            speed={0.4}
          />
        ))}
      </group>
    </group>
  );
}
