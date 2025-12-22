import { useEffect, useCallback } from 'react';

/**
 * Hook that warns users when they try to leave the page with unsaved changes.
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @param message - Custom message to show (browsers may ignore this)
 */
export function useUnsavedChangesWarning(
  hasUnsavedChanges: boolean,
  message = 'You have unsaved changes. Are you sure you want to leave?'
) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Modern browsers ignore custom messages for security reasons
        // but setting returnValue is still required for the dialog to show
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);
}

/**
 * Hook for managing unsaved changes confirmation dialogs
 */
export function useUnsavedChangesDialog() {
  const confirmClose = useCallback(
    (isDirty: boolean, onConfirm: () => void) => {
      if (isDirty) {
        const confirmed = window.confirm(
          'This file has unsaved changes. Are you sure you want to close it?'
        );
        if (confirmed) {
          onConfirm();
        }
      } else {
        onConfirm();
      }
    },
    []
  );

  return { confirmClose };
}
