import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useTemplateInjection } from "@/hooks/useTemplateInjection";
import { templateService } from "@/services/templateService";
import { ConversationList } from "./ConversationList";
import { TemplatesList } from "./TemplatesList";
import {
  Search,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  User,
} from "lucide-react";
import { useState, useCallback } from "react";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentProject, createConversation, refresh } = useWorkspace();
  const { setPendingTemplate } = useTemplateInjection();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chats");

  const handleNewConversation = async () => {
    if (currentProject) {
      await createConversation(currentProject.id);
      onOpenChange(false);
    }
  };

  const handleConversationSelect = () => {
    onOpenChange(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
  };

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleTemplateSelect = (content: string) => {
    const variables = templateService.extractVariables(content);
    setPendingTemplate(content, variables);
    onOpenChange(false); // Close the sidebar
    setActiveTab("chats"); // Switch to chats tab
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span>AI Assistant</span>
          </SheetTitle>
        </SheetHeader>

        <div className="p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <Button
            className="w-full h-10 gap-2"
            onClick={handleNewConversation}
            disabled={!currentProject}
          >
            <Sparkles className="h-4 w-4" />
            New Conversation
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-3 grid grid-cols-2">
            <TabsTrigger value="chats" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="chats" className="m-0 h-full">
              <PullToRefresh onRefresh={handleRefresh} className="h-full p-3">
                <ConversationList
                  searchQuery={searchQuery}
                  onSelect={handleConversationSelect}
                  isMobile
                />
              </PullToRefresh>
            </TabsContent>

            <TabsContent value="templates" className="m-0 p-3 h-full overflow-auto">
              <TemplatesList onSelectTemplate={handleTemplateSelect} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-3 border-t border-border/50 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={() => {
                navigate("/settings");
                onOpenChange(false);
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              className="h-10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
