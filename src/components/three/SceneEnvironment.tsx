export function SceneEnvironment() {
  return (
    <>
      {/* Soft ambient light */}
      <ambientLight intensity={0.1} color={0x404080} />
      
      {/* Subtle directional light */}
      <directionalLight
        position={[20, 40, 60]}
        intensity={0.3}
        color={0x6080ff}
      />
      
      {/* Fog for depth fade */}
      <fog attach="fog" args={[0x000010, 100, 400]} />
    </>
  );
}
