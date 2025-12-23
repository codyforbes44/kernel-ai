import { useRef, useCallback, useEffect } from 'react';
import { hapticFeedback } from '@/hooks/useHaptic';

interface SwipeConfig {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

export function useMobileGestures(config: SwipeConfig = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = config;

  const touchState = useRef<TouchState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchState.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;

    // Only register swipes that happen quickly (< 300ms)
    if (deltaTime > 300) {
      touchState.current = null;
      return;
    }

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if horizontal or vertical swipe
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        hapticFeedback('light');
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        hapticFeedback('light');
        onSwipeLeft();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        hapticFeedback('light');
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        hapticFeedback('light');
        onSwipeUp();
      }
    }

    touchState.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return { containerRef };
}

// Hook for simple swipe toggle between two states
export function useSwipeToggle(
  isActive: boolean,
  onToggle: () => void,
  options: { direction?: 'horizontal' | 'vertical' } = {}
) {
  const { direction = 'horizontal' } = options;

  const config: SwipeConfig = direction === 'horizontal'
    ? {
        onSwipeLeft: isActive ? undefined : onToggle,
        onSwipeRight: isActive ? onToggle : undefined,
      }
    : {
        onSwipeUp: isActive ? undefined : onToggle,
        onSwipeDown: isActive ? onToggle : undefined,
      };

  return useMobileGestures(config);
}
