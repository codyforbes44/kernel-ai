import { useState } from "react";
import { MobileHeader } from "./MobileHeader";
import { MobileSidebar } from "@/components/sidebar/MobileSidebar";
import { MobileContextPanel } from "@/components/context/MobileContextPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";

export function MobileLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <MobileHeader
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenContext={() => setContextOpen(true)}
      />

      <main className="flex-1 overflow-hidden">
        <ChatPanel isMobile />
      </main>

      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <MobileContextPanel open={contextOpen} onOpenChange={setContextOpen} />
    </div>
  );
}
