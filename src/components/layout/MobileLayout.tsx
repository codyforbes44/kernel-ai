import { useState } from "react";
import { MobileHeader } from "./MobileHeader";
import { MobileTabBar } from "./MobileTabBar";
import { MobileSidebar } from "@/components/sidebar/MobileSidebar";
import { MobileContextPanel } from "@/components/context/MobileContextPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SkipLink } from "@/components/ui/skip-link";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useWorkspace } from "@/hooks/useWorkspace";
import { MessageSquare, FileText, Sparkles } from "lucide-react";

export function MobileLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const { currentProject, createConversation } = useWorkspace();

  const fabActions = [
    { 
      icon: <MessageSquare className="h-5 w-5" />, 
      label: "New Chat", 
      onClick: () => {
        if (currentProject) {
          createConversation(currentProject.id);
        }
      }
    },
    { 
      icon: <FileText className="h-5 w-5" />, 
      label: "Templates", 
      onClick: () => setSidebarOpen(true)
    },
    { 
      icon: <Sparkles className="h-5 w-5" />, 
      label: "Context", 
      onClick: () => setContextOpen(true)
    },
  ];

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-background">
      <SkipLink href="#mobile-main-content" />
      <MobileHeader
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenContext={() => setContextOpen(true)}
      />

      <main id="mobile-main-content" className="flex-1 overflow-hidden" tabIndex={-1}>
        <ChatPanel isMobile />
      </main>

      <FloatingActionButton
        onClick={() => {
          if (currentProject) {
            createConversation(currentProject.id);
          }
        }}
        expandable
        actions={fabActions}
      />

      <MobileTabBar />

      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <MobileContextPanel open={contextOpen} onOpenChange={setContextOpen} />
    </div>
  );
}
