import { Suspense, ReactNode, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { CAMERA_CONFIG } from '@/constants/depthLayers3D';
import { useThreePerformance } from '@/hooks/useThreePerformance';
import { useIsMobile } from '@/hooks/use-mobile';

interface ThreeCanvasProps {
  children: ReactNode;
  className?: string;
  isPaused?: boolean;
}

export function ThreeCanvas({ children, className = '', isPaused = false }: ThreeCanvasProps) {
  const { tier, reducedMotion } = useThreePerformance();
  const isMobile = useIsMobile();

  // Calculate DPR based on tier and device
  const dpr = useMemo(() => {
    if (isMobile) {
      // Lower DPR on mobile for better performance
      return tier === 'LOW' ? [0.75, 1] : [1, 1.25];
    }
    return [1, tier === 'ULTRA' ? 2 : 1.5];
  }, [tier, isMobile]) as [number, number];

  // Fallback for very low performance or reduced motion
  if (tier === 'LOW' && reducedMotion) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background ${className}`}>
        {/* Static fallback gradient */}
      </div>
    );
  }

  return (
    <div 
      className={`absolute inset-0 ${className}`}
      style={{ touchAction: 'pan-y' }} // Allow vertical scrolling on touch devices
    >
      <Canvas
        camera={{
          fov: CAMERA_CONFIG.FOV,
          near: CAMERA_CONFIG.NEAR,
          far: CAMERA_CONFIG.FAR,
          position: CAMERA_CONFIG.POSITION,
        }}
        dpr={dpr}
        gl={{
          antialias: tier !== 'LOW' && !isMobile, // Disable antialiasing on mobile
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false, // Better performance
        }}
        frameloop={isPaused ? 'demand' : 'always'}
        style={{ 
          background: 'transparent',
          touchAction: 'auto', // Allow native touch handling
        }}
      >
        <Suspense fallback={null}>
          {children}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
