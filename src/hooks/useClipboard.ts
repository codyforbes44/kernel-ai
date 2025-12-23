import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseClipboardOptions {
  /** Duration in ms before resetting copied state (default: 2000) */
  resetDelay?: number;
  /** Show toast notification on copy (default: true) */
  showToast?: boolean;
  /** Custom success message */
  successMessage?: string;
}

interface UseClipboardReturn {
  /** Whether the content was just copied */
  copied: boolean;
  /** Copy text to clipboard */
  copy: (text: string, message?: string) => Promise<boolean>;
  /** Reset copied state */
  reset: () => void;
}

/**
 * Hook for copying text to clipboard with visual feedback
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { 
    resetDelay = 2000, 
    showToast = true,
    successMessage = 'Copied to clipboard',
  } = options;
  
  const [copied, setCopied] = useState(false);

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  const copy = useCallback(async (text: string, message?: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      if (showToast) {
        toast.success(message || successMessage);
      }
      
      setTimeout(() => setCopied(false), resetDelay);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
      return false;
    }
  }, [resetDelay, showToast, successMessage]);

  return { copied, copy, reset };
}
