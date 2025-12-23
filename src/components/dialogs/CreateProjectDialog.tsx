import { useState, useEffect } from 'react';
import { FolderPlus, MessageSquarePlus } from 'lucide-react';
import { BaseDialog, DialogActions } from './BaseDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { createProject } = useWorkspace();
  const { preferences, updatePreference } = useUserPreferences();
  const [projectName, setProjectName] = useState('');
  const [autoCreateChat, setAutoCreateChat] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Sync with user preferences when dialog opens
  useEffect(() => {
    if (open) {
      setAutoCreateChat(preferences.autoCreateChatOnProject ?? true);
    }
  }, [open, preferences.autoCreateChatOnProject]);

  const handleAutoCreateChatChange = (checked: boolean) => {
    setAutoCreateChat(checked);
    updatePreference('autoCreateChatOnProject', checked);
  };

  const handleCreate = async () => {
    if (!projectName.trim()) return;

    setIsCreating(true);
    try {
      await createProject(projectName.trim(), undefined, {
        autoCreateConversation: autoCreateChat,
        conversationTitle: `${projectName.trim()} - Chat`,
      });
      setProjectName('');
      onOpenChange(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey && projectName.trim()) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Project"
      description="Create a new project to organize your conversations."
      icon={FolderPlus}
      footer={
        <DialogActions
          cancelText="Cancel"
          confirmText={isCreating ? 'Creating...' : 'Create Project'}
          onCancel={() => onOpenChange(false)}
          onConfirm={handleCreate}
          isLoading={isCreating}
          confirmDisabled={!projectName.trim()}
        />
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            placeholder="My Awesome Project"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <div className="flex items-start space-x-3 rounded-lg border border-border/50 bg-muted/30 p-4">
          <Checkbox
            id="auto-chat"
            checked={autoCreateChat}
            onCheckedChange={(checked) => handleAutoCreateChatChange(checked === true)}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label
              htmlFor="auto-chat"
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Start a chat session immediately
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically create and open a new conversation in this project
            </p>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
}
