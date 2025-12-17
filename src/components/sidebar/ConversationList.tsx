import { useState } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  MoreHorizontal,
  Pin,
  Archive,
  Trash2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { RenameDialog } from "@/components/dialogs/RenameDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { toast } from "sonner";
import type { Conversation } from "@/types/database";

interface ConversationListProps {
  searchQuery: string;
}

export function ConversationList({ searchQuery }: ConversationListProps) {
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    currentProject,
    updateConversation,
    deleteConversation,
  } = useWorkspace();

  const [renameDialog, setRenameDialog] = useState<Conversation | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Conversation | null>(null);

  const filteredConversations = conversations
    .filter((conv) => {
      if (!currentProject) return true;
      return conv.project_id === currentProject.id;
    })
    .filter((conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pinnedConversations = filteredConversations.filter((c) => c.is_pinned);
  const regularConversations = filteredConversations.filter((c) => !c.is_pinned);

  const handleRename = async (newName: string) => {
    if (!renameDialog) return;
    await updateConversation(renameDialog.id, { title: newName });
    toast.success("Conversation renamed");
    setRenameDialog(null);
  };

  const handlePin = async (conversation: Conversation) => {
    const newPinned = !conversation.is_pinned;
    await updateConversation(conversation.id, { is_pinned: newPinned });
    toast.success(newPinned ? "Conversation pinned" : "Conversation unpinned");
  };

  const handleArchive = async (conversation: Conversation) => {
    await updateConversation(conversation.id, { is_archived: true });
    toast.success("Conversation archived");
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    await deleteConversation(deleteDialog.id);
    toast.success("Conversation deleted");
    setDeleteDialog(null);
  };

  const renderConversation = (conversation: Conversation) => {
    const isActive = currentConversation?.id === conversation.id;

    return (
      <div
        key={conversation.id}
        className={cn(
          "group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer",
          "hover:bg-sidebar-accent transition-colors",
          isActive && "bg-sidebar-accent"
        )}
        onClick={() => setCurrentConversation(conversation)}
      >
        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm truncate",
              isActive && "font-medium"
            )}
          >
            {conversation.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {formatDistanceToNow(new Date(conversation.updated_at), {
              addSuffix: true,
            })}
          </p>
        </div>

        {conversation.is_pinned && (
          <Pin className="h-3 w-3 text-primary shrink-0" />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setRenameDialog(conversation);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handlePin(conversation);
              }}
            >
              <Pin className="h-4 w-4 mr-2" />
              {conversation.is_pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleArchive(conversation);
              }}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialog(conversation);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  if (filteredConversations.length === 0) {
    return (
      <div className="px-2 py-4 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No conversations yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start a new conversation to get going
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {pinnedConversations.length > 0 && (
          <div className="space-y-1">
            <span className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
            {pinnedConversations.map(renderConversation)}
          </div>
        )}

        {regularConversations.length > 0 && (
          <div className="space-y-1">
            <span className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent
            </span>
            {regularConversations.map(renderConversation)}
          </div>
        )}
      </div>

      <RenameDialog
        open={!!renameDialog}
        onOpenChange={(open) => !open && setRenameDialog(null)}
        currentName={renameDialog?.title || ""}
        onRename={handleRename}
        title="Rename Conversation"
      />

      <DeleteConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        title="Delete Conversation"
        description="This will permanently delete this conversation and all its messages. This action cannot be undone."
        onConfirm={handleDelete}
        destructive
      />
    </>
  );
}
