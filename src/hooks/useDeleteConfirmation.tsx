import { useState, useCallback, ReactNode } from 'react';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';

interface DeleteConfirmationConfig {
  title: string;
  description: string | ((item: unknown) => string);
  confirmText?: string;
  cancelText?: string;
  impactItems?: string[] | ((item: unknown) => string[]);
  showDontAskAgain?: boolean;
  onDontAskAgainChange?: (checked: boolean) => void;
}

interface UseDeleteConfirmationOptions<T> {
  /** Function to execute when deletion is confirmed */
  onDelete: (item: T) => Promise<void> | void;
  /** Configuration for the confirmation dialog */
  config: DeleteConfirmationConfig;
  /** Optional callback after successful deletion */
  onSuccess?: (item: T) => void;
  /** Optional callback on deletion error */
  onError?: (error: unknown, item: T) => void;
}

interface UseDeleteConfirmationReturn<T> {
  /** Open the delete confirmation dialog for an item */
  confirmDelete: (item: T) => void;
  /** Whether a deletion is in progress */
  isDeleting: boolean;
  /** The dialog component to render */
  DeleteDialog: () => ReactNode;
  /** Close the dialog without deleting */
  cancelDelete: () => void;
  /** The item currently being confirmed for deletion */
  itemToDelete: T | null;
}

/**
 * Hook for managing delete confirmation dialogs with consistent UX.
 * 
 * @example
 * ```tsx
 * const { confirmDelete, isDeleting, DeleteDialog } = useDeleteConfirmation({
 *   onDelete: async (item) => {
 *     await supabase.from('items').delete().eq('id', item.id);
 *   },
 *   config: {
 *     title: 'Delete Item',
 *     description: (item) => `Are you sure you want to delete "${item.name}"?`,
 *     impactItems: ['This action cannot be undone'],
 *   },
 *   onSuccess: () => toast.success('Item deleted'),
 * });
 * 
 * return (
 *   <>
 *     <Button onClick={() => confirmDelete(item)}>Delete</Button>
 *     <DeleteDialog />
 *   </>
 * );
 * ```
 */
export function useDeleteConfirmation<T>({
  onDelete,
  config,
  onSuccess,
  onError,
}: UseDeleteConfirmationOptions<T>): UseDeleteConfirmationReturn<T> {
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = useCallback((item: T) => {
    setItemToDelete(item);
  }, []);

  const cancelDelete = useCallback(() => {
    setItemToDelete(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(itemToDelete);
      onSuccess?.(itemToDelete);
      setItemToDelete(null);
    } catch (error) {
      onError?.(error, itemToDelete);
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete, onDelete, onSuccess, onError]);

  const getDescription = useCallback(() => {
    if (typeof config.description === 'function') {
      return config.description(itemToDelete);
    }
    return config.description;
  }, [config.description, itemToDelete]);

  const getImpactItems = useCallback(() => {
    if (!config.impactItems) return undefined;
    if (typeof config.impactItems === 'function') {
      return config.impactItems(itemToDelete);
    }
    return config.impactItems;
  }, [config.impactItems, itemToDelete]);

  const DeleteDialog = useCallback(() => {
    return (
      <DeleteConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && cancelDelete()}
        title={config.title}
        description={getDescription()}
        onConfirm={handleConfirm}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        impactItems={getImpactItems()}
        showDontAskAgain={config.showDontAskAgain}
        onDontAskAgainChange={config.onDontAskAgainChange}
        isLoading={isDeleting}
      />
    );
  }, [
    itemToDelete,
    cancelDelete,
    config.title,
    config.confirmText,
    config.cancelText,
    config.showDontAskAgain,
    config.onDontAskAgainChange,
    getDescription,
    getImpactItems,
    handleConfirm,
    isDeleting,
  ]);

  return {
    confirmDelete,
    isDeleting,
    DeleteDialog,
    cancelDelete,
    itemToDelete,
  };
}

// Convenience types for common delete scenarios
export type DeleteHandler<T> = (item: T) => Promise<void> | void;

/**
 * Preset configurations for common delete scenarios
 */
export const deleteConfigs = {
  conversation: {
    title: 'Delete Conversation',
    description: 'This will permanently delete this conversation and all its messages. This action cannot be undone.',
  },
  project: {
    title: 'Delete Project',
    description: (project: { name: string }) => 
      `Are you sure you want to delete "${project.name}"? This will permanently delete the project and all its files.`,
  },
  template: {
    title: 'Delete Template',
    description: (template: { name: string }) =>
      `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
  },
  file: {
    title: 'Delete File',
    description: (file: { name: string }) =>
      `Are you sure you want to delete "${file.name}"? This action cannot be undone.`,
  },
} as const;
