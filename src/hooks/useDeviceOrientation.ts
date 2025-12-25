import { useState, useEffect, useCallback } from 'react';

interface DeviceOrientation {
  alpha: number; // Z-axis rotation (0-360)
  beta: number;  // X-axis rotation (-180 to 180) - front/back tilt
  gamma: number; // Y-axis rotation (-90 to 90) - left/right tilt
  isSupported: boolean;
  isPermissionGranted: boolean;
}

const initialState: DeviceOrientation = {
  alpha: 0,
  beta: 0,
  gamma: 0,
  isSupported: false,
  isPermissionGranted: false,
};

/**
 * Hook to access device orientation/gyroscope data for parallax effects.
 * Returns normalized tilt values suitable for 3D scene manipulation.
 */
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientation>(initialState);
  const [smoothedOrientation, setSmoothedOrientation] = useState({ beta: 0, gamma: 0 });

  // Smoothing factor for lerping (0-1, lower = smoother but more lag)
  const smoothingFactor = 0.08;

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha ?? 0,
      beta: event.beta ?? 0,
      gamma: event.gamma ?? 0,
      isSupported: true,
      isPermissionGranted: true,
    });
  }, []);

  // Request permission for iOS 13+
  const requestPermission = useCallback(async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, { passive: true });
          setOrientation(prev => ({ ...prev, isPermissionGranted: true }));
          return true;
        }
      } catch (error) {
        console.warn('Device orientation permission denied:', error);
        return false;
      }
    }
    return false;
  }, [handleOrientation]);

  useEffect(() => {
    // Check if device orientation is supported
    const isSupported = 'DeviceOrientationEvent' in window;
    
    if (!isSupported) {
      setOrientation(prev => ({ ...prev, isSupported: false }));
      return;
    }

    // For iOS 13+, we need explicit permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setOrientation(prev => ({ ...prev, isSupported: true, isPermissionGranted: false }));
      // Don't auto-request - let the user trigger it
      return;
    }

    // For Android and older iOS, just start listening
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    setOrientation(prev => ({ ...prev, isSupported: true, isPermissionGranted: true }));

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  // Smooth the orientation values using lerp
  useEffect(() => {
    let animationId: number;

    const smoothValues = () => {
      setSmoothedOrientation(prev => ({
        beta: prev.beta + (orientation.beta - prev.beta) * smoothingFactor,
        gamma: prev.gamma + (orientation.gamma - prev.gamma) * smoothingFactor,
      }));
      animationId = requestAnimationFrame(smoothValues);
    };

    if (orientation.isPermissionGranted) {
      animationId = requestAnimationFrame(smoothValues);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [orientation.beta, orientation.gamma, orientation.isPermissionGranted]);

  // Normalize values for 3D parallax (-1 to 1 range)
  const normalizedTilt = {
    // Left/right tilt: gamma ranges -90 to 90, normalize to -1 to 1
    x: Math.max(-1, Math.min(1, smoothedOrientation.gamma / 45)),
    // Forward/back tilt: beta ranges -180 to 180, but we only care about -45 to 45
    y: Math.max(-1, Math.min(1, (smoothedOrientation.beta - 45) / 45)),
  };

  return {
    ...orientation,
    smoothedBeta: smoothedOrientation.beta,
    smoothedGamma: smoothedOrientation.gamma,
    normalizedTilt,
    requestPermission,
  };
}
