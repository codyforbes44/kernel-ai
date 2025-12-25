import { Component, ReactNode, Suspense, useState, useEffect } from 'react';
import { Hero3DScene } from '../three/Hero3DScene';
import { HeroSkeleton } from './HeroSkeleton';
import { cn } from '@/lib/utils';

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

// Wrapper to detect when 3D scene is ready
function Scene3DWithLoadState({ onReady, isPaused }: { onReady: () => void; isPaused: boolean }) {
  useEffect(() => {
    // Small delay to ensure WebGL context is fully initialized
    const timer = setTimeout(onReady, 100);
    return () => clearTimeout(timer);
  }, [onReady]);

  return <Hero3DScene isPaused={isPaused} />;
}

export function HeroBackground({ isVisible = true }: HeroBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        // Hide from GPU when not visible to save battery
        !isVisible && "invisible"
      )}
    >
      {/* Skeleton loader - fades out when 3D is ready */}
      <div 
        className={cn(
          "absolute inset-0 z-10 transition-opacity duration-1000 ease-out",
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <HeroSkeleton />
      </div>
      
      {/* 3D Scene - paused when not visible */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-700 ease-in",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        <WebGLErrorBoundary>
          <Suspense fallback={null}>
            <Scene3DWithLoadState 
              onReady={() => setIsLoaded(true)} 
              isPaused={!isVisible}
            />
          </Suspense>
        </WebGLErrorBoundary>
      </div>
    </div>
  );
}
