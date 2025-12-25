import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface HapticOptions {
  enabled?: boolean;
}

export function useHapticFeedback(options: HapticOptions = { enabled: true }) {
  const { enabled = true } = options;

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!enabled) return;
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    
    try {
      navigator.vibrate(pattern);
    } catch {
      // Vibration API not available or blocked
    }
  }, [enabled]);

  const trigger = useCallback((type: HapticPattern = 'light') => {
    if (!enabled) return;

    const patterns: Record<HapticPattern, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      success: [10, 50, 10],
      warning: [20, 30, 20],
      error: [50, 100, 50],
      selection: 5,
    };

    vibrate(patterns[type]);
  }, [enabled, vibrate]);

  const triggerButton = useCallback(() => trigger('light'), [trigger]);
  const triggerSuccess = useCallback(() => trigger('success'), [trigger]);
  const triggerError = useCallback(() => trigger('error'), [trigger]);
  const triggerSelection = useCallback(() => trigger('selection'), [trigger]);

  return {
    trigger,
    triggerButton,
    triggerSuccess,
    triggerError,
    triggerSelection,
    isSupported: typeof navigator !== 'undefined' && !!navigator.vibrate,
  };
}
