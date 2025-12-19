import { useState, useCallback, useMemo } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ConversationItem } from "./ConversationItem";
import { RenameDialog } from "@/components/dialogs/RenameDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { MessageSquare, Pin, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { openLovableProject, copyProjectUrl } from "@/lib/lovable-url";
import type { Conversation } from "@/types/database";

interface ConversationListProps {
  searchQuery: string;
  onSelect?: () => void;
  isMobile?: boolean;
}

export function ConversationList({ searchQuery, onSelect, isMobile }: ConversationListProps) {
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    currentProject,
    updateConversation,
    deleteConversation,
    getChildBranches,
  } = useWorkspace();

  const [renameDialog, setRenameDialog] = useState<Conversation | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Conversation | null>(null);

  // Calculate branch counts for each conversation
  const branchCounts = useMemo(() => {
    const counts = new Map<string, number>();
    conversations.forEach(conv => {
      counts.set(conv.id, getChildBranches(conv.id).length);
    });
    return counts;
  }, [conversations, getChildBranches]);

  const filteredConversations = conversations
    .filter((conv) => {
      if (!currentProject) return true;
      return conv.project_id === currentProject.id;
    })
    .filter((conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Separate pinned, root conversations, and branches
  const pinnedConversations = filteredConversations.filter((c) => c.is_pinned && !c.parent_conversation_id);
  const rootConversations = filteredConversations.filter((c) => !c.is_pinned && !c.parent_conversation_id);
  const branchConversations = filteredConversations.filter((c) => !c.is_pinned && c.parent_conversation_id);

  const handleRename = useCallback(async (newName: string) => {
    if (!renameDialog) return;
    await updateConversation(renameDialog.id, { title: newName });
    toast.success("Conversation renamed");
    setRenameDialog(null);
  }, [renameDialog, updateConversation]);

  const handlePin = useCallback(async (conversation: Conversation) => {
    const newPinned = !conversation.is_pinned;
    await updateConversation(conversation.id, { is_pinned: newPinned });
    toast.success(newPinned ? "Conversation pinned" : "Conversation unpinned");
  }, [updateConversation]);

  const handleArchive = useCallback(async (conversation: Conversation) => {
    await updateConversation(conversation.id, { is_archived: true });
    toast.success("Conversation archived");
  }, [updateConversation]);

  const handleDelete = useCallback(async () => {
    if (!deleteDialog) return;
    await deleteConversation(deleteDialog.id);
    toast.success("Conversation deleted");
    setDeleteDialog(null);
  }, [deleteDialog, deleteConversation]);

  const handleUnlinkProject = useCallback(async (conversation: Conversation) => {
    await updateConversation(conversation.id, {
      lovable_project_url: null,
      lovable_project_name: null,
    });
    toast.success("Project unlinked");
  }, [updateConversation]);

  const handleGoToParent = useCallback((conversation: Conversation) => {
    if (conversation.parent_conversation_id) {
      const parent = conversations.find(c => c.id === conversation.parent_conversation_id);
      if (parent) {
        setCurrentConversation(parent);
        onSelect?.();
      }
    }
  }, [conversations, setCurrentConversation, onSelect]);

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

  const renderConversationItem = (conversation: Conversation) => (
    <ConversationItem
      key={conversation.id}
      conversation={conversation}
      isActive={currentConversation?.id === conversation.id}
      branchCount={branchCounts.get(conversation.id) || 0}
      onSelect={() => {
        setCurrentConversation(conversation);
        onSelect?.();
      }}
      onRename={() => setRenameDialog(conversation)}
      onDelete={() => setDeleteDialog(conversation)}
      onPin={() => handlePin(conversation)}
      onArchive={() => handleArchive(conversation)}
      onOpenProject={() => {
        if (conversation.lovable_project_url) {
          openLovableProject(conversation.lovable_project_url);
        }
      }}
      onCopyProjectUrl={() => {
        if (conversation.lovable_project_url) {
          copyProjectUrl(conversation.lovable_project_url);
        }
      }}
      onUnlinkProject={() => handleUnlinkProject(conversation)}
      onGoToParent={conversation.parent_conversation_id ? () => handleGoToParent(conversation) : undefined}
      isMobile={isMobile}
    />
  );

  return (
    <>
      <div className="space-y-3">
        {pinnedConversations.length > 0 && (
          <div className="space-y-1">
            <span className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
            {pinnedConversations.map(renderConversationItem)}
          </div>
        )}

        {rootConversations.length > 0 && (
          <div className="space-y-1">
            <span className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent
            </span>
            {rootConversations.map(renderConversationItem)}
          </div>
        )}

        {branchConversations.length > 0 && (
          <div className="space-y-1">
            <span className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              Branches
            </span>
            {branchConversations.map(renderConversationItem)}
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
