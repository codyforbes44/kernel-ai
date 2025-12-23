import { useState, useEffect } from 'react';
import { Trash2, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  /** Items that will be affected by this action */
  impactItems?: string[];
  /** Show "Don't ask again" option */
  showDontAskAgain?: boolean;
  /** Callback when "Don't ask again" is checked */
  onDontAskAgainChange?: (checked: boolean) => void;
  /** Custom confirm button text */
  confirmText?: string;
  /** Custom cancel button text */
  cancelText?: string;
  /** Loading state */
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  destructive = true,
  impactItems,
  showDontAskAgain = false,
  onDontAskAgainChange,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading: externalLoading,
}: DeleteConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const isLoading = externalLoading ?? internalLoading;

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      if (dontAskAgain && onDontAskAgainChange) {
        onDontAskAgainChange(true);
      }
      await onConfirm();
      onOpenChange(false);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleDontAskAgainChange = (checked: boolean) => {
    setDontAskAgain(checked);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            {destructive && (
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="h-6 w-6 text-destructive" aria-hidden="true" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-sm">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Impact Preview */}
        {impactItems && impactItems.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">This will affect:</span>
            </div>
            <ul className="space-y-1.5 ml-6">
              {impactItems.slice(0, 5).map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
                  {item}
                </li>
              ))}
              {impactItems.length > 5 && (
                <li className="text-sm text-muted-foreground italic">
                  ...and {impactItems.length - 5} more items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Don't ask again option */}
        {showDontAskAgain && (
          <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-border/50">
            <Checkbox
              id="dont-ask-again"
              checked={dontAskAgain}
              onCheckedChange={handleDontAskAgainChange}
            />
            <Label
              htmlFor="dont-ask-again"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Don't ask me again
            </Label>
          </div>
        )}

        <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isLoading} className="mt-0">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'gap-2',
              destructive && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {destructive && <Trash2 className="h-4 w-4" />}
                {confirmText}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Quick undo banner for less critical actions
interface UndoBannerProps {
  message: string;
  onUndo: () => void;
  duration?: number;
  onExpire?: () => void;
}

export function UndoBanner({ message, onUndo, duration = 5000, onExpire }: UndoBannerProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - (100 / (duration / 100));
        if (next <= 0) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onExpire]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 bg-foreground text-background rounded-lg shadow-lg">
        <span className="text-sm">{message}</span>
        <button
          onClick={onUndo}
          className="text-sm font-medium underline underline-offset-2 hover:no-underline"
        >
          Undo
        </button>
        <div className="w-12 h-1 bg-background/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-background/60 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
