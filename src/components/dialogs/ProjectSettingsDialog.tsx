import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Globe, Lock, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    description?: string | null;
    is_public?: boolean | null;
  } | null;
  onSave: (updates: { name?: string; description?: string; is_public?: boolean }) => Promise<void>;
  onDelete: () => void;
  isSaving?: boolean;
}

export function ProjectSettingsDialog({
  open,
  onOpenChange,
  project,
  onSave,
  onDelete,
  isSaving = false,
}: ProjectSettingsDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLocalSaving, setIsLocalSaving] = useState(false);

  // Sync state when project changes or dialog opens
  useEffect(() => {
    if (project && open) {
      setName(project.name || '');
      setDescription(project.description || '');
      setIsPublic(project.is_public || false);
      setHasChanges(false);
    }
  }, [project, open]);

  // Track changes
  useEffect(() => {
    if (!project) return;
    const changed =
      name !== (project.name || '') ||
      description !== (project.description || '') ||
      isPublic !== (project.is_public || false);
    setHasChanges(changed);
  }, [name, description, isPublic, project]);

  const handleSave = useCallback(async () => {
    if (!project || !hasChanges) return;
    
    setIsLocalSaving(true);
    try {
      const updates: { name?: string; description?: string; is_public?: boolean } = {};
      
      if (name !== project.name) updates.name = name;
      if (description !== (project.description || '')) updates.description = description;
      if (isPublic !== (project.is_public || false)) updates.is_public = isPublic;
      
      await onSave(updates);
      setHasChanges(false);
    } finally {
      setIsLocalSaving(false);
    }
  }, [project, name, description, isPublic, hasChanges, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && hasChanges && !isLocalSaving) {
      e.preventDefault();
      handleSave();
    }
  }, [hasChanges, isLocalSaving, handleSave]);

  const saving = isSaving || isLocalSaving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure your project's name, description, and visibility.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Project"
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project..."
              rows={3}
              disabled={saving}
              className="resize-none"
            />
          </div>

          {/* Visibility Toggle */}
          <div className="space-y-3">
            <Label>Visibility</Label>
            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-colors",
                isPublic 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-border bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <div className="p-2 rounded-full bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-muted">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {isPublic ? 'Public Project' : 'Private Project'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPublic 
                      ? 'Anyone can view and remix this project' 
                      : 'Only you can access this project'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={saving}
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving || !name.trim()}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <Label className="text-destructive font-semibold">Danger Zone</Label>
            </div>
            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Delete Project</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this project and all its files. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={saving}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
