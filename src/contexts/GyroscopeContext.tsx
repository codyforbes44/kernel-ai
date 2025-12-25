import { createContext, useContext, ReactNode } from 'react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface GyroscopeContextValue {
  tiltX: number; // -1 to 1 (left/right)
  tiltY: number; // -1 to 1 (forward/back)
  isSupported: boolean;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
}

const GyroscopeContext = createContext<GyroscopeContextValue>({
  tiltX: 0,
  tiltY: 0,
  isSupported: false,
  isPermissionGranted: false,
  requestPermission: async () => false,
});

export function GyroscopeProvider({ children }: { children: ReactNode }) {
  const { normalizedTilt, isSupported, isPermissionGranted, requestPermission } = useDeviceOrientation();

  return (
    <GyroscopeContext.Provider
      value={{
        tiltX: normalizedTilt.x,
        tiltY: normalizedTilt.y,
        isSupported,
        isPermissionGranted,
        requestPermission,
      }}
    >
      {children}
    </GyroscopeContext.Provider>
  );
}

export function useGyroscope() {
  return useContext(GyroscopeContext);
}
