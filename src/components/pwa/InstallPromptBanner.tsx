import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPromptBanner() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed > DISMISS_DURATION) {
        localStorage.removeItem(DISMISS_KEY);
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    if (success) {
      handleDismiss();
    }
  };

  // Only show on mobile, when installable, not installed, and not dismissed
  if (!isMobile || !isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-50 safe-area-inset-top"
      >
        <div className="bg-primary text-primary-foreground px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Install Kernel
              </p>
              <p className="text-xs opacity-80">
                Add to home screen for the best experience
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-primary-foreground hover:bg-primary-foreground/20 border border-primary-foreground/30"
              onClick={handleDismiss}
            >
              Not now
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={handleInstall}
              disabled={isInstalling}
            >
              <Download className="w-3 h-3 mr-1.5" />
              {isInstalling ? 'Installing...' : 'Install'}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
