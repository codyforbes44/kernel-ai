import { Canvas } from '@react-three/fiber';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

// Clean atmospheric scene without particles
function SceneContent() {
  return (
    <>
      <color attach="background" args={['#000011']} />
      <fog attach="fog" args={['#000011', 30, 80]} />
      <ambientLight intensity={0.1} />
    </>
  );
}

interface PageBackground3DProps {
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function PageBackground3D({ intensity = 'low', className = '' }: PageBackground3DProps) {
  const { tier } = useAdaptiveQuality();

  // Skip 3D on very low-end devices
  if (tier === 'LOW') {
    return (
      <div 
        className={`fixed inset-0 -z-10 bg-gradient-to-b from-background via-background to-background/95 ${className}`}
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.05) 0%, transparent 50%)',
        }}
      />
    );
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
