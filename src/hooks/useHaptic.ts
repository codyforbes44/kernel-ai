import { useCallback } from "react";

type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error";

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [50, 100, 50],
};

export function useHaptic() {
  const vibrate = useCallback((pattern: HapticPattern = "light") => {
    // Check if Vibration API is supported
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(patterns[pattern]);
      } catch {
        // Silently fail if vibration is not allowed
      }
    }
  }, []);

  const light = useCallback(() => vibrate("light"), [vibrate]);
  const medium = useCallback(() => vibrate("medium"), [vibrate]);
  const heavy = useCallback(() => vibrate("heavy"), [vibrate]);
  const success = useCallback(() => vibrate("success"), [vibrate]);
  const warning = useCallback(() => vibrate("warning"), [vibrate]);
  const error = useCallback(() => vibrate("error"), [vibrate]);

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
  };
}

// Standalone function for use outside of React components
export function hapticFeedback(pattern: HapticPattern = "light") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(patterns[pattern]);
    } catch {
      // Silently fail
    }
  }
}
