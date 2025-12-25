import { Suspense, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { CAMERA_CONFIG } from '@/constants/depthLayers3D';
import { useThreePerformance } from '@/hooks/useThreePerformance';

interface ThreeCanvasProps {
  children: ReactNode;
  className?: string;
}

export function ThreeCanvas({ children, className = '' }: ThreeCanvasProps) {
  const { tier, reducedMotion } = useThreePerformance();

  // Fallback for very low performance or reduced motion
  if (tier === 'LOW' && reducedMotion) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background ${className}`}>
        {/* Static fallback gradient */}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{
          fov: CAMERA_CONFIG.FOV,
          near: CAMERA_CONFIG.NEAR,
          far: CAMERA_CONFIG.FAR,
          position: CAMERA_CONFIG.POSITION,
        }}
        dpr={[1, tier === 'ULTRA' ? 2 : 1.5]}
        gl={{
          antialias: tier !== 'LOW',
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {children}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
