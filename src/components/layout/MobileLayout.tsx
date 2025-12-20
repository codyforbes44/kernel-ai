import { useState } from "react";
import { MobileHeader } from "./MobileHeader";
import { MobileSidebar } from "@/components/sidebar/MobileSidebar";
import { MobileContextPanel } from "@/components/context/MobileContextPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { SkipLink } from "@/components/ui/skip-link";
import { useWorkspace } from "@/hooks/useWorkspace";

export function MobileLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const { currentProject, createConversation, currentConversation, isCreatingConversation } = useWorkspace();

  const handleNewConversation = async () => {
    if (currentProject && !isCreatingConversation) {
      await createConversation(currentProject.id);
    }
  };

  // Only show FAB when there's an active conversation (to avoid duplicate with empty state)
  const showFab = currentProject && currentConversation;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background safe-area-top safe-area-bottom">
      <SkipLink href="#mobile-main-content" />
      <MobileHeader
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenContext={() => setContextOpen(true)}
      />

      <main id="mobile-main-content" className="flex-1 overflow-hidden" tabIndex={-1}>
        <ChatPanel isMobile />
      </main>

      {showFab && (
        <FloatingActionButton
          onClick={handleNewConversation}
          disabled={!currentProject || isCreatingConversation}
          isLoading={isCreatingConversation}
        />
      )}

      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <MobileContextPanel open={contextOpen} onOpenChange={setContextOpen} />
    </div>
  );
}
