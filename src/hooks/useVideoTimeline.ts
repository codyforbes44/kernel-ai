import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVideoTimelineOptions {
  duration: number;
  autoPlay?: boolean;
  loop?: boolean;
  onComplete?: () => void;
}

export function useVideoTimeline({
  duration,
  autoPlay = false,
  loop = false,
  onComplete,
}: UseVideoTimelineOptions) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  const progress = currentTime / duration;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (currentTime >= duration) {
      setCurrentTime(0);
      pausedAtRef.current = 0;
    }
    startTimeRef.current = Date.now() - pausedAtRef.current * 1000;
    setIsPlaying(true);
  }, [currentTime, duration]);

  const pause = useCallback(() => {
    pausedAtRef.current = currentTime;
    setIsPlaying(false);
    clearTimer();
  }, [currentTime, clearTimer]);

  const seek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(clampedTime);
    pausedAtRef.current = clampedTime;
    if (isPlaying) {
      startTimeRef.current = Date.now() - clampedTime * 1000;
    }
  }, [duration, isPlaying]);

  const reset = useCallback(() => {
    setCurrentTime(0);
    pausedAtRef.current = 0;
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed >= duration) {
          if (loop) {
            startTimeRef.current = Date.now();
            setCurrentTime(0);
          } else {
            setCurrentTime(duration);
            setIsPlaying(false);
            clearTimer();
            onComplete?.();
          }
        } else {
          setCurrentTime(elapsed);
        }
      }, 1000 / 60); // 60fps
    }

    return () => clearTimer();
  }, [isPlaying, duration, loop, clearTimer, onComplete]);

  return {
    currentTime,
    isPlaying,
    progress,
    play,
    pause,
    seek,
    reset,
    toggle: isPlaying ? pause : play,
  };
}
