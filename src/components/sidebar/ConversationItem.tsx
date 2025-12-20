import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Swipeable } from "@/components/ui/swipeable";
import {
  MessageSquare,
  MoreHorizontal,
  Pin,
  Archive,
  Trash2,
  Pencil,
  Link2,
  ExternalLink,
  Copy,
  Unlink,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@/types/database";

interface ConversationItemProps {
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
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  isActive,
  branchCount = 0,
  onSelect,
  onRename,
  onDelete,
  onPin,
  onArchive,
  onOpenProject,
  onCopyProjectUrl,
  onUnlinkProject,
  onGoToParent,
  isMobile,
}: ConversationItemProps) {
  const hasLinkedProject = !!conversation.lovable_project_url;
  const isBranch = !!conversation.parent_conversation_id;

  const itemContent = (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all duration-200",
        "hover:bg-primary/10 hover:shadow-[0_0_12px_hsl(var(--primary)/0.2)]",
        isActive && "bg-primary/15 shadow-[0_0_16px_hsl(var(--primary)/0.25)] border border-primary/20",
        !isActive && "border border-transparent",
        isBranch && "ml-3 border-l-2 border-primary/30"
      )}
      onClick={onSelect}
    >
      {isBranch ? (
        <GitBranch className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-primary/70")} />
      ) : (
        <MessageSquare className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70")} />
      )}

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm truncate transition-colors", isActive ? "font-medium text-primary" : "group-hover:text-primary/90")}>
          {conversation.title}
        </p>
        <p className={cn("text-xs truncate transition-colors", isActive ? "text-primary/70" : "text-muted-foreground")}>
          {formatDistanceToNow(new Date(conversation.updated_at), {
            addSuffix: true,
          })}
        </p>
      </div>

      {hasLinkedProject && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 flex items-center">
              <Link2 className="h-3 w-3 text-primary" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="pointer-events-none">
            <p className="text-xs">
              Linked: {conversation.lovable_project_name || "Lovable Project"}
            </p>
          </TooltipContent>
        </Tooltip>
      )}

      {branchCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 flex items-center gap-0.5 text-xs text-muted-foreground">
              <GitBranch className="h-3 w-3" />
              {branchCount}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="pointer-events-none">
            <p className="text-xs">{branchCount} branch{branchCount > 1 ? 'es' : ''}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {conversation.is_pinned && (
        <Pin className="h-3 w-3 text-primary shrink-0" />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 hover:bg-primary/15 hover:text-primary transition-all",
              isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover">
          {hasLinkedProject && (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProject();
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Project
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyProjectUrl();
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Project URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlinkProject();
                }}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Unlink Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {isBranch && onGoToParent && (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onGoToParent();
                }}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Go to Parent
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onRename();
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
          >
            <Pin className="h-4 w-4 mr-2" />
            {conversation.is_pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Wrap with swipeable on mobile
  if (isMobile) {
    return (
      <Swipeable
        leftAction={{
          icon: <Archive className="h-5 w-5" />,
          label: "Archive",
          color: "hsl(217, 91%, 60%)", // primary color
          onClick: onArchive,
        }}
        rightAction={{
          icon: <Trash2 className="h-5 w-5" />,
          label: "Delete",
          color: "hsl(0, 84%, 60%)", // destructive color
          onClick: onDelete,
        }}
        className="rounded-md"
      >
        {itemContent}
      </Swipeable>
    );
  }

  return itemContent;
});
