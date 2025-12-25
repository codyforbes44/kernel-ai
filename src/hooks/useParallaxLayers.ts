import { useState, useEffect, useCallback, useRef } from 'react';
import { useDeviceOrientation } from './useDeviceOrientation';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface ParallaxLayer {
  /** Transform string for CSS transform property */
  transform: string;
  /** Individual transform values */
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  /** Scale based on scroll */
  scale: number;
  /** Opacity based on scroll position */
  opacity: number;
}

export interface ParallaxConfig {
  /** Multiplier for gyroscope tilt effect (default: 1) */
  tiltStrength?: number;
  /** Multiplier for scroll effect (default: 1) */
  scrollStrength?: number;
  /** Multiplier for mouse parallax on desktop (default: 0.5) */
  mouseStrength?: number;
  /** Z-depth for the layer (negative = further, positive = closer) */
  depth?: number;
}

const DEFAULT_CONFIG: Required<ParallaxConfig> = {
  tiltStrength: 1,
  scrollStrength: 1,
  mouseStrength: 0.5,
  depth: 0,
};

export function useParallaxLayers(config: ParallaxConfig = {}) {
  const { tiltStrength, scrollStrength, mouseStrength, depth } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const { normalizedTilt, isSupported: hasGyroscope } = useDeviceOrientation();
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const rafRef = useRef<number>(0);
  const currentValues = useRef({
    tiltX: 0,
    tiltY: 0,
    scrollY: 0,
    mouseX: 0,
    mouseY: 0,
  });

  // Detect mobile
  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Scroll tracking with throttled updates
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse tracking for desktop (throttled)
  useEffect(() => {
    if (isMobile) return;

    let throttleTimeout: NodeJS.Timeout | null = null;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
        setMousePosition({ x, y });
        throttleTimeout = null;
      }, 16); // ~60fps
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [isMobile]);

  // Smooth animation loop for interpolating values
  useEffect(() => {
    const animate = () => {
      const lerp = 0.08;
      
      // Smooth lerp for all values
      currentValues.current.tiltX += (normalizedTilt.x - currentValues.current.tiltX) * lerp;
      currentValues.current.tiltY += (normalizedTilt.y - currentValues.current.tiltY) * lerp;
      currentValues.current.scrollY += (scrollProgress - currentValues.current.scrollY) * lerp;
      currentValues.current.mouseX += (mousePosition.x - currentValues.current.mouseX) * lerp;
      currentValues.current.mouseY += (mousePosition.y - currentValues.current.mouseY) * lerp;
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [normalizedTilt.x, normalizedTilt.y, scrollProgress, mousePosition.x, mousePosition.y]);

  // Calculate layer transforms based on depth
  const getLayer = useCallback((layerDepth: number = depth): ParallaxLayer => {
    // Return static values if reduced motion is preferred
    if (prefersReducedMotion) {
      return {
        transform: 'none',
        translateX: 0,
        translateY: 0,
        translateZ: layerDepth,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        opacity: 1,
      };
    }

    const values = currentValues.current;
    
    // Depth factor: deeper layers (negative z) move less, closer layers move more
    const depthFactor = 1 + layerDepth * 0.01;
    
    // Gyroscope-based tilt (mobile) - reduced intensity
    const gyroX = values.tiltX * 10 * tiltStrength * depthFactor;
    const gyroY = values.tiltY * 10 * tiltStrength * depthFactor;
    
    // Mouse-based parallax (desktop) - reduced intensity
    const mouseOffsetX = !isMobile ? values.mouseX * 15 * mouseStrength * depthFactor : 0;
    const mouseOffsetY = !isMobile ? values.mouseY * 15 * mouseStrength * depthFactor : 0;
    
    // Scroll-based transforms
    const scrollOffsetY = values.scrollY * 50 * scrollStrength * depthFactor;
    const scrollScale = 1 - values.scrollY * 0.1 * Math.abs(depthFactor);
    
    // Combined translations
    const translateX = gyroX + mouseOffsetX;
    const translateY = gyroY + mouseOffsetY - scrollOffsetY;
    const translateZ = layerDepth;
    
    // Rotation based on tilt (subtle)
    const rotateX = values.tiltY * 2 * tiltStrength;
    const rotateY = values.tiltX * 2 * tiltStrength;
    
    // Opacity fades based on scroll
    const opacity = Math.max(0.3, 1 - values.scrollY * 0.5);
    
    return {
      transform: `
        translateX(${translateX}px) 
        translateY(${translateY}px) 
        translateZ(${translateZ}px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        scale(${scrollScale})
      `.trim(),
      translateX,
      translateY,
      translateZ,
      rotateX,
      rotateY,
      scale: scrollScale,
      opacity,
    };
  }, [depth, tiltStrength, scrollStrength, mouseStrength, isMobile, prefersReducedMotion]);

  // Predefined layer presets
  const layers = {
    /** Background layer - moves least */
    background: getLayer(-100),
    /** Far layer */
    far: getLayer(-50),
    /** Mid layer */
    mid: getLayer(-25),
    /** Near layer */
    near: getLayer(0),
    /** Foreground layer - moves most */
    foreground: getLayer(50),
    /** UI layer - for badges, buttons */
    ui: getLayer(75),
  };

  return {
    layers,
    getLayer,
    scrollProgress,
    normalizedTilt,
    hasGyroscope,
    isMobile,
  };
}
