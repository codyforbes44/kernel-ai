import { useState, useCallback, useRef, useEffect } from 'react';

// Auto-save delay in milliseconds
const AUTO_SAVE_DELAY = 2000;

interface UseFileAutoSaveOptions {
  onSave: (fileId: string, content: string) => Promise<void>;
}

interface UseFileAutoSaveReturn {
  fileContents: Record<string, string>;
  dirtyFiles: Set<string>;
  updateContent: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => Promise<void>;
  getContent: (fileId: string, fallback?: string) => string;
  setInitialContent: (fileId: string, content: string) => void;
  clearDirty: (fileId: string) => void;
}

/**
 * Hook for managing file content with debounced auto-save
 */
export function useFileAutoSave({ onSave }: UseFileAutoSaveOptions): UseFileAutoSaveReturn {
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
  
  // Auto-save timer refs
  const autoSaveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pendingAutoSaves = useRef<Set<string>>(new Set());
  
  // Cleanup auto-save timers on unmount
  useEffect(() => {
    return () => {
      autoSaveTimers.current.forEach(timer => clearTimeout(timer));
      autoSaveTimers.current.clear();
    };
  }, []);

  const clearDirty = useCallback((fileId: string) => {
    setDirtyFiles(prev => {
      const next = new Set(prev);
      next.delete(fileId);
      return next;
    });
  }, []);

  const setInitialContent = useCallback((fileId: string, content: string) => {
    setFileContents(prev => ({ ...prev, [fileId]: content }));
  }, []);

  const getContent = useCallback((fileId: string, fallback: string = ''): string => {
    return fileContents[fileId] !== undefined ? fileContents[fileId] : fallback;
  }, [fileContents]);

  // Perform auto-save for a file
  const performAutoSave = useCallback(async (fileId: string) => {
    const content = fileContents[fileId];
    if (content === undefined) return;
    
    pendingAutoSaves.current.add(fileId);
    try {
      await onSave(fileId, content);
      clearDirty(fileId);
    } finally {
      pendingAutoSaves.current.delete(fileId);
    }
  }, [fileContents, onSave, clearDirty]);

  // Update content with debounced auto-save
  const updateContent = useCallback((fileId: string, content: string) => {
    setFileContents(prev => ({ ...prev, [fileId]: content }));
    setDirtyFiles(prev => new Set(prev).add(fileId));
    
    // Cancel existing auto-save timer for this file
    const existingTimer = autoSaveTimers.current.get(fileId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new debounced auto-save timer
    const timer = setTimeout(() => {
      autoSaveTimers.current.delete(fileId);
      performAutoSave(fileId);
    }, AUTO_SAVE_DELAY);
    
    autoSaveTimers.current.set(fileId, timer);
  }, [performAutoSave]);

  // Manual save file (immediate)
  const saveFile = useCallback(async (fileId: string) => {
    // Cancel any pending auto-save
    const existingTimer = autoSaveTimers.current.get(fileId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      autoSaveTimers.current.delete(fileId);
    }
    
    const content = fileContents[fileId];
    if (content !== undefined) {
      await onSave(fileId, content);
      clearDirty(fileId);
    }
  }, [fileContents, onSave, clearDirty]);

  return {
    fileContents,
    dirtyFiles,
    updateContent,
    saveFile,
    getContent,
    setInitialContent,
    clearDirty,
  };
}
