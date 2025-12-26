import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Map companion personality types to ElevenLabs voice IDs
const PERSONALITY_VOICE_MAP: Record<string, string> = {
  mentor: 'EXAVITQu4vr4xnSDxMaL', // Sarah - calm, wise
  creative: 'pFZP5JQG7iQjIQuC4Bku', // Lily - energetic
  analytical: 'nPczCjzI2devNBz1zQrb', // Brian - clear, precise
  supportive: 'Xb7hH8MSUJpSbSDYk0k2', // Alice - warm, gentle
};

interface UseCompanionVoiceOptions {
  personalityType: string;
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
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
    
    // Stop any currently playing audio
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
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            text,
            voiceId,
            model: 'eleven_turbo_v2_5',
            voiceSettings: {
              stability: voiceSettings?.stability ?? 0.5,
              similarity_boost: voiceSettings?.similarity_boost ?? 0.75,
              style: voiceSettings?.style ?? 0.3,
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

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
}
