import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export function ChatHeader() {
  const { currentConversation, currentProject } = useWorkspace();

  if (!currentConversation) {
    return (
      <div className="h-14 border-b border-border/50 flex items-center justify-center px-4">
        <span className="text-sm text-muted-foreground">
          Select or create a conversation to start chatting
        </span>
      </div>
    );
  }

  return (
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
  );
}
