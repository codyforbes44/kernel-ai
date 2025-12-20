import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UndoAction<T> {
  /** The action to perform */
  execute: () => Promise<void> | void;
  /** The action to undo */
  undo: () => Promise<void> | void;
  /** Description shown in the toast */
  description: string;
  /** Data associated with this action (for tracking) */
  data?: T;
}

interface UseUndoActionOptions {
  /** Timeout in ms before the action becomes permanent (default: 5000) */
  timeout?: number;
}

interface UndoState<T> {
  isPending: boolean;
  data: T | null;
}

export function useUndoAction<T = unknown>(options: UseUndoActionOptions = {}) {
  const { timeout = 5000 } = options;
  const [state, setState] = useState<UndoState<T>>({ isPending: false, data: null });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const toastIdRef = useRef<string | number>();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const executeWithUndo = useCallback(async (action: UndoAction<T>) => {
    // Clear any existing pending action
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    // Execute the action
    setState({ isPending: true, data: action.data ?? null });
    await action.execute();

    // Show toast with undo option
    toastIdRef.current = toast(action.description, {
      duration: timeout,
      action: {
        label: "Undo",
        onClick: async () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setState({ isPending: false, data: null });
          await action.undo();
          toast.success("Action undone");
        },
      },
    });

    // Set timeout for when undo expires
    timeoutRef.current = setTimeout(() => {
      setState({ isPending: false, data: null });
      toastIdRef.current = undefined;
    }, timeout);
  }, [timeout]);

  const cancel = useCallback(async (undoAction?: () => Promise<void> | void) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }
    if (undoAction) {
      await undoAction();
    }
    setState({ isPending: false, data: null });
  }, []);

  return {
    executeWithUndo,
    cancel,
    isPending: state.isPending,
    pendingData: state.data,
  };
}
