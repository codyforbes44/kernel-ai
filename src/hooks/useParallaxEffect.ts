import { useEffect, useRef, useState, useCallback } from 'react';

interface ParallaxState {
  scrollY: number;
  mouseX: number;
  mouseY: number;
}

interface ParallaxConfig {
  mouseIntensity?: number;
  enableMouse?: boolean;
  enableScroll?: boolean;
}

interface UseParallaxEffectReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  scrollY: number;
  mousePosition: { x: number; y: number };
  slowParallax: number;
  mediumParallax: number;
  fastParallax: number;
}

export function useParallaxEffect(config: ParallaxConfig = {}): UseParallaxEffectReturn {
  const {
    mouseIntensity = 50,
    enableMouse = true,
    enableScroll = true,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ParallaxState>({
    scrollY: 0,
    mouseX: 0,
    mouseY: 0,
  });

  // Handle mouse move
  useEffect(() => {
    if (!enableMouse) return;
    
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = (clientX / innerWidth - 0.5) * mouseIntensity;
      const yPercent = (clientY / innerHeight - 0.5) * mouseIntensity;
      
      container.style.setProperty('--mouse-x', `${xPercent}px`);
      container.style.setProperty('--mouse-y', `${yPercent}px`);
      
      setState(prev => ({
        ...prev,
        mouseX: xPercent,
        mouseY: yPercent,
      }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableMouse, mouseIntensity]);

  // Handle scroll
  useEffect(() => {
    if (!enableScroll) return;

    const handleScroll = () => {
      setState(prev => ({
        ...prev,
        scrollY: window.scrollY,
      }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScroll]);

  // Calculate parallax multipliers
  const slowParallax = state.scrollY * 0.5;
  const mediumParallax = state.scrollY * 0.8;
  const fastParallax = state.scrollY * 1.2;

  return {
    containerRef,
    scrollY: state.scrollY,
    mousePosition: { x: state.mouseX, y: state.mouseY },
    slowParallax,
    mediumParallax,
    fastParallax,
  };
}

// Performance hook for responsive sizing
export function usePerformanceMode() {
  const [state, setState] = useState({
    isSmallScreen: false,
    isVerySmallScreen: false,
  });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setState({
        isSmallScreen: width < 768,
        isVerySmallScreen: width < 480,
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  type DetailLevel = 'full' | 'simplified' | 'minimal';
  
  const detailLevel: DetailLevel = state.isVerySmallScreen 
    ? 'minimal' 
    : state.isSmallScreen 
      ? 'simplified' 
      : 'full';

  return {
    ...state,
    detailLevel,
    maxGlow: state.isSmallScreen ? 2 : 3,
  };
}
