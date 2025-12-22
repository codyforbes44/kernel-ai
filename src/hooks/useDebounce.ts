import { useRef, useCallback, useEffect } from 'react';

/**
 * Creates a debounced version of a callback function.
 * The callback will only be invoked after the specified delay has passed
 * without the function being called again.
 */
export function useDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

/**
 * Creates a throttled version of a callback function.
 * The callback will be invoked at most once per specified interval.
 */
export function useThrottle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRunRef.current >= limit) {
      lastRunRef.current = now;
      callbackRef.current(...args);
    }
  }, [limit]);
}

/**
 * Rate limiter for async operations.
 * Limits the number of operations per time window.
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxOperations: number;
  private readonly windowMs: number;

  constructor(maxOperations: number, windowMs: number) {
    this.maxOperations = maxOperations;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    // Remove expired timestamps
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    return this.timestamps.length < this.maxOperations;
  }

  record(): void {
    this.timestamps.push(Date.now());
  }

  async waitAndProceed(): Promise<void> {
    while (!this.canProceed()) {
      // Wait until oldest operation expires
      const oldestTimestamp = this.timestamps[0];
      const waitTime = this.windowMs - (Date.now() - oldestTimestamp) + 10;
      await new Promise(resolve => setTimeout(resolve, Math.max(0, waitTime)));
      // Clean up expired timestamps
      const now = Date.now();
      this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    }
    this.record();
  }
}

/**
 * Hook that provides a rate limiter instance.
 */
export function useRateLimiter(maxOperations: number, windowMs: number): RateLimiter {
  const limiterRef = useRef<RateLimiter | null>(null);
  
  if (!limiterRef.current) {
    limiterRef.current = new RateLimiter(maxOperations, windowMs);
  }
  
  return limiterRef.current;
}
