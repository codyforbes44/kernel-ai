import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kernel-visual-effects-enabled';

export function useVisualEffects() {
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    // Check localStorage on initial load
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    // Default to enabled
    return true;
  });

  // Persist to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(effectsEnabled));
  }, [effectsEnabled]);

  const toggleEffects = useCallback(() => {
    setEffectsEnabled(prev => !prev);
  }, []);

  const enableEffects = useCallback(() => {
    setEffectsEnabled(true);
  }, []);

  const disableEffects = useCallback(() => {
    setEffectsEnabled(false);
  }, []);

  return {
    effectsEnabled,
    toggleEffects,
    enableEffects,
    disableEffects,
  };
}
