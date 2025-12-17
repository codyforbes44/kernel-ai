import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Menu, Plus, MoreHorizontal, PanelRight } from "lucide-react";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
  onOpenContext: () => void;
}

export function MobileHeader({ onOpenSidebar, onOpenContext }: MobileHeaderProps) {
  const { currentConversation, currentProject, createConversation } = useWorkspace();

  const handleNewConversation = () => {
    if (currentProject) {
      createConversation(currentProject.id);
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-3 border-b border-border/50 bg-sidebar safe-area-top">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSidebar}
        className="h-10 w-10"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 min-w-0 mx-3 text-center">
        <p className="text-sm font-medium truncate">
          {currentConversation?.title || "AI Assistant"}
        </p>
        {currentProject && (
          <p className="text-xs text-muted-foreground truncate">
            {currentProject.icon} {currentProject.name}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewConversation}
          disabled={!currentProject}
          className="h-10 w-10"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenContext}
          className="h-10 w-10"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
