import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ConversationItem } from "./ConversationItem";
import { MessageSquare, Pin, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { openLovableProject, copyProjectUrl } from "@/lib/lovable-url";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@/types/database";

// Lazy load dialogs
const RenameDialog = lazy(() => 
  import("@/components/dialogs/RenameDialog").then(m => ({ default: m.RenameDialog }))
);
const DeleteConfirmDialog = lazy(() => 
  import("@/components/dialogs/DeleteConfirmDialog").then(m => ({ default: m.DeleteConfirmDialog }))
);

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
    loading,
  } = useWorkspace();

  const [renameDialog, setRenameDialog] = useState<Conversation | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Conversation | null>(null);

  // Calculate branch counts - optimized to only recalculate when conversations change
  const branchCounts = useMemo(() => {
    const counts = new Map<string, number>();
    // Create a map of parent_id -> count for O(n) instead of O(n²)
    conversations.forEach(conv => {
      if (conv.parent_conversation_id) {
        const currentCount = counts.get(conv.parent_conversation_id) || 0;
        counts.set(conv.parent_conversation_id, currentCount + 1);
      }
    });
    return counts;
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv) => {
        if (!currentProject) return true;
        return conv.project_id === currentProject.id;
      })
      .filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [conversations, currentProject, searchQuery]);

  // Separate pinned, root conversations, and branches
  const { pinnedConversations, rootConversations, branchConversations } = useMemo(() => ({
    pinnedConversations: filteredConversations.filter((c) => c.is_pinned && !c.parent_conversation_id),
    rootConversations: filteredConversations.filter((c) => !c.is_pinned && !c.parent_conversation_id),
    branchConversations: filteredConversations.filter((c) => !c.is_pinned && c.parent_conversation_id),
  }), [filteredConversations]);

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

  // Show loading skeleton while fetching
  if (loading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 mx-2" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-2 py-2 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <Skeleton className="h-3 w-24 ml-6" />
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12 mx-2" />
          {[1, 2].map((i) => (
            <div key={i} className="px-2 py-2 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <Skeleton className="h-3 w-20 ml-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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

      {renameDialog && (
        <Suspense fallback={null}>
          <RenameDialog
            open={!!renameDialog}
            onOpenChange={(open) => !open && setRenameDialog(null)}
            currentName={renameDialog?.title || ""}
            onRename={handleRename}
            title="Rename Conversation"
          />
        </Suspense>
      )}

      {deleteDialog && (
        <Suspense fallback={null}>
          <DeleteConfirmDialog
            open={!!deleteDialog}
            onOpenChange={(open) => !open && setDeleteDialog(null)}
            title="Delete Conversation"
            description="This will permanently delete this conversation and all its messages. This action cannot be undone."
            onConfirm={handleDelete}
            destructive
          />
        </Suspense>
      )}
    </>
  );
}
