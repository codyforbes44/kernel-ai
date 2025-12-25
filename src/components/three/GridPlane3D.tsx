import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DEPTH_LAYERS_3D, COLORS_3D } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function GridPlane3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { shouldAnimate } = useAdaptiveQuality();

  // Create enhanced grid geometry with more divisions
  const gridGeometry = useMemo(() => {
    const size = 2000;
    const divisions = 100;
    const step = size / divisions;
    
    const vertices: number[] = [];
    const colors: number[] = [];
    
    const color = new THREE.Color(COLORS_3D.grid);
    const halfSize = size / 2;

    // Horizontal lines with distance-based fade
    for (let i = 0; i <= divisions; i++) {
      const y = i * step - halfSize;
      vertices.push(-halfSize, y, 0, halfSize, y, 0);
      
      // Stronger fade at edges for depth perception
      const distanceFade = 1 - Math.pow(Math.abs(y / halfSize), 1.5) * 0.7;
      colors.push(color.r * distanceFade, color.g * distanceFade, color.b * distanceFade);
      colors.push(color.r * distanceFade, color.g * distanceFade, color.b * distanceFade);
    }

    // Vertical lines with distance-based fade
    for (let i = 0; i <= divisions; i++) {
      const x = i * step - halfSize;
      vertices.push(x, -halfSize, 0, x, halfSize, 0);
      
      const distanceFade = 1 - Math.pow(Math.abs(x / halfSize), 1.5) * 0.7;
      colors.push(color.r * distanceFade, color.g * distanceFade, color.b * distanceFade);
      colors.push(color.r * distanceFade, color.g * distanceFade, color.b * distanceFade);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Create radial vanishing point lines for enhanced depth
  const radialGeometry = useMemo(() => {
    const vertices: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color(COLORS_3D.primary);
    
    const rayCount = 24;
    const innerRadius = 50;
    const outerRadius = 1500;
    
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const x1 = Math.cos(angle) * innerRadius;
      const y1 = Math.sin(angle) * innerRadius;
      const x2 = Math.cos(angle) * outerRadius;
      const y2 = Math.sin(angle) * outerRadius;
      
      vertices.push(x1, y1, 0, x2, y2, 0);
      
      // Bright at center, fade to edges
      colors.push(color.r * 0.8, color.g * 0.8, color.b * 0.8);
      colors.push(color.r * 0.1, color.g * 0.1, color.b * 0.1);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Create horizon glow ring
  const horizonGeometry = useMemo(() => {
    const segments = 128;
    const radius = 1200;
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
      
      const fade = 0.3 + Math.sin(angle1 * 2) * 0.1;
      colors.push(color.r * fade, color.g * fade, color.b * fade);
      colors.push(color.r * fade, color.g * fade, color.b * fade);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !shouldAnimate) return;
    
    const time = clock.getElapsedTime();
    
    // Subtle pulsing glow with depth wave
    const pulse = 0.35 + Math.sin(time * 0.4) * 0.1;
    const depthWave = Math.sin(time * 0.2) * 0.05;
    
    // Very slow forward drift for infinite space feeling
    groupRef.current.position.z = DEPTH_LAYERS_3D.GRID + Math.sin(time * 0.1) * 5;
    
    groupRef.current.children.forEach((child, index) => {
      if ((child as THREE.LineSegments).material) {
        const material = (child as THREE.LineSegments).material as THREE.LineBasicMaterial;
        // Stagger opacity by layer depth
        const layerOffset = index * 0.02;
        material.opacity = pulse + depthWave - layerOffset;
      }
    });
  });

  return (
    <group
      ref={groupRef}
      position={[0, -180, DEPTH_LAYERS_3D.GRID]}
      rotation={[-Math.PI * 0.47, 0, 0]}
    >
      {/* Primary grid - nearest layer */}
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      
      {/* Radial vanishing point lines */}
      <lineSegments geometry={radialGeometry} position={[0, 0, -50]}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      
      {/* Mid-depth grid layer */}
      <lineSegments
        geometry={gridGeometry}
        position={[0, 0, DEPTH_LAYERS_3D.GRID_MID - DEPTH_LAYERS_3D.GRID]}
        scale={[1.8, 1.8, 1]}
      >
        <lineBasicMaterial
          color={COLORS_3D.primary}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      
      {/* Far horizon grid layer */}
      <lineSegments
        geometry={gridGeometry}
        position={[0, 0, DEPTH_LAYERS_3D.GRID_FAR - DEPTH_LAYERS_3D.GRID]}
        scale={[2.5, 2.5, 1]}
      >
        <lineBasicMaterial
          color={COLORS_3D.secondary}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      
      {/* Horizon glow ring */}
      <lineSegments
        geometry={horizonGeometry}
        position={[0, 0, DEPTH_LAYERS_3D.GRID_FAR - DEPTH_LAYERS_3D.GRID - 100]}
      >
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
