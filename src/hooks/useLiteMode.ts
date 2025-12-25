import { useState, useEffect, useCallback } from 'react';

const LITE_MODE_KEY = 'kernel-lite-mode';

interface LiteModeState {
  isLiteMode: boolean;
  toggleLiteMode: () => void;
  setLiteMode: (enabled: boolean) => void;
  reason: 'user' | 'battery' | 'performance' | null;
}

export function useLiteMode(): LiteModeState {
  const [isLiteMode, setIsLiteMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(LITE_MODE_KEY);
    return stored === 'true';
  });
  const [reason, setReason] = useState<'user' | 'battery' | 'performance' | null>(null);

  // Persist preference
  useEffect(() => {
    localStorage.setItem(LITE_MODE_KEY, String(isLiteMode));
  }, [isLiteMode]);

  // Battery detection for automatic lite mode
  useEffect(() => {
    if (!('getBattery' in navigator)) return;

    const checkBattery = async () => {
      try {
        // @ts-ignore - getBattery is not in all browsers
        const battery = await navigator.getBattery();
        
        const handleBatteryChange = () => {
          // Auto-enable lite mode on low battery (< 20%) and not charging
          if (battery.level < 0.2 && !battery.charging && !isLiteMode) {
            setIsLiteMode(true);
            setReason('battery');
          }
        };

        handleBatteryChange();
        battery.addEventListener('levelchange', handleBatteryChange);
        battery.addEventListener('chargingchange', handleBatteryChange);

        return () => {
          battery.removeEventListener('levelchange', handleBatteryChange);
          battery.removeEventListener('chargingchange', handleBatteryChange);
        };
      } catch {
        // Battery API not available
      }
    };

    checkBattery();
  }, [isLiteMode]);

  const toggleLiteMode = useCallback(() => {
    setIsLiteMode(prev => !prev);
    setReason('user');
  }, []);

  const setLiteModeValue = useCallback((enabled: boolean) => {
    setIsLiteMode(enabled);
    setReason('user');
  }, []);

  return {
    isLiteMode,
    toggleLiteMode,
    setLiteMode: setLiteModeValue,
    reason,
  };
}

// Hook for network-aware optimization
export function useNetworkAware() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    if (!('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    
    const updateConnection = () => {
      setConnectionType(connection.effectiveType || 'unknown');
      setIsSlowConnection(
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.saveData === true
      );
    };

    updateConnection();
    connection.addEventListener('change', updateConnection);

    return () => {
      connection.removeEventListener('change', updateConnection);
    };
  }, []);

  return { isSlowConnection, connectionType };
}
