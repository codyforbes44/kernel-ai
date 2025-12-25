import { useState, useEffect } from 'react';

interface BatteryStatus {
  isLowBattery: boolean;
  isCharging: boolean;
  level: number | null;
}

/**
 * Hook to detect battery status for performance optimization.
 * Returns isLowBattery when battery < 20% and not charging.
 */
export function useBatteryStatus(): BatteryStatus {
  const [status, setStatus] = useState<BatteryStatus>({
    isLowBattery: false,
    isCharging: true,
    level: null,
  });

  useEffect(() => {
    // Battery API is only available in some browsers
    if (!('getBattery' in navigator)) {
      return;
    }

    let battery: any = null;

    const updateBatteryStatus = () => {
      if (!battery) return;
      
      const level = battery.level;
      const charging = battery.charging;
      const isLow = level < 0.2 && !charging;
      
      setStatus({
        isLowBattery: isLow,
        isCharging: charging,
        level: Math.round(level * 100),
      });
    };

    (navigator as any).getBattery().then((bat: any) => {
      battery = bat;
      updateBatteryStatus();

      battery.addEventListener('chargingchange', updateBatteryStatus);
      battery.addEventListener('levelchange', updateBatteryStatus);
    }).catch(() => {
      // Battery API not available or blocked
    });

    return () => {
      if (battery) {
        battery.removeEventListener('chargingchange', updateBatteryStatus);
        battery.removeEventListener('levelchange', updateBatteryStatus);
      }
    };
  }, []);

  return status;
}
