import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { PERSONALITY_VOICE_MAP, DEFAULT_VOICE_SETTINGS } from '@/constants/companion';

interface UseCompanionVoiceOptions {
  personalityType: string;
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
  };
}

export function useCompanionVoice({ personalityType, voiceSettings }: UseCompanionVoiceOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    stop();
    setIsLoading(true);
    
    try {
      const voiceId = PERSONALITY_VOICE_MAP[personalityType] || PERSONALITY_VOICE_MAP.mentor;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text,
            voiceId,
            model: 'eleven_turbo_v2_5',
            voiceSettings: {
              stability: voiceSettings?.stability ?? DEFAULT_VOICE_SETTINGS.stability,
              similarity_boost: voiceSettings?.similarity_boost ?? DEFAULT_VOICE_SETTINGS.similarity_boost,
              style: voiceSettings?.style ?? DEFAULT_VOICE_SETTINGS.style,
              speed: voiceSettings?.speed ?? 1.0,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Apply playback rate for speed (in addition to API speed parameter)
      const speed = voiceSettings?.speed ?? 1.0;
      if (speed !== 1.0) {
        audio.playbackRate = speed;
      }
      
      audio.onended = () => {
        setIsPlaying(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        toast.error('Failed to play audio');
      };
      
      setIsPlaying(true);
      await audio.play();
    } catch (error) {
      console.error('Voice playback error:', error);
      toast.error('Failed to generate voice');
    } finally {
      setIsLoading(false);
    }
  }, [personalityType, voiceSettings, stop]);

  return { speak, stop, isPlaying, isLoading };
}
