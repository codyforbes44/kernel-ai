import { useState, useCallback, useEffect } from 'react';

export interface QueuedPrompt {
  id: string;
  content: string;
  createdAt: Date;
}

const STORAGE_KEY = 'prompt_queue';

export function usePromptQueue() {
  const [queue, setQueue] = useState<QueuedPrompt[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setQueue(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })));
      }
    } catch (error) {
      console.error('Failed to load prompt queue:', error);
    }
  }, []);

  // Persist queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save prompt queue:', error);
    }
  }, [queue]);

  const addPrompt = useCallback((content: string) => {
    const newPrompt: QueuedPrompt = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date(),
    };
    setQueue(prev => [...prev, newPrompt]);
    return newPrompt.id;
  }, []);

  const removePrompt = useCallback((id: string) => {
    setQueue(prev => prev.filter(p => p.id !== id));
  }, []);

  const reorderPrompts = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
    setIsProcessing(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const startProcessing = useCallback(() => {
    if (queue.length > 0 && !isProcessing) {
      setIsProcessing(true);
      setCurrentIndex(0);
    }
  }, [queue.length, isProcessing]);

  const advanceQueue = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      if (next >= queue.length) {
        setIsProcessing(false);
        return 0;
      }
      return next;
    });
  }, [queue.length]);

  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    setCurrentIndex(0);
  }, []);

  const getCurrentPrompt = useCallback(() => {
    if (isProcessing && currentIndex < queue.length) {
      return queue[currentIndex];
    }
    return null;
  }, [isProcessing, currentIndex, queue]);

  return {
    queue,
    isPaused,
    isProcessing,
    currentIndex,
    queueLength: queue.length,
    addPrompt,
    removePrompt,
    reorderPrompts,
    clearQueue,
    pause,
    resume,
    togglePause,
    startProcessing,
    advanceQueue,
    stopProcessing,
    getCurrentPrompt,
  };
}
