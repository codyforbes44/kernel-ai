import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { FolderPlus, MessageSquarePlus } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { createProject } = useWorkspace();
  const { preferences, updatePreference } = useUserPreferences();
  const [projectName, setProjectName] = useState("");
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
    // Save preference for future sessions
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
      
      // Reset and close
      setProjectName("");
      onOpenChange(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't interfere with IME composition (for Chinese, Japanese, Korean input)
    if (e.nativeEvent.isComposing) return;
    
    if (e.key === "Enter" && !e.shiftKey && projectName.trim()) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Create a new project to organize your conversations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!projectName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
