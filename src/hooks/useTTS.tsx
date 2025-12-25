import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface UseTTSOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTTS(options: UseTTSOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const speak = useCallback(async (text: string, voiceId?: string) => {
    // Stop any current playback
    cleanup();
    
    if (!text || text.trim().length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voiceId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        options.onStart?.();
      };

      audio.onended = () => {
        setIsSpeaking(false);
        options.onEnd?.();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        const errorMsg = 'Audio playback failed';
        options.onError?.(errorMsg);
        toast.error(errorMsg);
      };

      await audio.play();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'TTS failed';
      console.error('TTS error:', error);
      options.onError?.(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup, options]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    setVolume,
  };
}
