import { useMemo, useEffect, useState, useCallback } from 'react';
import type { PerformanceConfig, DeviceTier, ConstellationDetail } from '../types';

/**
 * Detects WebGL support and GPU capability
 */
function detectGPUCapability(): 'high' | 'medium' | 'low' {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'low';
    
    const glContext = gl as WebGLRenderingContext;
    const debugInfo = glContext.getExtension('WEBGL_debug_renderer_info');
    
    if (debugInfo) {
      const renderer = glContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      const rendererLower = renderer.toLowerCase();
      
      // High-end GPU detection
      if (
        rendererLower.includes('nvidia') ||
        rendererLower.includes('radeon') ||
        rendererLower.includes('apple m') ||
        rendererLower.includes('apple gpu')
      ) {
        return 'high';
      }
      
      // Low-end detection
      if (
        rendererLower.includes('intel') ||
        rendererLower.includes('swiftshader') ||
        rendererLower.includes('llvmpipe')
      ) {
        return 'medium';
      }
    }
    
    return 'medium';
  } catch {
    return 'medium';
  }
}

/**
 * Checks if gyroscope is available (for mobile parallax)
 */
function detectGyroscope(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('DeviceOrientationEvent' in window)) {
      resolve(false);
      return;
    }
    
    // Check for permission API (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // Don't request permission here, just check availability
      resolve(true);
    } else {
      resolve(true);
    }
  });
}

/**
 * Hook to detect device capabilities and provide optimized performance settings
 * for Christmas animations. Respects prefers-reduced-motion and mobile devices.
 */
export function useChristmasPerformance(): PerformanceConfig {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [deviceTier, setDeviceTier] = useState<DeviceTier>('high');
  const [hasGyroscope, setHasGyroscope] = useState(false);

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

    // Detect GPU capability
    const gpuCapability = detectGPUCapability();
    setDeviceTier(gpuCapability);

    // Detect gyroscope
    detectGyroscope().then(setHasGyroscope);

    checkDevice();
    window.addEventListener('resize', checkDevice);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkDevice);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const config = useMemo<PerformanceConfig>(() => {
    // Reduced motion: minimal effects
    if (prefersReducedMotion) {
      return {
        particleScale: 0,
        enableComplexEffects: false,
        enableShadows: false,
        prefersReducedMotion: true,
        isSmallScreen,
        isVerySmallScreen,
        enableBlur: false,
        enable3DTransforms: false,
        maxParticles: 0,
        enableGyroscope: false,
        constellationDetail: 'minimal' as ConstellationDetail,
        deviceTier: 'low' as DeviceTier,
        enableAtmosphericEffects: false,
      };
    }

    // Low-end devices or very small screens
    if (deviceTier === 'low' || isVerySmallScreen) {
      return {
        particleScale: 0.3,
        enableComplexEffects: false,
        enableShadows: false,
        prefersReducedMotion: false,
        isSmallScreen,
        isVerySmallScreen,
        enableBlur: false,
        enable3DTransforms: false,
        maxParticles: 20,
        enableGyroscope: false,
        constellationDetail: 'minimal' as ConstellationDetail,
        deviceTier: 'low' as DeviceTier,
        enableAtmosphericEffects: false,
      };
    }

    // Mobile / medium tier
    if (isMobile || deviceTier === 'medium') {
      return {
        particleScale: 0.5,
        enableComplexEffects: false,
        enableShadows: true,
        prefersReducedMotion: false,
        isSmallScreen,
        isVerySmallScreen,
        enableBlur: true,
        enable3DTransforms: true,
        maxParticles: 40,
        enableGyroscope: hasGyroscope,
        constellationDetail: 'simplified' as ConstellationDetail,
        deviceTier: 'medium' as DeviceTier,
        enableAtmosphericEffects: true,
      };
    }

    // High-end desktop
    return {
      particleScale: 1,
      enableComplexEffects: true,
      enableShadows: true,
      prefersReducedMotion: false,
      isSmallScreen,
      isVerySmallScreen,
      enableBlur: true,
      enable3DTransforms: true,
      maxParticles: 100,
      enableGyroscope: false,
      constellationDetail: 'full' as ConstellationDetail,
      deviceTier: 'high' as DeviceTier,
      enableAtmosphericEffects: true,
    };
  }, [isMobile, prefersReducedMotion, isSmallScreen, isVerySmallScreen, deviceTier, hasGyroscope]);

  return config;
}

/**
 * Utility to scale particle counts based on performance config
 */
export function scaleParticleCount(baseCount: number, scale: number): number {
  return Math.max(1, Math.round(baseCount * scale));
}

/**
 * Get layer-specific particle count based on device tier
 */
export function getLayerParticleCount(
  layer: number, 
  deviceTier: DeviceTier,
  baseConfig: Record<string, number>
): number {
  const key = `LAYER_${layer}_PARTICLES`;
  const base = baseConfig[key] || 5;
  
  switch (deviceTier) {
    case 'low':
      return Math.max(0, Math.floor(base * 0.3));
    case 'medium':
      return Math.max(1, Math.floor(base * 0.5));
    case 'high':
    default:
      return base;
  }
}

/**
 * Lerp utility for smooth interpolation
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}
