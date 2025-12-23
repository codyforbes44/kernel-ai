import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { usePWA } from "@/hooks/usePWA";
import { useSubscription } from "@/hooks/useSubscription";
import { useTemplateInjection } from "@/hooks/useTemplateInjection";
import { templateService } from "@/services/templateService";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { KernelLogo } from "@/components/ui/kernel-logo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  MessageSquare,
  Settings,
  LogOut,
  User,
  FileText,
  Shield,
  Download,
  Loader2,
  Trash2,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectTree } from "./ProjectTree";
import { ConversationList } from "./ConversationList";
import { TemplatesList } from "./TemplatesList";
import { CleanupConversationsDialog } from "@/components/dialogs/CleanupConversationsDialog";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { isInstallable, installApp } = usePWA();
  const { subscribed, plan } = useSubscription();
  const { currentWorkspace, currentProject, createConversation, isCreatingConversation } = useWorkspace();
  const { setPendingTemplate } = useTemplateInjection();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"conversations" | "templates">("conversations");
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);

  const handleNewConversation = async () => {
    if (currentProject && !isCreatingConversation) {
      await createConversation(currentProject.id);
    }
  };

  const handleTemplateSelect = (content: string) => {
    const variables = templateService.extractVariables(content);
    setPendingTemplate(content, variables);
    // Switch to conversations tab so user sees the chat input
    setActiveTab("conversations");
  };

  if (collapsed) {
    return (
      <aside 
        className="h-full flex flex-col bg-sidebar border-r border-primary/10"
        role="navigation"
        aria-label="Sidebar navigation (collapsed)"
      >
        <div className="p-2 flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                aria-label="Expand sidebar"
                aria-expanded="false"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar (⌘B)</TooltipContent>
          </Tooltip>

          <Separator className="my-1 bg-primary/10" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewConversation}
                disabled={isCreatingConversation}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                aria-label="Start new conversation"
              >
                {isCreatingConversation ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New conversation (⌘N)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hover:bg-primary/10 hover:text-primary transition-all duration-200",
                  activeTab === "conversations" && "bg-primary/15 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.25)]"
                )}
                onClick={() => setActiveTab("conversations")}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Conversations</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hover:bg-primary/10 hover:text-primary transition-all duration-200",
                  activeTab === "templates" && "bg-primary/15 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.25)]"
                )}
                onClick={() => setActiveTab("templates")}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Templates</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1" />

        <div className="p-2 flex flex-col items-center gap-2">
          {isInstallable && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={installApp}
                  className="hover:bg-primary/10 text-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.2)] transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Install App</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/builder')}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                aria-label="Builder"
              >
                <Code2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Builder</TooltipContent>
          </Tooltip>

          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/admin')}
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Admin Panel</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings (⌘,)</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-all duration-200">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">Account</TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="end">
              <DropdownMenuItem className="text-xs text-muted-foreground">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className="h-full flex flex-col bg-sidebar border-r border-primary/10"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-primary/10">
        <div className="flex items-center gap-2">
          <KernelLogo size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Kernel</span>
            <span className="text-xs text-muted-foreground">
              {currentWorkspace?.name || "Personal"}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="hover:bg-primary/10 hover:text-primary h-8 w-8 transition-all duration-200"
          aria-label="Collapse sidebar"
          aria-expanded="true"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-card/50 border-primary/20 focus:border-primary/50 focus:shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-all duration-200"
            aria-label="Search conversations and templates"
          />
        </div>
      </div>

      {/* New Conversation Button */}
      <div className="px-3 pb-2">
        <Button
          onClick={handleNewConversation}
          disabled={isCreatingConversation}
          className="w-full justify-start gap-2 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)] transition-all duration-200"
          variant="outline"
        >
          {isCreatingConversation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isCreatingConversation ? "Creating..." : "New Conversation"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-3 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-1 justify-start gap-2 transition-all duration-200",
            activeTab === "conversations" 
              ? "bg-primary/15 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)]" 
              : "hover:bg-primary/10 hover:text-primary"
          )}
          onClick={() => setActiveTab("conversations")}
        >
          <MessageSquare className="h-4 w-4" />
          Chats
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-1 justify-start gap-2 transition-all duration-200",
            activeTab === "templates" 
              ? "bg-primary/15 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)]" 
              : "hover:bg-primary/10 hover:text-primary"
          )}
          onClick={() => setActiveTab("templates")}
        >
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </div>

      <Separator className="my-2 bg-primary/10" />

      {/* Content */}
      <ScrollArea className="flex-1 px-2">
        {activeTab === "conversations" ? (
          <div className="space-y-4">
            <ProjectTree searchQuery={searchQuery} />
            <ConversationList searchQuery={searchQuery} />
          </div>
        ) : (
          <TemplatesList onSelectTemplate={handleTemplateSelect} />
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-primary/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-auto py-2 hover:bg-primary/10 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.15)]">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium truncate max-w-[140px]">
                  {user?.email?.split("@")[0]}
                </span>
                {subscribed ? (
                  <span className="text-xs text-gold font-medium flex items-center gap-1">
                    ✦ Pro
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Free tier</span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {isInstallable && (
              <>
                <DropdownMenuItem onClick={installApp}>
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => navigate('/builder')}>
              <Code2 className="h-4 w-4 mr-2" />
              Builder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCleanupDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clean Up Empty Chats
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CleanupConversationsDialog
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
      />
    </aside>
  );
}
