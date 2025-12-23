import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BaseDialogProps {
  /** Control dialog visibility */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  /** Header content */
  title: ReactNode;
  description?: ReactNode;
  /** Optional icon to display before title */
  icon?: LucideIcon;
  /** Icon color class */
  iconClassName?: string;
  
  /** Main dialog content */
  children: ReactNode;
  
  /** Footer buttons/content - use DialogActions for standard pattern */
  footer?: ReactNode;
  
  /** Max width variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Additional content className */
  contentClassName?: string;
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  full: 'sm:max-w-[90vw]',
};

/**
 * BaseDialog provides a consistent foundation for all dialog components.
 * Use composition to build specific dialog types on top of this.
 * 
 * @example
 * <BaseDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Create Project"
 *   description="Enter details for your new project"
 *   icon={FolderPlus}
 *   footer={<DialogActions onCancel={...} onConfirm={...} />}
 * >
 *   <FormContent />
 * </BaseDialog>
 */
export function BaseDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  footer,
  size = 'md',
  contentClassName,
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeClasses[size], contentClassName)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {Icon && <Icon className={cn('h-5 w-5', iconClassName)} />}
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="py-4">{children}</div>
        
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Dialog Action Buttons (Composable Footer)
// ============================================

export interface DialogActionsProps {
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Loading text shown during async operation */
  loadingText?: string;
  /** Confirm button handler */
  onConfirm?: () => void | Promise<void>;
  /** Cancel button handler (defaults to closing dialog) */
  onCancel?: () => void;
  /** Whether confirm action is loading */
  isLoading?: boolean;
  /** Disable confirm button */
  confirmDisabled?: boolean;
  /** Destructive styling for confirm button */
  destructive?: boolean;
  /** Hide cancel button */
  hideCancel?: boolean;
  /** Custom confirm button variant */
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Standard dialog actions with cancel/confirm pattern.
 * Handles loading states and destructive styling automatically.
 */
export function DialogActions({
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  loadingText = 'Processing...',
  onConfirm,
  onCancel,
  isLoading = false,
  confirmDisabled = false,
  destructive = false,
  hideCancel = false,
  confirmVariant,
}: DialogActionsProps) {
  const variant = confirmVariant ?? (destructive ? 'destructive' : 'default');
  
  return (
    <>
      {!hideCancel && (
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
      )}
      <Button
        variant={variant}
        onClick={onConfirm}
        disabled={confirmDisabled || isLoading}
      >
        {isLoading ? loadingText : confirmText}
      </Button>
    </>
  );
}

// ============================================
// Re-export for convenience
// ============================================

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
