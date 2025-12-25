import { useState, useEffect, useRef, useCallback } from 'react';

export interface FocusState {
  /** Whether the element is currently in the viewport center zone */
  isFocused: boolean;
  /** 0-1 value indicating how centered the element is (1 = perfectly centered) */
  focusIntensity: number;
  /** Distance from viewport center in pixels */
  distanceFromCenter: number;
  /** Visibility ratio (0-1) based on IntersectionObserver */
  visibility: number;
}

interface UseFocusedElementOptions {
  /** Threshold for center zone (0-1, default 0.3 = 30% of viewport) */
  centerThreshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Enable/disable focus tracking */
  enabled?: boolean;
}

export function useFocusedElement(options: UseFocusedElementOptions = {}) {
  const {
    centerThreshold = 0.3,
    rootMargin = '-10% 0px -10% 0px',
    enabled = true,
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const [focusState, setFocusState] = useState<FocusState>({
    isFocused: false,
    focusIntensity: 0,
    distanceFromCenter: Infinity,
    visibility: 0,
  });

  // Track scroll position for focus calculation
  useEffect(() => {
    if (!enabled) return;

    const calculateFocus = () => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      
      // Element center relative to viewport
      const elementCenter = rect.top + rect.height / 2;
      
      // Distance from viewport center
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
      
      // Center zone threshold in pixels
      const centerZoneSize = viewportHeight * centerThreshold;
      
      // Calculate focus intensity (1 at center, 0 at edge of zone)
      const focusIntensity = Math.max(0, 1 - distanceFromCenter / centerZoneSize);
      
      // Is it in the focus zone?
      const isFocused = distanceFromCenter < centerZoneSize;
      
      // Visibility (how much of element is in viewport)
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(viewportHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibility = rect.height > 0 ? visibleHeight / rect.height : 0;

      setFocusState({
        isFocused,
        focusIntensity,
        distanceFromCenter,
        visibility,
      });
    };

    // Initial calculation
    calculateFocus();

    // Throttled scroll listener
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          calculateFocus();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateFocus);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateFocus);
    };
  }, [centerThreshold, enabled]);

  // Ref setter callback
  const setRef = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  // CSS styles based on focus state
  const getFocusStyles = useCallback(() => {
    const { focusIntensity, isFocused } = focusState;
    
    // Glow intensity scales with focus
    const glowOpacity = focusIntensity * 0.3;
    const saturation = 100 + focusIntensity * 20;
    const brightness = 100 + focusIntensity * 15;
    
    return {
      filter: `saturate(${saturation}%) brightness(${brightness}%)`,
      boxShadow: isFocused 
        ? `0 0 ${30 * focusIntensity}px hsl(var(--primary) / ${glowOpacity})`
        : 'none',
      transform: `scale(${1 + focusIntensity * 0.02})`,
      transition: 'filter 0.3s ease-out, box-shadow 0.3s ease-out, transform 0.3s ease-out',
    };
  }, [focusState]);

  return {
    ref: setRef,
    focusState,
    getFocusStyles,
    isFocused: focusState.isFocused,
    focusIntensity: focusState.focusIntensity,
  };
}

// Hook for multiple elements
export function useFocusedElements() {
  const [elements, setElements] = useState<Map<string, FocusState>>(new Map());
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const calculateAllFocus = () => {
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      const centerZoneSize = viewportHeight * 0.3;
      
      const newStates = new Map<string, FocusState>();
      
      refs.current.forEach((element, id) => {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
        const focusIntensity = Math.max(0, 1 - distanceFromCenter / centerZoneSize);
        const isFocused = distanceFromCenter < centerZoneSize;
        
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibility = rect.height > 0 ? visibleHeight / rect.height : 0;
        
        newStates.set(id, {
          isFocused,
          focusIntensity,
          distanceFromCenter,
          visibility,
        });
      });
      
      setElements(newStates);
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          calculateAllFocus();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    calculateAllFocus();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const registerElement = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      refs.current.set(id, element);
    } else {
      refs.current.delete(id);
    }
  }, []);

  const getFocusState = useCallback((id: string): FocusState => {
    return elements.get(id) || {
      isFocused: false,
      focusIntensity: 0,
      distanceFromCenter: Infinity,
      visibility: 0,
    };
  }, [elements]);

  return {
    registerElement,
    getFocusState,
    elements,
  };
}
