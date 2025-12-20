import { useState } from "react";
import { MobileHeader } from "./MobileHeader";
import { MobileTabBar } from "./MobileTabBar";
import { MobileSidebar } from "@/components/sidebar/MobileSidebar";
import { MobileContextPanel } from "@/components/context/MobileContextPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SkipLink } from "@/components/ui/skip-link";
import { useWorkspace } from "@/hooks/useWorkspace";

export function MobileLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const { currentProject, currentConversation } = useWorkspace();

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

      <MobileTabBar />

      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <MobileContextPanel open={contextOpen} onOpenChange={setContextOpen} />
    </div>
  );
}
