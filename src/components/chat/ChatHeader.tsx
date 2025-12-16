import { useState } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Pin,
  Archive,
  Trash2,
  Download,
  Share2,
  Copy,
  Link2,
  ExternalLink,
} from "lucide-react";
import { LinkProjectDialog } from "./LinkProjectDialog";

export function ChatHeader() {
  const { currentConversation, currentProject, updateConversation } = useWorkspace();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  if (!currentConversation) {
    return (
      <div className="h-14 border-b border-border/50 flex items-center justify-center px-4">
        <span className="text-sm text-muted-foreground">
          Select or create a conversation to start chatting
        </span>
      </div>
    );
  }

  const handleLinkProject = async (url: string, name: string) => {
    await updateConversation(currentConversation.id, {
      lovable_project_url: url,
      lovable_project_name: name,
    });
  };

  const handleUnlinkProject = async () => {
    await updateConversation(currentConversation.id, {
      lovable_project_url: null,
      lovable_project_name: null,
    });
  };

  return (
    <>
      <div className="h-14 border-b border-border/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3 min-w-0">
          {currentProject && (
            <>
              <span className="text-sm text-muted-foreground shrink-0">
                {currentProject.icon} {currentProject.name}
              </span>
              <span className="text-muted-foreground">/</span>
            </>
          )}
          <h1 className="text-sm font-medium truncate">
            {currentConversation.title}
          </h1>
          {currentConversation.is_pinned && (
            <Pin className="h-3 w-3 text-primary shrink-0" />
          )}
          {currentConversation.lovable_project_url && (
            <a
              href={currentConversation.lovable_project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80">
                <Link2 className="h-3 w-3" />
                {currentConversation.lovable_project_name || "Linked Project"}
                <ExternalLink className="h-3 w-3" />
              </Badge>
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {currentConversation.message_count || 0} messages
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLinkDialogOpen(true)}>
                <Link2 className="h-4 w-4 mr-2" />
                {currentConversation.lovable_project_url ? "Manage Linked Project" : "Link Lovable Project"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pin className="h-4 w-4 mr-2" />
                {currentConversation.is_pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LinkProjectDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        currentUrl={currentConversation.lovable_project_url}
        currentName={currentConversation.lovable_project_name}
        onLink={handleLinkProject}
        onUnlink={handleUnlinkProject}
      />
    </>
  );
}
