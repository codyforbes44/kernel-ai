import { useState } from 'react';
import { History, RotateCcw, Clock, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileVersions, FileVersion } from '@/hooks/useFileVersions';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FileVersionHistoryProps {
  fileId: string | null;
  fileName: string | null;
  currentContent: string;
  onRestore: (content: string) => void;
  onClose: () => void;
}

export function FileVersionHistory({
  fileId,
  fileName,
  currentContent,
  onRestore,
  onClose,
}: FileVersionHistoryProps) {
  const { versions, isLoading } = useFileVersions(fileId);
  const [selectedVersion, setSelectedVersion] = useState<FileVersion | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion.content);
      setShowRestoreDialog(false);
      onClose();
    }
  };

  if (!fileId) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Select a file to view its history
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium truncate">History</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* File name */}
      <div className="px-3 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">File:</span>
        <p className="text-sm font-mono truncate">{fileName}</p>
      </div>

      {/* Versions list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading versions...</div>
        ) : versions.length === 0 ? (
          <div className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No version history yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Versions are created when you save changes
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {versions.map((version) => (
              <div
                key={version.id}
                className={cn(
                  'rounded-md border border-border bg-card overflow-hidden',
                  selectedVersion?.id === version.id && 'ring-2 ring-primary'
                )}
              >
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedVersion(version);
                    setExpandedVersion(
                      expandedVersion === version.id ? null : version.id
                    );
                  }}
                >
                  {expandedVersion === version.id ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        v{version.version_number}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(version.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {version.message && (
                      <p className="text-xs text-muted-foreground truncate">
                        {version.message}
                      </p>
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {expandedVersion === version.id && (
                  <div className="border-t border-border">
                    <div className="p-2 bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-2">
                        {format(new Date(version.created_at), 'PPpp')}
                      </div>
                      <pre className="text-xs font-mono bg-background p-2 rounded border max-h-[150px] overflow-auto whitespace-pre-wrap">
                        {version.content.slice(0, 500)}
                        {version.content.length > 500 && '...'}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => setShowRestoreDialog(true)}
                      >
                        <RotateCcw className="h-3 w-3 mr-2" />
                        Restore this version
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Restore confirmation dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore version {selectedVersion?.version_number}?</DialogTitle>
            <DialogDescription>
              This will replace the current file content with this version. The
              current content will be saved as a new version before restoring.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestore}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
