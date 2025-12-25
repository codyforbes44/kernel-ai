import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS_3D } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function SceneEnvironment() {
  const { shouldAnimate } = useAdaptiveQuality();
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const point1Ref = useRef<THREE.PointLight>(null);
  const point2Ref = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!shouldAnimate) return;
    
    const t = clock.getElapsedTime();
    
    // Subtle light animation
    if (point1Ref.current) {
      point1Ref.current.intensity = 0.5 + Math.sin(t * 0.5) * 0.2;
      point1Ref.current.position.x = Math.sin(t * 0.3) * 50;
      point1Ref.current.position.y = Math.cos(t * 0.2) * 30;
    }
    
    if (point2Ref.current) {
      point2Ref.current.intensity = 0.4 + Math.cos(t * 0.4) * 0.2;
      point2Ref.current.position.x = Math.cos(t * 0.25) * 40;
      point2Ref.current.position.z = Math.sin(t * 0.35) * 20;
    }
  });

  return (
    <>
      {/* Base ambient light */}
      <ambientLight ref={ambientRef} intensity={0.15} color={0x404060} />
      
      {/* Primary point lights for dramatic effect */}
      <pointLight
        ref={point1Ref}
        position={[50, 30, 20]}
        intensity={0.5}
        color={COLORS_3D.primary}
        distance={300}
        decay={2}
      />
      
      <pointLight
        ref={point2Ref}
        position={[-40, -20, 30]}
        intensity={0.4}
        color={COLORS_3D.secondary}
        distance={250}
        decay={2}
      />
      
      {/* Accent light from below */}
      <pointLight
        position={[0, -50, -100]}
        intensity={0.3}
        color={COLORS_3D.accent}
        distance={200}
        decay={2}
      />
      
      {/* Fog for depth atmosphere */}
      <fog attach="fog" args={[0x000011, 100, 800]} />
    </>
  );
}
