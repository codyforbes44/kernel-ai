import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useHaptic } from "@/hooks/useHaptic";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { KernelAILogo } from "@/components/brand/KernelAILogo";
import { Menu, Plus, PanelRight, WifiOff, Loader2, FolderPlus } from "lucide-react";
import { useState } from "react";
import { CreateProjectDialog } from "@/components/dialogs/CreateProjectDialog";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
  onOpenContext: () => void;
}

export function MobileHeader({ onOpenSidebar, onOpenContext }: MobileHeaderProps) {
  const { currentConversation, currentProject, projects, createConversation, isCreatingConversation } = useWorkspace();
  const haptic = useHaptic();
  const { isOnline } = useOnlineStatus();
  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleOpenSidebar = () => {
    haptic.light();
    onOpenSidebar();
  };

  const handleOpenContext = () => {
    haptic.light();
    onOpenContext();
  };

  const handleNewConversation = async () => {
    if (currentProject && !isCreatingConversation) {
      haptic.medium();
      await createConversation(currentProject.id);
    }
  };

  const hasNoProjects = projects.length === 0;

  return (
    <>
      <header className="h-14 flex items-center justify-between px-3 border-b border-border/50 bg-sidebar safe-area-top">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenSidebar}
            className="h-10 w-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <KernelAILogo size="xs" interactive to="/" />
        </div>

        <div className="flex-1 min-w-0 mx-2 text-center">
          <div className="flex items-center justify-center gap-2">
            {!isOnline && (
              <WifiOff className="h-3 w-3 text-destructive shrink-0" />
            )}
            <p className="text-sm font-medium truncate">
              {currentConversation?.title || (hasNoProjects ? "Get Started" : "AI Assistant")}
            </p>
          </div>
          {currentProject ? (
            <p className="text-xs text-muted-foreground truncate">
              {currentProject.icon} {currentProject.name}
            </p>
          ) : hasNoProjects ? (
            <p className="text-xs text-muted-foreground">
              Create your first project
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select a project to start
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {hasNoProjects ? (
            <Button
              variant="default"
              size="icon"
              onClick={() => setShowCreateProject(true)}
              className="h-10 w-10"
            >
              <FolderPlus className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewConversation}
              disabled={!currentProject || isCreatingConversation}
              className="h-10 w-10"
            >
              {isCreatingConversation ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </Button>
          )}
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

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
      />
    </>
  );
}
