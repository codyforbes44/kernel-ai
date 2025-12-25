import { COLORS_3D } from '@/constants/depthLayers3D';

export function SceneEnvironment() {
  return (
    <>
      {/* Subtle ambient light */}
      <ambientLight intensity={0.2} color={0x404060} />
      
      {/* Soft directional light for grid glow */}
      <directionalLight
        position={[0, 50, 100]}
        intensity={0.3}
        color={COLORS_3D.primary}
      />
      
      {/* Fog for clean depth fade */}
      <fog attach="fog" args={[0x000008, 150, 600]} />
    </>
  );
}
