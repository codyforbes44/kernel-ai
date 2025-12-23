import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Loader2, FileCode, FolderGit2 } from 'lucide-react';
import { BaseDialog, DialogActions } from './BaseDialog';
import type { BuilderProject } from '@/types/builder';

interface RemixProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceProject: BuilderProject | null;
  fileCount?: number;
  isLoadingFileCount?: boolean;
  onRemix: (newName: string, includeKnowledgeBase: boolean) => Promise<void>;
  isRemixing?: boolean;
}

export function RemixProjectDialog({
  open,
  onOpenChange,
  sourceProject,
  fileCount = 0,
  isLoadingFileCount = false,
  onRemix,
  isRemixing = false,
}: RemixProjectDialogProps) {
  const [newName, setNewName] = useState('');
  const [includeKnowledgeBase, setIncludeKnowledgeBase] = useState(true);

  const handleRemix = async () => {
    if (!newName.trim()) return;
    await onRemix(newName.trim(), includeKnowledgeBase);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isRemixing) {
      onOpenChange(isOpen);
      if (!isOpen) {
        setNewName('');
        setIncludeKnowledgeBase(true);
      }
    }
  };

  // Set default name when dialog opens
  const handleDialogOpen = () => {
    if (sourceProject && !newName) {
      setNewName(`${sourceProject.name} (Remix)`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRemixing && newName.trim()) {
      e.preventDefault();
      handleRemix();
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Remix Project"
      description="Create a copy of this project with all its files"
      icon={Copy}
      iconClassName="text-primary"
      size="md"
      contentClassName="onOpenAutoFocus"
      footer={
        <DialogActions
          onCancel={() => handleOpenChange(false)}
          onConfirm={handleRemix}
          confirmText="Create Remix"
          loadingText="Creating..."
          isLoading={isRemixing}
          confirmDisabled={!newName.trim()}
        />
      }
    >
      {sourceProject && (
        <div className="space-y-4" onFocus={handleDialogOpen}>
          {/* Source Project Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderGit2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{sourceProject.name}</p>
                <p className="text-sm text-muted-foreground">
                  {sourceProject.template || 'Custom project'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileCode className="h-4 w-4" />
                {isLoadingFileCount ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `${fileCount} files`
                )}
              </div>
            </div>
          </div>

          {/* New Project Name */}
          <div className="space-y-2">
            <Label htmlFor="remix-name">New Project Name</Label>
            <Input
              id="remix-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My remixed project"
              autoFocus
              onKeyDown={handleKeyDown}
              disabled={isRemixing}
            />
          </div>

          {/* Include Knowledge Base Option */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-kb"
              checked={includeKnowledgeBase}
              onCheckedChange={(checked) => setIncludeKnowledgeBase(checked === true)}
              disabled={isRemixing}
            />
            <Label htmlFor="include-kb" className="text-sm cursor-pointer">
              Include Knowledge Base configuration
            </Label>
          </div>
        </div>
      )}
    </BaseDialog>
  );
}
