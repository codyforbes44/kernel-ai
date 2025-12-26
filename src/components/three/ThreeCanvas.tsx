import { Suspense, ReactNode, useMemo, useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Context loss recovery state
  const [contextKey, setContextKey] = useState(0);
  const [isContextLost, setIsContextLost] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recoveryAttempts = useRef(0);
  const maxRecoveryAttempts = 3;

  // Handle WebGL context loss
  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault(); // Prevent default loss behavior
    console.warn('WebGL context lost, preparing for recovery...');
    setIsContextLost(true);
    
    // Clear any pending recovery
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
    }
  }, []);

  // Handle WebGL context restoration
  const handleContextRestored = useCallback(() => {
    recoveryAttempts.current += 1;
    
    if (recoveryAttempts.current > maxRecoveryAttempts) {
      console.warn(`WebGL recovery exceeded ${maxRecoveryAttempts} attempts, falling back to static view`);
      return; // Stay in fallback mode
    }
    
    console.log(`WebGL context restored (attempt ${recoveryAttempts.current}), re-mounting scene...`);
    
    // Exponential backoff delay for recovery
    const delay = Math.min(100 * Math.pow(2, recoveryAttempts.current - 1), 2000);
    
    recoveryTimeoutRef.current = setTimeout(() => {
      setIsContextLost(false);
      setContextKey(prev => prev + 1); // Force Canvas re-mount
    }, delay);
  }, []);

  // Set up context loss listeners on the actual canvas element
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    // Find the canvas element after it's mounted
    const findAndAttachListeners = () => {
      const canvas = container.querySelector('canvas');
      if (canvas) {
        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);
        return canvas;
      }
      return null;
    };

    // Try immediately, then with a small delay if not found
    let canvas = findAndAttachListeners();
    let retryTimeout: NodeJS.Timeout | null = null;
    
    if (!canvas) {
      retryTimeout = setTimeout(() => {
        canvas = findAndAttachListeners();
      }, 100);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
    };
  }, [handleContextLost, handleContextRestored, contextKey]);

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

  // Show recovery state while context is lost
  if (isContextLost) {
    return (
      <div 
        ref={canvasContainerRef}
        className={`absolute inset-0 ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background flex items-center justify-center">
          <div className="text-muted-foreground/50 text-sm animate-pulse">
            Recovering graphics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={canvasContainerRef}
      className={`absolute inset-0 ${className}`}
      style={{ touchAction: 'pan-y' }} // Allow vertical scrolling on touch devices
    >
      <Canvas
        key={contextKey} // Force re-mount on context recovery
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
        onCreated={({ gl }) => {
          // Additional context loss handling at the WebGL level
          const context = gl.getContext();
          if (context) {
            // Log context info for debugging
            console.log('WebGL context created successfully');
          }
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
