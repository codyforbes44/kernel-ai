import { useState, useRef, useCallback, useEffect } from 'react';

interface SceneNarration {
  sceneId: string;
  text: string;
  startTime: number;
}

interface UseSceneNarrationOptions {
  narrations: SceneNarration[];
  voiceId?: string;
}

interface UseSceneNarrationReturn {
  isLoading: boolean;
  isReady: boolean;
  isMuted: boolean;
  currentNarrationId: string | null;
  preloadNarrations: () => Promise<void>;
  playNarrationForScene: (sceneId: string) => void;
  stopNarration: () => void;
  toggleMute: () => void;
  reset: () => void;
}

export function useSceneNarration({ 
  narrations, 
  voiceId = 'JBFqnCBsd6RMkjVDRZzb' // George voice - clear, professional
}: UseSceneNarrationOptions): UseSceneNarrationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentNarrationId, setCurrentNarrationId] = useState<string | null>(null);
  
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const playedScenes = useRef<Set<string>>(new Set());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioCache.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioCache.current.clear();
    };
  }, []);

  // Generate TTS for a single narration
  const generateNarration = useCallback(async (narration: SceneNarration): Promise<HTMLAudioElement | null> => {
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
          body: JSON.stringify({
            text: narration.text,
            voiceId,
            model: 'eleven_turbo_v2_5',
            voiceSettings: {
              stability: 0.6,
              similarity_boost: 0.8,
              style: 0.2,
              speed: 1.0,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      
      return new Promise((resolve) => {
        audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
        audio.addEventListener('error', () => resolve(null), { once: true });
      });
    } catch (error) {
      console.error(`Failed to generate narration for ${narration.sceneId}:`, error);
      return null;
    }
  }, [voiceId]);

  // Preload all narrations
  const preloadNarrations = useCallback(async () => {
    if (isReady || isLoading) return;
    
    setIsLoading(true);
    console.log('Preloading narrations...');

    try {
      // Generate all narrations in parallel
      const results = await Promise.all(
        narrations.map(async (narration) => {
          const audio = await generateNarration(narration);
          return { sceneId: narration.sceneId, audio };
        })
      );

      // Cache successful results
      results.forEach(({ sceneId, audio }) => {
        if (audio) {
          audioCache.current.set(sceneId, audio);
        }
      });

      setIsReady(audioCache.current.size > 0);
      console.log(`Loaded ${audioCache.current.size}/${narrations.length} narrations`);
    } catch (error) {
      console.error('Failed to preload narrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [narrations, generateNarration, isReady, isLoading]);

  // Play narration for a specific scene
  const playNarrationForScene = useCallback((sceneId: string) => {
    if (isMuted || playedScenes.current.has(sceneId)) return;

    const audio = audioCache.current.get(sceneId);
    if (!audio) return;

    // Stop any current narration
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
    }

    // Play new narration
    audio.currentTime = 0;
    audio.play().catch(err => console.error('Narration play error:', err));
    
    currentAudio.current = audio;
    setCurrentNarrationId(sceneId);
    playedScenes.current.add(sceneId);

    // Clear current narration when done
    audio.onended = () => {
      setCurrentNarrationId(null);
      currentAudio.current = null;
    };
  }, [isMuted]);

  // Stop current narration
  const stopNarration = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
    }
    setCurrentNarrationId(null);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted && currentAudio.current) {
        currentAudio.current.pause();
      }
      return newMuted;
    });
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    stopNarration();
    playedScenes.current.clear();
  }, [stopNarration]);

  return {
    isLoading,
    isReady,
    isMuted,
    currentNarrationId,
    preloadNarrations,
    playNarrationForScene,
    stopNarration,
    toggleMute,
    reset,
  };
}
