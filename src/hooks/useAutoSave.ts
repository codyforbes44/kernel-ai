import { useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface AutoSaveOptions {
  /** Delay in ms before auto-saving (default: 2000) */
  delay?: number;
  /** Callback when save starts */
  onSaveStart?: () => void;
  /** Callback when save succeeds */
  onSaveSuccess?: () => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
  /** Whether to show toast notifications */
  showToast?: boolean;
}

interface AutoSaveState {
  /** Whether auto-save is currently pending */
  isPending: boolean;
  /** Whether auto-save is currently saving */
  isSaving: boolean;
  /** Last saved timestamp */
  lastSaved: number | null;
}

interface UseAutoSaveReturn {
  /** Trigger a debounced save */
  triggerSave: (fileId: string, content: string) => void;
  /** Force an immediate save */
  saveNow: (fileId: string, content: string) => Promise<void>;
  /** Cancel any pending saves */
  cancelPending: () => void;
  /** Current auto-save state */
  state: AutoSaveState;
}

/**
 * Hook for auto-saving file content with debouncing.
 * Provides a debounced save trigger and immediate save option.
 */
export function useAutoSave(
  saveFunction: (fileId: string, content: string) => Promise<void>,
  options: AutoSaveOptions = {}
): UseAutoSaveReturn {
  const {
    delay = 2000,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
    showToast = false,
  } = options;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveFunctionRef = useRef(saveFunction);
  const pendingRef = useRef<{ fileId: string; content: string } | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<number | null>(null);

  // Update ref when save function changes
  useEffect(() => {
    saveFunctionRef.current = saveFunction;
  }, [saveFunction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const performSave = useCallback(async (fileId: string, content: string) => {
    if (isSavingRef.current) {
      // Queue for later
      pendingRef.current = { fileId, content };
      return;
    }

    isSavingRef.current = true;
    onSaveStart?.();

    try {
      await saveFunctionRef.current(fileId, content);
      lastSavedRef.current = Date.now();
      onSaveSuccess?.();
      if (showToast) {
        toast.success('Auto-saved');
      }
    } catch (error) {
      onSaveError?.(error as Error);
      if (showToast) {
        toast.error('Auto-save failed');
      }
    } finally {
      isSavingRef.current = false;

      // Check for pending saves
      if (pendingRef.current) {
        const pending = pendingRef.current;
        pendingRef.current = null;
        await performSave(pending.fileId, pending.content);
      }
    }
  }, [onSaveStart, onSaveSuccess, onSaveError, showToast]);

  const triggerSave = useCallback((fileId: string, content: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      performSave(fileId, content);
    }, delay);
  }, [delay, performSave]);

  const saveNow = useCallback(async (fileId: string, content: string) => {
    // Clear any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    await performSave(fileId, content);
  }, [performSave]);

  const cancelPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingRef.current = null;
  }, []);

  return {
    triggerSave,
    saveNow,
    cancelPending,
    state: {
      isPending: timeoutRef.current !== null,
      isSaving: isSavingRef.current,
      lastSaved: lastSavedRef.current,
    },
  };
}
