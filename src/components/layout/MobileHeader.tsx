import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useHaptic } from "@/hooks/useHaptic";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Menu, Plus, PanelRight, WifiOff } from "lucide-react";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
  onOpenContext: () => void;
}

export function MobileHeader({ onOpenSidebar, onOpenContext }: MobileHeaderProps) {
  const { currentConversation, currentProject, createConversation } = useWorkspace();
  const haptic = useHaptic();
  const isOnline = useOnlineStatus();

  const handleOpenSidebar = () => {
    haptic.light();
    onOpenSidebar();
  };

  const handleOpenContext = () => {
    haptic.light();
    onOpenContext();
  };

  const handleNewConversation = () => {
    if (currentProject) {
      haptic.medium();
      createConversation(currentProject.id);
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-3 border-b border-border/50 bg-sidebar safe-area-top">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenSidebar}
        className="h-10 w-10"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 min-w-0 mx-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {!isOnline && (
            <WifiOff className="h-3 w-3 text-destructive shrink-0" />
          )}
          <p className="text-sm font-medium truncate">
            {currentConversation?.title || "AI Assistant"}
          </p>
        </div>
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
          onClick={handleOpenContext}
          className="h-10 w-10"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
