import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SCROLL_THRESHOLD = 200;
const DISMISS_KEY = 'pwa-fab-dismissed';

export function FloatingInstallButton() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (!isMobile || !isInstallable || isInstalled || isDismissed) {
      setIsVisible(false);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, isInstallable, isInstalled, isDismissed]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    
    if (!success) {
      // If user dismissed the prompt, hide the button for this session
      sessionStorage.setItem(DISMISS_KEY, 'true');
      setIsDismissed(true);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <Button
            size="lg"
            onClick={handleInstall}
            disabled={isInstalling}
            className="rounded-full shadow-lg shadow-primary/25 gap-2 pr-5"
          >
            <Download className="w-4 h-4" />
            {isInstalling ? 'Installing...' : 'Install App'}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
