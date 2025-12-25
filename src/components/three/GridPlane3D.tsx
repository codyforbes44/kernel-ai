import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DEPTH_LAYERS_3D, COLORS_3D } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function GridPlane3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { shouldAnimate } = useAdaptiveQuality();
  const materialRefs = useRef<THREE.LineBasicMaterial[]>([]);

  // Perspective-based grid with denser lines near camera, sparser toward horizon
  const gridGeometry = useMemo(() => {
    const vertices: number[] = [];
    const colors: number[] = [];
    
    const gridColor = new THREE.Color(COLORS_3D.grid);
    const majorColor = new THREE.Color(COLORS_3D.primary);
    
    const gridWidth = 2400;  // Width of grid
    const gridDepth = 3000;  // Depth extending toward horizon
    const halfWidth = gridWidth / 2;
    
    // Perspective-based horizontal lines (receding toward horizon)
    // Denser near camera, sparser toward horizon using exponential spacing
    const horizonLineCount = 60;
    for (let i = 0; i < horizonLineCount; i++) {
      // Exponential spacing - closer lines near camera
      const t = i / horizonLineCount;
      const z = Math.pow(t, 1.8) * gridDepth;
      const isMajor = i % 5 === 0;
      
      vertices.push(-halfWidth, 0, -z, halfWidth, 0, -z);
      
      // Exponential fade toward horizon
      const depthFade = Math.pow(1 - t, 2.5);
      const intensity = isMajor ? depthFade * 0.9 : depthFade * 0.35;
      const color = isMajor ? majorColor : gridColor;
      
      colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
      colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
    }
    
    // Vertical lines (perpendicular to horizon)
    const verticalLineCount = 48;
    for (let i = 0; i <= verticalLineCount; i++) {
      const x = (i / verticalLineCount) * gridWidth - halfWidth;
      const isMajor = i % 4 === 0;
      
      // Lines extend from near camera to far horizon
      vertices.push(x, 0, 0, x, 0, -gridDepth);
      
      // Fade based on distance from center for subtle vignette
      const centerDist = Math.abs(x / halfWidth);
      const edgeFade = 1 - Math.pow(centerDist, 2) * 0.6;
      const intensity = isMajor ? edgeFade * 0.8 : edgeFade * 0.3;
      const color = isMajor ? majorColor : gridColor;
      
      // Near vertex (bright)
      colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
      // Far vertex (faded toward horizon)
      colors.push(color.r * intensity * 0.05, color.g * intensity * 0.05, color.b * intensity * 0.05);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Horizon glow line at vanishing point
  const horizonLineGeometry = useMemo(() => {
    const vertices: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color(COLORS_3D.secondary);
    
    const width = 3000;
    const segments = 100;
    
    for (let i = 0; i < segments; i++) {
      const x1 = (i / segments) * width - width / 2;
      const x2 = ((i + 1) / segments) * width - width / 2;
      
      vertices.push(x1, 0, -2800, x2, 0, -2800);
      
      // Fade at edges, bright at center
      const t1 = Math.abs(x1 / (width / 2));
      const t2 = Math.abs(x2 / (width / 2));
      const fade1 = Math.pow(1 - t1, 1.5) * 0.6;
      const fade2 = Math.pow(1 - t2, 1.5) * 0.6;
      
      colors.push(color.r * fade1, color.g * fade1, color.b * fade1);
      colors.push(color.r * fade2, color.g * fade2, color.b * fade2);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Subtle center line for depth focus
  const centerLineGeometry = useMemo(() => {
    const vertices: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color(COLORS_3D.primary);
    
    // Central line from camera to horizon
    vertices.push(0, 0.1, 50, 0, 0.1, -2800);
    
    colors.push(color.r * 0.8, color.g * 0.8, color.b * 0.8);
    colors.push(color.r * 0.02, color.g * 0.02, color.b * 0.02);
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Animation for pulsing glow
  useFrame(({ clock }) => {
    if (!groupRef.current || !shouldAnimate) return;
    
    const time = clock.getElapsedTime();
    
    // Subtle pulsing
    const pulse = 0.5 + Math.sin(time * 0.4) * 0.1;
    const horizonPulse = 0.4 + Math.sin(time * 0.6) * 0.15;
    
    materialRefs.current.forEach((mat, index) => {
      if (mat) {
        if (index === 0) {
          mat.opacity = pulse;
        } else if (index === 1) {
          mat.opacity = horizonPulse;
        } else if (index === 2) {
          mat.opacity = 0.6 + Math.sin(time * 0.8) * 0.2;
        }
      }
    });
  });

  // Grid positioned as floor receding toward horizon
  const gridY = -80;

  return (
    <group ref={groupRef} position={[0, gridY, 0]}>
      {/* Main perspective grid */}
      <group position={[0, 0, DEPTH_LAYERS_3D.GRID]}>
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial
            ref={(ref) => { if (ref) materialRefs.current[0] = ref; }}
            vertexColors
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      {/* Horizon glow line */}
      <group position={[0, 1, DEPTH_LAYERS_3D.GRID]}>
        <lineSegments geometry={horizonLineGeometry}>
          <lineBasicMaterial
            ref={(ref) => { if (ref) materialRefs.current[1] = ref; }}
            vertexColors
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      {/* Center focus line */}
      <group position={[0, 0, DEPTH_LAYERS_3D.GRID]}>
        <lineSegments geometry={centerLineGeometry}>
          <lineBasicMaterial
            ref={(ref) => { if (ref) materialRefs.current[2] = ref; }}
            vertexColors
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>
    </group>
  );
}