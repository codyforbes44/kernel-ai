import { useMemo, useEffect, useState } from 'react';
import type { PerformanceConfig } from '../types';

/**
 * Hook to detect device capabilities and provide optimized performance settings
 * for Christmas animations. Respects prefers-reduced-motion and mobile devices.
 */
export function useChristmasPerformance(): PerformanceConfig {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const config = useMemo<PerformanceConfig>(() => {
    if (prefersReducedMotion) {
      return {
        particleScale: 0,
        enableComplexEffects: false,
        enableShadows: false,
        prefersReducedMotion: true,
      };
    }

    if (isMobile) {
      return {
        particleScale: 0.5,
        enableComplexEffects: false,
        enableShadows: true,
        prefersReducedMotion: false,
      };
    }

    return {
      particleScale: 1,
      enableComplexEffects: true,
      enableShadows: true,
      prefersReducedMotion: false,
    };
  }, [isMobile, prefersReducedMotion]);

  return config;
}

/**
 * Utility to scale particle counts based on performance config
 */
export function scaleParticleCount(baseCount: number, scale: number): number {
  return Math.max(1, Math.round(baseCount * scale));
}
