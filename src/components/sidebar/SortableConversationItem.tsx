import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationItem } from "./ConversationItem";
import type { Conversation } from "@/types/database";

interface SortableConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  branchCount?: number;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  onPin: () => void;
  onArchive: () => void;
  onOpenProject: () => void;
  onCopyProjectUrl: () => void;
  onUnlinkProject: () => void;
  onGoToParent?: () => void;
  isMobile?: boolean;
  isDragDisabled?: boolean;
}

export function SortableConversationItem({
  conversation,
  isDragDisabled = false,
  ...props
}: SortableConversationItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: conversation.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group/sortable",
        isDragging && "z-50 opacity-90"
      )}
    >
      {!isDragDisabled && !props.isMobile && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 p-1 cursor-grab active:cursor-grabbing",
            "opacity-0 group-hover/sortable:opacity-100 transition-opacity",
            "text-muted-foreground hover:text-foreground",
            isDragging && "opacity-100"
          )}
        >
          <GripVertical className="h-3 w-3" />
        </div>
      )}
      <ConversationItem conversation={conversation} {...props} />
    </div>
  );
}
