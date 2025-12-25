import { COLORS_3D } from '@/constants/depthLayers3D';

export function SceneEnvironment() {
  return (
    <>
      {/* Ambient light for overall visibility */}
      <ambientLight intensity={0.15} color={0x404080} />
      
      {/* Key light - main illumination */}
      <directionalLight
        position={[30, 50, 80]}
        intensity={0.5}
        color={COLORS_3D.primary}
      />
      
      {/* Fill light - softer secondary */}
      <directionalLight
        position={[-40, 30, 50]}
        intensity={0.25}
        color={0xff00ff}
      />
      
      {/* Rim light - back lighting for depth */}
      <directionalLight
        position={[0, -20, -100]}
        intensity={0.2}
        color={0x00ff88}
      />
      
      {/* Fog for clean depth fade */}
      <fog attach="fog" args={[0x000010, 120, 500]} />
    </>
  );
}
