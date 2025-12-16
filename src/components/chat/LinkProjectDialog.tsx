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
import { Link2, Unlink, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface LinkProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUrl?: string | null;
  currentName?: string | null;
  onLink: (url: string, name: string) => Promise<void>;
  onUnlink: () => Promise<void>;
}

const LOVABLE_URL_PATTERN = /^https:\/\/(www\.)?lovable\.dev\/projects\/[a-zA-Z0-9-]+/;

export function LinkProjectDialog({
  open,
  onOpenChange,
  currentUrl,
  currentName,
  onLink,
  onUnlink,
}: LinkProjectDialogProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl(currentUrl || "");
      setName(currentName || "");
    }
  }, [open, currentUrl, currentName]);

  const extractProjectId = (url: string): string | null => {
    const match = url.match(/lovable\.dev\/projects\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    // Auto-extract project ID as name if name is empty
    if (!name) {
      const projectId = extractProjectId(value);
      if (projectId) {
        setName(projectId.slice(0, 20));
      }
    }
  };

  const handleLink = async () => {
    if (!url.trim()) {
      toast.error("Please enter a project URL");
      return;
    }

    if (!LOVABLE_URL_PATTERN.test(url)) {
      toast.error("Please enter a valid Lovable project URL");
      return;
    }

    const projectName = name.trim() || extractProjectId(url) || "Linked Project";

    setIsLoading(true);
    try {
      await onLink(url.trim(), projectName);
      toast.success("Project linked successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to link project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    setIsLoading(true);
    try {
      await onUnlink();
      toast.success("Project unlinked");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to unlink project");
    } finally {
      setIsLoading(false);
    }
  };

  const isLinked = !!currentUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Link Lovable Project
          </DialogTitle>
          <DialogDescription>
            Link this conversation to an external Lovable project for context-aware assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLinked && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{currentName}</span>
                </div>
                <a
                  href={currentUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {currentUrl}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="project-url">Project URL</Label>
            <Input
              id="project-url"
              placeholder="https://lovable.dev/projects/your-project-id"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste your Lovable project URL from the browser address bar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name (optional)</Label>
            <Input
              id="project-name"
              placeholder="My Lovable Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isLinked && (
            <Button
              variant="outline"
              onClick={handleUnlink}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <Unlink className="h-4 w-4 mr-2" />
              Unlink Project
            </Button>
          )}
          <Button
            onClick={handleLink}
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto"
          >
            <Link2 className="h-4 w-4 mr-2" />
            {isLinked ? "Update Link" : "Link Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
