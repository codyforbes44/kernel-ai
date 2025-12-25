import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

const OLED_SUGGESTION_KEY = 'oled-suggestion-shown';
const DIM_SUGGESTION_KEY = 'dim-suggestion-shown';

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
 * Check if it's nighttime (between 9pm and 6am)
 */
function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 21 || hour < 6;
}

/**
 * Hook that suggests OLED mode to mobile users and dim mode at night
 */
export function useOLEDSuggestion() {
  const { theme, setTheme } = useTheme();
  const [hasShownSuggestion, setHasShownSuggestion] = useState(true);

  useEffect(() => {
    // Don't suggest if already using OLED or dim
    if (theme === 'oled' || theme === 'dim') {
      setHasShownSuggestion(true);
      return;
    }

    // Check for OLED suggestion first (priority)
    const oledShown = localStorage.getItem(OLED_SUGGESTION_KEY);
    const dimShown = localStorage.getItem(DIM_SUGGESTION_KEY);

    // Only suggest for mobile users on non-light themes
    if (!isMobileDevice()) {
      // For desktop, check for dim mode suggestion at night
      if (!dimShown && isNightTime() && (theme === 'dark' || theme === 'system')) {
        const timer = setTimeout(() => {
          toast('Night Mode Available', {
            description: 'Switch to Dim mode for warmer colors and reduced eye strain.',
            duration: 8000,
            action: {
              label: 'Enable',
              onClick: () => {
                setTheme('dim');
                toast.success('Dim mode enabled');
              },
            },
            onDismiss: () => {
              localStorage.setItem(DIM_SUGGESTION_KEY, 'true');
            },
            onAutoClose: () => {
              localStorage.setItem(DIM_SUGGESTION_KEY, 'true');
            },
          });
          
          localStorage.setItem(DIM_SUGGESTION_KEY, 'true');
        }, 3000);

        return () => clearTimeout(timer);
      }
      
      setHasShownSuggestion(true);
      return;
    }

    // Mobile OLED suggestion
    if (!oledShown && isLikelyOLEDDevice() && (theme === 'dark' || theme === 'system')) {
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
    isNightTime: isNightTime(),
    hasShownSuggestion,
    resetSuggestion: () => {
      localStorage.removeItem(OLED_SUGGESTION_KEY);
      localStorage.removeItem(DIM_SUGGESTION_KEY);
      setHasShownSuggestion(false);
    },
  };
}
