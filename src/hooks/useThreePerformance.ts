import { useState, useEffect, useCallback, useRef } from 'react';
import { PERFORMANCE_TIERS, PerformanceTier } from '@/constants/depthLayers3D';

interface PerformanceState {
  tier: PerformanceTier;
  settings: typeof PERFORMANCE_TIERS[PerformanceTier];
  fps: number;
  reducedMotion: boolean;
  isMobile: boolean;
}

export function useThreePerformance(): PerformanceState {
  const [tier, setTier] = useState<PerformanceTier>('HIGH');
  const [fps, setFps] = useState(60);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tierRef = useRef<PerformanceTier>(tier);
  
  // Keep ref in sync with state
  useEffect(() => {
    tierRef.current = tier;
  }, [tier]);

  // Detect device capabilities on mount
  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Check for mobile device
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);

    // Detect GPU capabilities
    const detectGPU = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
          setTier('LOW');
          canvas.remove();
          return;
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          
          // Check for high-end GPUs
          const highEndGPUs = ['NVIDIA', 'GeForce RTX', 'Radeon RX', 'Apple M1', 'Apple M2', 'Apple M3'];
          const isHighEnd = highEndGPUs.some(gpu => 
            renderer.includes(gpu) || vendor.includes(gpu)
          );

          if (isHighEnd && !mobile) {
            setTier('ULTRA');
          } else if (!mobile) {
            setTier('HIGH');
          } else {
            setTier('MEDIUM');
          }
        }

        // Check max texture size as capability indicator
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        if (maxTextureSize < 4096) {
          setTier('LOW');
        }

        // Properly dispose WebGL context to prevent context exhaustion
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
        canvas.remove();
      } catch {
        setTier('MEDIUM');
      }
    };

    detectGPU();

    // Simple FPS monitor
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;
    
    const measureFps = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        
        // Auto-adjust tier based on FPS using ref to avoid dependency
        if (frameCount < 30 && tierRef.current !== 'LOW') {
          setTier(prev => {
            const tiers: PerformanceTier[] = ['ULTRA', 'HIGH', 'MEDIUM', 'LOW'];
            const currentIndex = tiers.indexOf(prev);
            return tiers[Math.min(currentIndex + 1, tiers.length - 1)];
          });
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFps);
    };
    
    animationId = requestAnimationFrame(measureFps);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      cancelAnimationFrame(animationId);
    };
  }, []); // Empty dependency array - runs once on mount

  // Override to LOW if reduced motion is preferred
  const effectiveTier = reducedMotion ? 'LOW' : tier;

  return {
    tier: effectiveTier,
    settings: PERFORMANCE_TIERS[effectiveTier],
    fps,
    reducedMotion,
    isMobile,
  };
}

// Hook for adaptive quality in Three.js components
export function useAdaptiveQuality() {
  const { tier, settings, reducedMotion } = useThreePerformance();
  
  const shouldAnimate = !reducedMotion;
  
  return {
    tier,
    settings,
    shouldAnimate,
    enablePostProcessing: settings.postProcessing,
    enableRayMarching: settings.rayMarching,
  };
}
