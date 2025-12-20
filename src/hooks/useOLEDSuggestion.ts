import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

const OLED_SUGGESTION_KEY = 'oled-suggestion-shown';

/**
 * Detects if the user is likely on an OLED device based on device characteristics
 */
function isLikelyOLEDDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // iPhone X and later (2017+) have OLED displays
  const isModernIPhone = /iphone/.test(userAgent) && 
    !/iphone\s?(5|6|7|8|se)/i.test(userAgent);
  
  // iPad Pro 11" and 12.9" (2024+) have OLED
  const isOLEDIPad = /ipad/.test(userAgent);
  
  // High-end Android phones commonly have OLED
  // Samsung Galaxy S/Note series, Google Pixel, OnePlus, etc.
  const isHighEndAndroid = /android/.test(userAgent) && (
    /samsung|galaxy|pixel|oneplus|huawei|oppo|vivo|xiaomi/i.test(userAgent) ||
    // Check for high DPI which is common on flagship phones
    window.devicePixelRatio >= 3
  );
  
  // Check if it's a mobile device with high pixel density (common in OLED)
  const isMobileHighDPI = /mobile|android|iphone|ipad/i.test(userAgent) && 
    window.devicePixelRatio >= 2.5;
  
  return isModernIPhone || isOLEDIPad || isHighEndAndroid || isMobileHighDPI;
}

/**
 * Check if user is on a mobile device
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) ||
    window.matchMedia('(max-width: 768px)').matches;
}

/**
 * Hook that suggests OLED mode to mobile users on their first visit
 */
export function useOLEDSuggestion() {
  const { theme, setTheme } = useTheme();
  const [hasShownSuggestion, setHasShownSuggestion] = useState(true);

  useEffect(() => {
    // Check if we've already shown the suggestion
    const alreadyShown = localStorage.getItem(OLED_SUGGESTION_KEY);
    if (alreadyShown) {
      setHasShownSuggestion(true);
      return;
    }

    // Only suggest for mobile users on non-light themes
    if (!isMobileDevice()) {
      setHasShownSuggestion(true);
      return;
    }

    // Don't suggest if already using OLED
    if (theme === 'oled') {
      localStorage.setItem(OLED_SUGGESTION_KEY, 'true');
      setHasShownSuggestion(true);
      return;
    }

    // Only suggest if likely on OLED device and using dark theme
    if (isLikelyOLEDDevice() && (theme === 'dark' || theme === 'system')) {
      // Delay the toast slightly to not interrupt initial page load
      const timer = setTimeout(() => {
        toast('OLED Mode Available', {
          description: 'Save battery with pure black backgrounds on your OLED screen.',
          duration: 8000,
          action: {
            label: 'Enable',
            onClick: () => {
              setTheme('oled');
              toast.success('OLED mode enabled');
            },
          },
          onDismiss: () => {
            localStorage.setItem(OLED_SUGGESTION_KEY, 'true');
          },
          onAutoClose: () => {
            localStorage.setItem(OLED_SUGGESTION_KEY, 'true');
          },
        });
        
        localStorage.setItem(OLED_SUGGESTION_KEY, 'true');
        setHasShownSuggestion(true);
      }, 2000);

      return () => clearTimeout(timer);
    }

    setHasShownSuggestion(true);
  }, [theme, setTheme]);

  return {
    isLikelyOLED: isLikelyOLEDDevice(),
    isMobile: isMobileDevice(),
    hasShownSuggestion,
    resetSuggestion: () => {
      localStorage.removeItem(OLED_SUGGESTION_KEY);
      setHasShownSuggestion(false);
    },
  };
}
