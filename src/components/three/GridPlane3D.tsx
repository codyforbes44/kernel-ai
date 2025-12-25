import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DEPTH_LAYERS_3D, COLORS_3D } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function GridPlane3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { shouldAnimate } = useAdaptiveQuality();

  // Create grid geometry
  const gridGeometry = useMemo(() => {
    const size = 1000;
    const divisions = 50;
    const step = size / divisions;
    
    const vertices: number[] = [];
    const colors: number[] = [];
    
    const color = new THREE.Color(COLORS_3D.grid);
    const halfSize = size / 2;

    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
      const y = i * step - halfSize;
      vertices.push(-halfSize, y, 0, halfSize, y, 0);
      
      // Fade at edges
      const fade = 1 - Math.abs(y / halfSize) * 0.5;
      colors.push(color.r * fade, color.g * fade, color.b * fade);
      colors.push(color.r * fade, color.g * fade, color.b * fade);
    }

    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
      const x = i * step - halfSize;
      vertices.push(x, -halfSize, 0, x, halfSize, 0);
      
      const fade = 1 - Math.abs(x / halfSize) * 0.5;
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
    
    // Subtle pulsing glow effect
    const time = clock.getElapsedTime();
    const pulse = 0.3 + Math.sin(time * 0.5) * 0.1;
    
    groupRef.current.children.forEach((child) => {
      if ((child as THREE.LineSegments).material) {
        ((child as THREE.LineSegments).material as THREE.LineBasicMaterial).opacity = pulse;
      }
    });
  });

  return (
    <group
      ref={groupRef}
      position={[0, -100, DEPTH_LAYERS_3D.GRID]}
      rotation={[-Math.PI * 0.5, 0, 0]}
    >
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      
      {/* Secondary perspective grid */}
      <lineSegments
        geometry={gridGeometry}
        position={[0, 0, -200]}
        scale={[1.5, 1.5, 1]}
      >
        <lineBasicMaterial
          color={COLORS_3D.secondary}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
