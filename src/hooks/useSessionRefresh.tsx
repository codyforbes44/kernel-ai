import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getServiceWorkerRegistration } from './usePWA';
import { forceRefresh } from '@/lib/forceRefresh';

/**
 * Hook that checks for app updates when a user signs in.
 * If an update is available, it automatically refreshes to get the latest version.
 */
export function useSessionRefresh() {
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      // Only trigger on sign-in events, and only once per session
      if (event === 'SIGNED_IN' && !hasCheckedRef.current) {
        hasCheckedRef.current = true;
        logger.log('User signed in, checking for app updates...');
        
        try {
          const registration = getServiceWorkerRegistration();
          
          if (registration) {
            // Force an update check
            await registration.update();
            
            // Check if there's a waiting service worker (update available)
            if (registration.waiting) {
              logger.log('Update available, refreshing app...');
              toast.info('Updating to latest version...', { duration: 2000 });
              
              // Give toast time to show, then refresh
              setTimeout(() => {
                forceRefresh();
              }, 1500);
              return;
            }
          }
          
          // No service worker update, but check if we might have stale content
          // by comparing last known version (could be expanded with version tracking)
          logger.log('No pending updates found on sign-in');
        } catch (error) {
          logger.error('Error checking for updates on sign-in:', error);
        }
      }
      
      // Reset the flag on sign-out so next sign-in triggers a check
      if (event === 'SIGNED_OUT') {
        hasCheckedRef.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
