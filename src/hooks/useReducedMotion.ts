import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing reduced motion preferences.
 * Respects both system preferences and user-stored preferences.
 * Applies the appropriate CSS class to the document for animation control.
 */
export function useReducedMotion() {
  const [isLoading, setIsLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Update class on document
  const applyReducedMotion = useCallback((enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('reduce-motion');
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    } else {
      document.documentElement.classList.remove('reduce-motion');
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--transition-duration');
    }
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load user preference
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Fall back to system preference if not logged in
          setReducedMotion(prefersReducedMotion);
          applyReducedMotion(prefersReducedMotion);
          setIsLoading(false);
          return;
        }

        const { data } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .maybeSingle();

        const prefs = data?.preferences as { reduced_motion?: boolean; use_system_motion?: boolean } | null;
        
        // If user has set "use system preference", use that
        const useSystem = prefs?.use_system_motion ?? true;
        const userPref = prefs?.reduced_motion ?? false;
        const enabled = useSystem ? prefersReducedMotion : userPref;
        
        setReducedMotion(enabled);
        applyReducedMotion(enabled);
      } catch (error) {
        console.error('Failed to load reduced motion preference:', error);
        // Fall back to system preference on error
        setReducedMotion(prefersReducedMotion);
        applyReducedMotion(prefersReducedMotion);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();

    // Listen for auth state changes to reload preference
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadPreference();
      } else if (event === 'SIGNED_OUT') {
        setReducedMotion(prefersReducedMotion);
        applyReducedMotion(prefersReducedMotion);
      }
    });

    return () => subscription.unsubscribe();
  }, [prefersReducedMotion, applyReducedMotion]);

  // Update when system preference changes and user prefers system
  useEffect(() => {
    if (!isLoading) {
      // Re-check if we should update based on system preference
      // This handles the case where the user has "use system preference" enabled
    }
  }, [prefersReducedMotion, isLoading]);

  return { 
    reducedMotion, 
    isLoading,
    prefersReducedMotion,
    // Helper to check if animations should be disabled
    shouldReduceMotion: reducedMotion || prefersReducedMotion,
  };
}

/**
 * Utility function to get animation props that respect reduced motion
 */
export function getAnimationProps(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 },
    };
  }
  return {};
}

/**
 * CSS class helper for conditional animations
 */
export function motionClass(reducedMotion: boolean, animatedClass: string, fallbackClass?: string) {
  return reducedMotion ? (fallbackClass || '') : animatedClass;
}
