import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Loader2, FileCode, FolderGit2 } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" onOpenAutoFocus={handleDialogOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Remix Project
          </DialogTitle>
          <DialogDescription>
            Create a copy of this project with all its files
          </DialogDescription>
        </DialogHeader>

        {sourceProject && (
          <div className="space-y-4">
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
                onKeyDown={(e) => e.key === 'Enter' && !isRemixing && handleRemix()}
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isRemixing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemix}
            disabled={!newName.trim() || isRemixing}
            className="gap-2"
          >
            {isRemixing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Create Remix
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
