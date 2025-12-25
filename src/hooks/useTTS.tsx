import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
}

interface TTSOptions {
  model?: 'eleven_turbo_v2_5' | 'eleven_multilingual_v2';
  outputFormat?: 'mp3_44100_128' | 'mp3_22050_32';
  voiceSettings?: VoiceSettings;
}

interface UseTTSCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTTS(callbacks: UseTTSCallbacks = {}) {
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

  const speak = useCallback(async (text: string, voiceId?: string, options?: TTSOptions) => {
    // Stop any current playback
    cleanup();
    
    if (!text || text.trim().length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const requestBody: Record<string, unknown> = { 
        text, 
        voiceId: voiceId || 'JBFqnCBsd6RMkjVDRZzb',
      };

      // Add optional parameters
      if (options?.model) {
        requestBody.model = options.model;
      }
      if (options?.outputFormat) {
        requestBody.outputFormat = options.outputFormat;
      }
      if (options?.voiceSettings) {
        requestBody.voiceSettings = options.voiceSettings;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(requestBody),
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
        callbacks.onStart?.();
      };

      audio.onended = () => {
        setIsSpeaking(false);
        callbacks.onEnd?.();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        const errorMsg = 'Audio playback failed';
        callbacks.onError?.(errorMsg);
        toast.error(errorMsg);
      };

      await audio.play();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'TTS failed';
      console.error('TTS error:', error);
      callbacks.onError?.(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup, callbacks]);

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

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    setVolume,
    setPlaybackRate,
  };
}
