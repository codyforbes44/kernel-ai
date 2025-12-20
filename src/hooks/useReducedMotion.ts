import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useReducedMotion() {
  const [isLoading, setIsLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .maybeSingle();

        const prefs = data?.preferences as { reduced_motion?: boolean } | null;
        const enabled = prefs?.reduced_motion ?? false;
        
        setReducedMotion(enabled);
        
        if (enabled) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }
      } catch (error) {
        console.error('Failed to load reduced motion preference:', error);
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
        document.documentElement.classList.remove('reduce-motion');
        setReducedMotion(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { reducedMotion, isLoading };
}
