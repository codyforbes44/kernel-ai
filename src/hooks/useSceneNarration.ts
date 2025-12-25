import { useState, useRef, useEffect, useCallback } from 'react';

interface SceneNarration {
  sceneId: string;
  audioUrl: string;
}

interface UseSceneNarrationOptions {
  narrations: SceneNarration[];
}

interface UseSceneNarrationReturn {
  isLoaded: boolean;
  isMuted: boolean;
  currentNarrationId: string | null;
  playForScene: (sceneId: string) => void;
  stopAll: () => void;
  toggleMute: () => void;
  reset: () => void;
}

export function useSceneNarration({ narrations }: UseSceneNarrationOptions): UseSceneNarrationReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentNarrationId, setCurrentNarrationId] = useState<string | null>(null);
  
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const playedScenes = useRef<Set<string>>(new Set());
  const loadedCount = useRef(0);

  // Pre-load all narration audio files
  useEffect(() => {
    loadedCount.current = 0;
    const totalNarrations = narrations.length;
    
    if (totalNarrations === 0) {
      setIsLoaded(true);
      return;
    }
    
    narrations.forEach(({ sceneId, audioUrl }) => {
      const audio = new Audio();
      audio.volume = 0.8;
      audio.preload = 'auto';
      
      const handleLoad = () => {
        loadedCount.current++;
        if (loadedCount.current >= totalNarrations) {
          setIsLoaded(true);
        }
      };

      audio.addEventListener('canplaythrough', handleLoad, { once: true });
      // Silently handle missing files - count as loaded to not block
      audio.addEventListener('error', handleLoad, { once: true });

      audio.addEventListener('ended', () => {
        setCurrentNarrationId(null);
        currentAudio.current = null;
      });

      audio.src = audioUrl;
      audioCache.current.set(sceneId, audio);
    });

    // Set loaded after a timeout if files don't exist
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => {
      clearTimeout(timeout);
      audioCache.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioCache.current.clear();
    };
  }, [narrations]);

  // Stop all narrations
  const stopAll = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
    }
    setCurrentNarrationId(null);
  }, []);

  // Play narration for a specific scene
  const playForScene = useCallback((sceneId: string) => {
    if (isMuted || playedScenes.current.has(sceneId)) return;

    const audio = audioCache.current.get(sceneId);
    if (!audio || audio.readyState < 2) return;

    // Stop any current narration
    stopAll();

    // Play new narration
    audio.currentTime = 0;
    audio.play().catch(() => {});
    
    currentAudio.current = audio;
    setCurrentNarrationId(sceneId);
    playedScenes.current.add(sceneId);
  }, [isMuted, stopAll]);

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
    stopAll();
    playedScenes.current.clear();
  }, [stopAll]);

  return {
    isLoaded,
    isMuted,
    currentNarrationId,
    playForScene,
    stopAll,
    toggleMute,
    reset,
  };
}
