import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ContextPanel } from "@/components/context/ContextPanel";
import { useShortcut } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";

export function IDELayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);

  // Keyboard shortcuts
  useShortcut("b", () => setSidebarCollapsed((prev) => !prev), {
    meta: true,
    description: "Toggle sidebar",
  });

  useShortcut("\\", () => setContextPanelOpen((prev) => !prev), {
    meta: true,
    description: "Toggle context panel",
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar */}
        <ResizablePanel
          defaultSize={20}
          minSize={sidebarCollapsed ? 4 : 15}
          maxSize={sidebarCollapsed ? 4 : 30}
          className={cn(
            "transition-all duration-200",
            sidebarCollapsed && "!basis-14"
          )}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/20 transition-colors" />

        {/* Main Chat Panel */}
        <ResizablePanel defaultSize={contextPanelOpen ? 55 : 80} minSize={40}>
          <ChatPanel />
        </ResizablePanel>

        {/* Context Panel (toggleable) */}
        {contextPanelOpen && (
          <>
            <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/20 transition-colors" />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <ContextPanel onClose={() => setContextPanelOpen(false)} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
