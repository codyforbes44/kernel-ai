import { useState, useEffect, useCallback, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { logger } from '@/lib/logger';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Store the registration globally so other parts of the app can trigger updates
let swRegistration: ServiceWorkerRegistration | null = null;

export function getServiceWorkerRegistration() {
  return swRegistration;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      logger.log('SW registered:', swUrl);
      if (r) {
        swRegistration = r;
        registrationRef.current = r;
        
        // Immediate update check on registration
        r.update();
        
        // Check for updates every 5 minutes (more responsive than hourly)
        setInterval(() => {
          r.update();
        }, 5 * 60 * 1000);
        
        // Check on visibility change (app comes to foreground - important for mobile)
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            logger.log('App visible, checking for updates...');
            r.update();
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }
    },
    onRegisterError(error) {
      logger.error('SW registration error:', error);
    },
  });

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error installing app:', error);
      return false;
    }
  };

  const refreshApp = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  return {
    isInstallable,
    isInstalled,
    installApp,
    offlineReady,
    needRefresh,
    refreshApp,
    dismissUpdate,
  };
}
