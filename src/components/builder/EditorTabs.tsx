import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import type { OpenTab } from '@/types/builder';
import { getFileIcon } from '@/types/builder';

interface EditorTabsProps {
  tabs: OpenTab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onSaveFile?: (tabId: string) => Promise<void>;
}

export function EditorTabs({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onSaveFile,
}: EditorTabsProps) {
  const [tabToClose, setTabToClose] = useState<OpenTab | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCloseClick = useCallback((e: React.MouseEvent, tab: OpenTab) => {
    e.stopPropagation();
    if (tab.isDirty) {
      setTabToClose(tab);
    } else {
      onTabClose(tab.id);
    }
  }, [onTabClose]);

  const handleDiscardAndClose = useCallback(() => {
    if (tabToClose) {
      onTabClose(tabToClose.id);
      setTabToClose(null);
    }
  }, [tabToClose, onTabClose]);

  const handleSaveAndClose = useCallback(async () => {
    if (tabToClose && onSaveFile) {
      setIsSaving(true);
      try {
        await onSaveFile(tabToClose.id);
        onTabClose(tabToClose.id);
      } finally {
        setIsSaving(false);
        setTabToClose(null);
      }
    }
  }, [tabToClose, onSaveFile, onTabClose]);

  const handleCancelClose = useCallback(() => {
    setTabToClose(null);
  }, []);

  if (tabs.length === 0) return null;

  return (
    <>
      <div className="h-10 bg-background border-b border-border flex-shrink-0">
        <ScrollArea className="w-full">
          <div className="flex h-10">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={cn(
                  'group flex items-center gap-2 px-3 h-10 border-r border-border cursor-pointer',
                  'hover:bg-muted/50 transition-colors',
                  activeTabId === tab.id 
                    ? 'bg-background border-b-2 border-b-primary' 
                    : 'bg-muted/30'
                )}
                onClick={() => onTabSelect(tab.id)}
              >
                <span className="text-sm">{getFileIcon(tab.name, 'file')}</span>
                <span className="text-sm whitespace-nowrap flex items-center gap-1">
                  {tab.name}
                  {tab.isDirty && (
                    <span 
                      className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" 
                      title="Unsaved changes"
                    />
                  )}
                </span>
                <button
                  className={cn(
                    'ml-1 p-0.5 rounded hover:bg-destructive/20 transition-colors',
                    'opacity-0 group-hover:opacity-100',
                    activeTabId === tab.id && 'opacity-100'
                  )}
                  onClick={(e) => handleCloseClick(e, tab)}
                  title={tab.isDirty ? 'Close (unsaved changes)' : 'Close'}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={!!tabToClose} onOpenChange={(open) => !open && setTabToClose(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              "{tabToClose?.name}" has unsaved changes. Do you want to save before closing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={handleCancelClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDiscardAndClose}
            >
              Discard
            </AlertDialogAction>
            {onSaveFile && (
              <AlertDialogAction
                onClick={handleSaveAndClose}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save & Close'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
