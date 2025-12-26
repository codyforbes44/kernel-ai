import { Component, ReactNode, Suspense, useState, useEffect, lazy } from 'react';
import { HeroSkeleton } from './HeroSkeleton';
import { cn } from '@/lib/utils';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

// Lazy load heavy Three.js component
const Hero3DScene = lazy(() => 
  import('../three/Hero3DScene').then(m => ({ default: m.Hero3DScene }))
);

interface HeroBackgroundProps {
  isVisible?: boolean;
}

// Error boundary for graceful WebGL fallback
interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('WebGL Error:', error.message);
  }

  render() {
    if (this.state.hasError) {
      // CSS gradient fallback when WebGL fails
      return (
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 120%, hsl(var(--primary) / 0.15) 0%, transparent 50%), linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(195 100% 3%) 100%)'
          }}
        />
      );
    }
    return this.props.children;
  }
}

// Wrapper to detect when 3D scene is ready and pass gyroscope data
function Scene3DWithLoadState({ 
  onReady, 
  isPaused,
  tiltX,
  tiltY,
}: { 
  onReady: () => void; 
  isPaused: boolean;
  tiltX: number;
  tiltY: number;
}) {
  useEffect(() => {
    // Small delay to ensure WebGL context is fully initialized
    const timer = setTimeout(onReady, 100);
    return () => clearTimeout(timer);
  }, [onReady]);

  return <Hero3DScene isPaused={isPaused} tiltX={tiltX} tiltY={tiltY} />;
}

export function HeroBackground({ isVisible = true }: HeroBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { normalizedTilt, isSupported, isPermissionGranted } = useDeviceOrientation();

  // Only use gyroscope data if supported and granted
  const tiltX = isSupported && isPermissionGranted ? normalizedTilt.x : 0;
  const tiltY = isSupported && isPermissionGranted ? normalizedTilt.y : 0;

  return (
    <div 
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        // Hide from GPU when not visible to save battery
        !isVisible && "invisible"
      )}
    >
      {/* Vignette overlay for better content focus on desktop */}
      <div 
        className="absolute inset-0 z-[5] pointer-events-none hidden lg:block"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, hsl(var(--background) / 0.4) 100%)'
        }}
      />
      
      {/* Skeleton loader - faster fade out */}
      <div 
        className={cn(
          "absolute inset-0 z-10 transition-opacity duration-500 ease-out",
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <HeroSkeleton />
      </div>
      
      {/* 3D Scene - paused when not visible, faster fade in */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-400 ease-in",
          isLoaded ? "opacity-100" : "opacity-0",
          // Slightly boost visibility on desktop
          "lg:brightness-110 lg:contrast-105"
        )}
      >
        <WebGLErrorBoundary>
          <Suspense fallback={null}>
            <Scene3DWithLoadState 
              onReady={() => setIsLoaded(true)} 
              isPaused={!isVisible}
              tiltX={tiltX}
              tiltY={tiltY}
            />
          </Suspense>
        </WebGLErrorBoundary>
      </div>
    </div>
  );
}
