import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useWorkspace } from "@/hooks/useWorkspace";
import { SortableConversationItem } from "./SortableConversationItem";
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

// Custom order storage key
const getOrderKey = (projectId: string | undefined) => 
  `conversation-order-${projectId || 'all'}`;

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [customOrder, setCustomOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(getOrderKey(currentProject?.id));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Update custom order when project changes
  useMemo(() => {
    try {
      const saved = localStorage.getItem(getOrderKey(currentProject?.id));
      if (saved) {
        setCustomOrder(JSON.parse(saved));
      } else {
        setCustomOrder([]);
      }
    } catch {
      setCustomOrder([]);
    }
  }, [currentProject?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate branch counts
  const branchCounts = useMemo(() => {
    const counts = new Map<string, number>();
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

  // Apply custom ordering to root conversations
  const sortByCustomOrder = useCallback((convs: Conversation[]) => {
    if (customOrder.length === 0) return convs;
    
    return [...convs].sort((a, b) => {
      const aIndex = customOrder.indexOf(a.id);
      const bIndex = customOrder.indexOf(b.id);
      
      // If both are in custom order, use that
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // If only one is in custom order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      // Otherwise, keep original order (by updated_at)
      return 0;
    });
  }, [customOrder]);

  // Separate pinned, root conversations, and branches
  const { pinnedConversations, rootConversations, branchConversations } = useMemo(() => {
    const pinned = filteredConversations.filter((c) => c.is_pinned && !c.parent_conversation_id);
    const root = filteredConversations.filter((c) => !c.is_pinned && !c.parent_conversation_id);
    const branches = filteredConversations.filter((c) => !c.is_pinned && c.parent_conversation_id);
    
    return {
      pinnedConversations: sortByCustomOrder(pinned),
      rootConversations: sortByCustomOrder(root),
      branchConversations: branches, // Don't sort branches
    };
  }, [filteredConversations, sortByCustomOrder]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Determine which list the items belong to
    const isPinnedItem = pinnedConversations.some(c => c.id === active.id);
    const isRootItem = rootConversations.some(c => c.id === active.id);

    let items: Conversation[];
    if (isPinnedItem) {
      items = pinnedConversations;
    } else if (isRootItem) {
      items = rootConversations;
    } else {
      return; // Don't allow reordering branches
    }

    const oldIndex = items.findIndex(c => c.id === active.id);
    const newIndex = items.findIndex(c => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    const newOrder = newItems.map(c => c.id);

    // Merge with existing order for other sections
    const allIds = [...pinnedConversations, ...rootConversations].map(c => c.id);
    const updatedOrder = isPinnedItem
      ? [...newOrder, ...rootConversations.map(c => c.id)]
      : [...pinnedConversations.map(c => c.id), ...newOrder];

    setCustomOrder(updatedOrder);
    localStorage.setItem(getOrderKey(currentProject?.id), JSON.stringify(updatedOrder));
    toast.success("Order saved");
  }, [pinnedConversations, rootConversations, currentProject?.id]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

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

  // Find active conversation for overlay
  const activeConversation = activeId 
    ? [...pinnedConversations, ...rootConversations, ...branchConversations].find(c => c.id === activeId)
    : null;

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 mx-2" delay={0} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="px-2 py-2 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" delay={50 + i * 100} />
                <Skeleton className="h-4 flex-1" delay={75 + i * 100} />
              </div>
              <Skeleton className="h-3 w-24 ml-6" delay={100 + i * 100} />
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

  const renderSortableItem = (conversation: Conversation, isDragDisabled = false) => (
    <SortableConversationItem
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
      isDragDisabled={isDragDisabled}
    />
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-3">
          {pinnedConversations.length > 0 && (
            <div className="space-y-1">
              <span className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Pinned
              </span>
              <SortableContext
                items={pinnedConversations.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {pinnedConversations.map(conv => renderSortableItem(conv))}
              </SortableContext>
            </div>
          )}

          {rootConversations.length > 0 && (
            <div className="space-y-1">
              <span className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent
              </span>
              <SortableContext
                items={rootConversations.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {rootConversations.map(conv => renderSortableItem(conv))}
              </SortableContext>
            </div>
          )}

          {branchConversations.length > 0 && (
            <div className="space-y-1">
              <span className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                Branches
              </span>
              {/* Branches are not sortable */}
              {branchConversations.map(conv => renderSortableItem(conv, true))}
            </div>
          )}
        </div>

        <DragOverlay>
          {activeConversation ? (
            <div className="bg-background border border-border rounded-md shadow-lg opacity-95">
              <ConversationItem
                conversation={activeConversation}
                isActive={false}
                branchCount={branchCounts.get(activeConversation.id) || 0}
                onSelect={() => {}}
                onRename={() => {}}
                onDelete={() => {}}
                onPin={() => {}}
                onArchive={() => {}}
                onOpenProject={() => {}}
                onCopyProjectUrl={() => {}}
                onUnlinkProject={() => {}}
                isMobile={isMobile}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
