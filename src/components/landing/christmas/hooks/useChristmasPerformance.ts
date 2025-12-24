import { useMemo, useEffect, useState } from 'react';
import type { PerformanceConfig } from '../types';

/**
 * Hook to detect device capabilities and provide optimized performance settings
 * for Christmas animations. Respects prefers-reduced-motion and mobile devices.
 */
export function useChristmasPerformance(): PerformanceConfig {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect device capabilities and screen size
    const checkDevice = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileWidth = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isMobileWidth);
      setIsSmallScreen(window.innerWidth < 640);
      setIsVerySmallScreen(window.innerWidth < 400);
    };

    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkDevice);
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
        isSmallScreen,
        isVerySmallScreen,
      };
    }

    if (isMobile) {
      return {
        particleScale: 0.5,
        enableComplexEffects: false,
        enableShadows: true,
        prefersReducedMotion: false,
        isSmallScreen,
        isVerySmallScreen,
      };
    }

    return {
      particleScale: 1,
      enableComplexEffects: true,
      enableShadows: true,
      prefersReducedMotion: false,
      isSmallScreen,
      isVerySmallScreen,
    };
  }, [isMobile, prefersReducedMotion, isSmallScreen, isVerySmallScreen]);

  return config;
}

/**
 * Utility to scale particle counts based on performance config
 */
export function scaleParticleCount(baseCount: number, scale: number): number {
  return Math.max(1, Math.round(baseCount * scale));
}
