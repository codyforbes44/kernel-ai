import { useCallback } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { conversationService } from "@/services/conversationService";
import { openLovableProject, copyProjectUrl } from "@/lib/lovable-url";
import { toast } from "sonner";
import type { Conversation } from "@/types/database";

export function useConversationActions(conversation: Conversation | null) {
  const { updateConversation, deleteConversation, refresh } = useWorkspace();

  const handlePin = useCallback(async () => {
    if (!conversation) return;
    const newPinned = !conversation.is_pinned;
    await updateConversation(conversation.id, { is_pinned: newPinned });
    toast.success(newPinned ? "Conversation pinned" : "Conversation unpinned");
  }, [conversation, updateConversation]);

  const handleArchive = useCallback(async () => {
    if (!conversation) return;
    await updateConversation(conversation.id, { is_archived: true });
    toast.success("Conversation archived");
  }, [conversation, updateConversation]);

  const handleDelete = useCallback(async () => {
    if (!conversation) return;
    await deleteConversation(conversation.id);
    toast.success("Conversation deleted");
  }, [conversation, deleteConversation]);

  const handleRename = useCallback(async (newName: string) => {
    if (!conversation) return;
    await updateConversation(conversation.id, { title: newName });
    toast.success("Conversation renamed");
  }, [conversation, updateConversation]);

  const handleDuplicate = useCallback(async () => {
    if (!conversation) return;
    try {
      await conversationService.duplicate(conversation, conversation.user_id);
      refresh();
      toast.success("Conversation duplicated");
    } catch {
      toast.error("Failed to duplicate conversation");
    }
  }, [conversation, refresh]);

  const handleLinkProject = useCallback(async (url: string, name: string) => {
    if (!conversation) return;
    await updateConversation(conversation.id, {
      lovable_project_url: url,
      lovable_project_name: name,
    });
    toast.success("Project linked");
  }, [conversation, updateConversation]);

  const handleUnlinkProject = useCallback(async () => {
    if (!conversation) return;
    await updateConversation(conversation.id, {
      lovable_project_url: null,
      lovable_project_name: null,
    });
    toast.success("Project unlinked");
  }, [conversation, updateConversation]);

  const handleOpenProject = useCallback(() => {
    if (!conversation?.lovable_project_url) return;
    openLovableProject(conversation.lovable_project_url);
  }, [conversation]);

  const handleCopyProjectUrl = useCallback(async () => {
    if (!conversation?.lovable_project_url) return;
    await copyProjectUrl(conversation.lovable_project_url);
  }, [conversation]);

  const handleShare = useCallback(async () => {
    if (!conversation) return;
    const shareUrl = `${window.location.origin}/?conversation=${conversation.id}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  }, [conversation]);

  return {
    handlePin,
    handleArchive,
    handleDelete,
    handleRename,
    handleDuplicate,
    handleLinkProject,
    handleUnlinkProject,
    handleOpenProject,
    handleCopyProjectUrl,
    handleShare,
  };
}
