import { useState, memo, useMemo } from "react";
import { Message } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  Check,
  RefreshCw,
  Pencil,
  Star,
  ThumbsUp,
  ThumbsDown,
  User,
  Sparkles,
  Trash2,
  Pin,
  GitBranch,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { MessageAttachments, type Attachment } from "./MessageAttachments";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { messageService } from "@/services/messageService";
import { lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Lazy load DeleteConfirmDialog
const DeleteConfirmDialog = lazy(() => 
  import("@/components/dialogs/DeleteConfirmDialog").then(m => ({ default: m.DeleteConfirmDialog }))
);

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onPin?: (isPinned: boolean) => void;
  onBranch?: (messageId: string) => void;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming,
  onRegenerate,
  onEdit,
  onDelete,
  onPin,
  onBranch,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isStarred, setIsStarred] = useState(message.is_starred);
  const [isPinned, setIsPinned] = useState(message.is_pinned);
  const [helpfulState, setHelpfulState] = useState<boolean | null>(message.is_helpful);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const isMobile = useIsMobile();
  const isUser = message.role === "user";

  // Extract attachments from metadata - memoized for performance
  const attachments: Attachment[] = useMemo(() => 
    (message.metadata as { attachments?: Attachment[] } | null)?.attachments || [],
    [message.metadata]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStar = async () => {
    const newValue = !isStarred;
    setIsStarred(newValue);
    try {
      await messageService.star(message.id, newValue);
      toast.success(newValue ? "Message starred" : "Message unstarred");
    } catch {
      setIsStarred(!newValue);
      toast.error("Failed to update message");
    }
  };

  const handlePin = async () => {
    const newValue = !isPinned;
    setIsPinned(newValue);
    onPin?.(newValue);
  };

  const handleHelpful = async (value: boolean) => {
    const newValue = helpfulState === value ? null : value;
    setHelpfulState(newValue);
    try {
      await messageService.setHelpful(message.id, newValue);
      if (newValue === true) toast.success("Thanks for the feedback!");
      else if (newValue === false) toast.success("Feedback recorded");
    } catch {
      setHelpfulState(helpfulState);
      toast.error("Failed to save feedback");
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.();
  };

  // Mobile action menu component
  const MobileActionsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 touch-manipulation active:scale-95"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isUser ? "end" : "start"} className="w-48">
        <DropdownMenuItem onClick={handleCopy} className="gap-2">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          Copy
        </DropdownMenuItem>
        
        {!isUser && (
          <>
            <DropdownMenuItem onClick={onRegenerate} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleHelpful(true)} className="gap-2">
              <ThumbsUp className={cn("h-4 w-4", helpfulState === true && "fill-current text-green-500")} />
              Helpful
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleHelpful(false)} className="gap-2">
              <ThumbsDown className={cn("h-4 w-4", helpfulState === false && "fill-current text-destructive")} />
              Not helpful
            </DropdownMenuItem>
          </>
        )}
        
        {isUser && (
          <DropdownMenuItem onClick={() => onEdit?.(message.content)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit & Resend
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handlePin} className="gap-2">
          <Pin className={cn("h-4 w-4", isPinned && "fill-current text-primary")} />
          {isPinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleStar} className="gap-2">
          <Star className={cn("h-4 w-4", isStarred && "fill-yellow-500 text-yellow-500")} />
          {isStarred ? "Unstar" : "Star"}
        </DropdownMenuItem>
        
        {onBranch && (
          <DropdownMenuItem onClick={() => onBranch(message.id)} className="gap-2">
            <GitBranch className="h-4 w-4" />
            Branch from here
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => setShowDeleteDialog(true)} 
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div
        className={cn(
          "group relative flex gap-3 md:gap-4 animate-fade-in",
          isUser ? "flex-row-reverse" : "flex-row",
          isPinned && "border-l-2 border-primary pl-2"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted border border-border/50"
          )}
        >
          {isUser ? (
            <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
          )}
        </div>

        {/* Message Content */}
        <div
          className={cn(
            "flex-1 min-w-0 space-y-1.5 md:space-y-2",
            isUser && "flex flex-col items-end"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs text-muted-foreground",
              isUser && "flex-row-reverse"
            )}
          >
            <span className="font-medium">
              {isUser ? "You" : "Lovable AI"}
            </span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
              })}
            </span>
            {message.model && !isUser && !isMobile && (
              <>
                <span>•</span>
                <span className="text-primary/70">{message.model}</span>
              </>
            )}
            {isPinned && (
              <>
                <span>•</span>
                <Pin className="h-3 w-3 text-primary" />
              </>
            )}
          </div>

          {/* Content */}
          <div
            className={cn(
              "rounded-xl px-3 py-2.5 md:px-4 md:py-3",
              isUser
                ? "bg-primary text-primary-foreground max-w-[90%] md:max-w-[85%]"
                : "bg-card/80 backdrop-blur-sm border border-border/50 w-full shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.1)] border-l-[3px] border-l-primary"
            )}
            style={!isUser ? { boxShadow: '-4px 0 20px hsl(185 100% 50% / 0.12)' } : undefined}
          >
            {isUser ? (
              <>
                {message.content && (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                <MessageAttachments attachments={attachments} isUser />
              </>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}

            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
            )}
          </div>

          {/* Actions */}
          {!isStreaming && (
            <>
              {/* Mobile: Show dropdown menu */}
              {isMobile ? (
                <div className={cn(
                  "flex items-center gap-1 mt-1",
                  isUser && "flex-row-reverse"
                )}>
                  <MobileActionsMenu />
                </div>
              ) : (
                /* Desktop: Show hover actions */
                <div
                  className={cn(
                    "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    isUser && "flex-row-reverse"
                  )}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy</TooltipContent>
                  </Tooltip>

                  {!isUser && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={onRegenerate}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Regenerate</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7", helpfulState === true && "text-green-500")}
                            onClick={() => handleHelpful(true)}
                          >
                            <ThumbsUp className={cn("h-3.5 w-3.5", helpfulState === true && "fill-current")} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Helpful</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7", helpfulState === false && "text-destructive")}
                            onClick={() => handleHelpful(false)}
                          >
                            <ThumbsDown className={cn("h-3.5 w-3.5", helpfulState === false && "fill-current")} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Not helpful</TooltipContent>
                      </Tooltip>
                    </>
                  )}

                  {isUser && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEdit?.(message.content)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit & Resend</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", isPinned && "text-primary")}
                        onClick={handlePin}
                      >
                        <Pin className={cn("h-3.5 w-3.5", isPinned && "fill-current")} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isPinned ? "Unpin" : "Pin"}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleStar}
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5",
                            isStarred && "fill-yellow-500 text-yellow-500"
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isStarred ? "Unstar" : "Star"}
                    </TooltipContent>
                  </Tooltip>

                  {onBranch && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onBranch(message.id)}
                        >
                          <GitBranch className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Branch from here</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showDeleteDialog && (
        <Suspense fallback={null}>
          <DeleteConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete Message"
            description="Are you sure you want to delete this message? This action cannot be undone."
            onConfirm={handleDelete}
            destructive
          />
        </Suspense>
      )}
    </>
  );
});
