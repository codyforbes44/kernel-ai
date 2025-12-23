import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function UpdateNotification() {
  const { needRefresh, refreshApp, dismissUpdate, offlineReady } = usePWA();

  if (!needRefresh && !offlineReady) return null;

  return (
    <AnimatePresence>
      {(needRefresh || offlineReady) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50"
        >
          <div className="bg-card border border-border rounded-lg shadow-lg p-4">
            {needRefresh ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Update available
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      A new version is ready. Refresh to update.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-6 w-6"
                    onClick={dismissUpdate}
                    aria-label="Dismiss update notification"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={dismissUpdate}
                  >
                    Later
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={refreshApp}
                  >
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                    Refresh
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-foreground">
                  App ready for offline use
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
