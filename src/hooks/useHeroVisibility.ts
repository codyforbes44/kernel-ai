import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect when the hero section is visible in the viewport.
 * Used to pause 3D rendering when scrolled out of view for performance.
 */
export function useHeroVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only update if the visibility actually changed
        setIsVisible(entry.isIntersecting);
      },
      {
        // Start hiding when hero is 10% visible
        threshold: 0.1,
        // Extend root margin to preload a bit earlier
        rootMargin: '100px',
      }
    );

    observer.observe(heroRef.current);

    return () => observer.disconnect();
  }, []);

  return { heroRef, isVisible };
}
