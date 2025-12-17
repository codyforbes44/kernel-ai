import { useState } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useConversationActions } from "@/hooks/useConversationActions";
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
  PinOff,
  Archive,
  Trash2,
  Download,
  Share2,
  Copy,
  Link2,
  Unlink,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { LinkProjectDialog } from "./LinkProjectDialog";
import { RenameDialog } from "@/components/dialogs/RenameDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { ExportDialog } from "@/components/dialogs/ExportDialog";

export function ChatHeader() {
  const { currentConversation, currentProject } = useWorkspace();
  const actions = useConversationActions(currentConversation);
  
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  if (!currentConversation) {
    return (
      <div className="h-14 border-b border-border/50 flex items-center justify-center px-4">
        <span className="text-sm text-muted-foreground">
          Select or create a conversation to start chatting
        </span>
      </div>
    );
  }

  const hasLinkedProject = !!currentConversation.lovable_project_url;

  return (
    <>
      <div className="h-14 border-b border-border/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3 min-w-0">
          <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
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
          {hasLinkedProject && (
            <a
              href={currentConversation.lovable_project_url!}
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setLinkDialogOpen(true)}>
                {hasLinkedProject ? (
                  <>
                    <Unlink className="h-4 w-4 mr-2" />
                    Manage Project
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Link Project
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.handlePin}>
                {currentConversation.is_pinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={actions.handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={actions.handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
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
        onLink={actions.handleLinkProject}
        onUnlink={actions.handleUnlinkProject}
      />

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        title="Rename Conversation"
        currentName={currentConversation.title}
        onRename={actions.handleRename}
        type="conversation"
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Conversation"
        description={`Are you sure you want to delete "${currentConversation.title}"? This will permanently delete all messages.`}
        onConfirm={actions.handleDelete}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        conversationId={currentConversation.id}
        conversationTitle={currentConversation.title}
      />
    </>
  );
}
