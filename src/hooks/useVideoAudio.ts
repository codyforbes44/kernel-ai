import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVideoAudioOptions {
  audioUrl?: string;
  duration: number;
}

interface UseVideoAudioReturn {
  isLoaded: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  error: string | null;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  reset: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  syncWithTimeline: (currentTime: number, isPlaying: boolean) => void;
}

export function useVideoAudio({ audioUrl, duration }: UseVideoAudioOptions): UseVideoAudioReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSyncTime = useRef<number>(0);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audio.loop = false;

    audio.addEventListener('canplaythrough', () => {
      setIsLoaded(true);
      setError(null);
    });

    audio.addEventListener('error', () => {
      // Silently handle missing audio files - this is expected if files haven't been generated
      setError(null);
      setIsLoaded(false);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    audio.src = audioUrl;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const play = useCallback(() => {
    if (audioRef.current && isLoaded) {
      audioRef.current.play().catch(err => {
        console.error('Audio play error:', err);
      });
      setIsPlaying(true);
    }
  }, [isLoaded]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current && isLoaded) {
      const clampedTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = clampedTime;
      lastSyncTime.current = clampedTime;
    }
  }, [isLoaded, duration]);

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
      lastSyncTime.current = 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  // Sync audio playback with video timeline
  const syncWithTimeline = useCallback((currentTime: number, timelinePlaying: boolean) => {
    if (!audioRef.current || !isLoaded) return;

    const audio = audioRef.current;
    const timeDiff = Math.abs(audio.currentTime - currentTime);

    // Only sync if there's a significant difference (more than 0.3 seconds)
    if (timeDiff > 0.3) {
      audio.currentTime = currentTime;
    }

    // Sync play/pause state
    if (timelinePlaying && audio.paused) {
      audio.play().catch(err => console.error('Sync play error:', err));
      setIsPlaying(true);
    } else if (!timelinePlaying && !audio.paused) {
      audio.pause();
      setIsPlaying(false);
    }

    lastSyncTime.current = currentTime;
  }, [isLoaded]);

  return {
    isLoaded,
    isPlaying,
    isMuted,
    volume,
    error,
    play,
    pause,
    seek,
    reset,
    toggleMute,
    setVolume,
    syncWithTimeline,
  };
}
