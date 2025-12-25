import { useState, useEffect } from 'react';

/**
 * Hook to track scroll progress for parallax effects and progress indicators.
 * Returns a value between 0 and 1 representing scroll progress.
 */
export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? Math.min(currentScrollY / documentHeight, 1) : 0;
      
      setScrollY(currentScrollY);
      setScrollProgress(progress);
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Get initial value

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollProgress, scrollY };
}
