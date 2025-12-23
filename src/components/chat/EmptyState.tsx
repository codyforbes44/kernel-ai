import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { KernelLogo } from "@/components/ui/kernel-logo";
import {
  MessageSquare,
  Zap,
  Code,
  Database,
  Shield,
  Palette,
  Code2,
  ArrowRight,
  Compass,
  Lightbulb,
  BookOpen,
  Rocket,
  FolderKanban,
} from "lucide-react";
import { cn, getTimeOfDayGreeting } from "@/lib/utils";
import { CreateProjectDialog } from "@/components/dialogs/CreateProjectDialog";

interface EmptyStateProps {
  type: "no-conversation" | "empty-conversation";
  onPromptSelect?: (prompt: string) => void;
}

const quickPrompts = [
  {
    icon: Code,
    title: "Debug an error",
    prompt: "I'm getting an error in my project. Can you help me debug it?",
    color: "text-red-500",
    bgColor: "bg-red-500/10 group-hover:bg-red-500/20",
  },
  {
    icon: Zap,
    title: "Generate a component",
    prompt: "Create a modern, responsive React component for",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 group-hover:bg-blue-500/20",
  },
  {
    icon: Database,
    title: "Design database schema",
    prompt: "Help me design a database schema for",
    color: "text-green-500",
    bgColor: "bg-green-500/10 group-hover:bg-green-500/20",
  },
  {
    icon: Shield,
    title: "Review RLS policies",
    prompt: "Review my Row Level Security policies for potential issues",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10 group-hover:bg-yellow-500/20",
  },
  {
    icon: Palette,
    title: "Improve UI/UX",
    prompt: "Suggest improvements for the user interface of my",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10 group-hover:bg-pink-500/20",
  },
  {
    icon: Zap,
    title: "Optimize performance",
    prompt: "Help me optimize the performance of my app",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10 group-hover:bg-orange-500/20",
  },
];

const learningResources = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Learn the basics",
    url: "https://docs.lovable.dev",
  },
  {
    icon: Rocket,
    title: "Quick Start",
    description: "Build your first app",
    url: "https://docs.lovable.dev/user-guides/quickstart",
  },
];

function StartTourButton() {
  const { user } = useAuth();
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchPreferences = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .maybeSingle();
      
      const prefs = data?.preferences as Record<string, unknown> | null;
      setHasCompletedTour(prefs?.hasCompletedTour === true);
    };
    
    fetchPreferences();
  }, [user]);

  const handleStartTour = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .maybeSingle();
    
    const currentPrefs = (data?.preferences as Record<string, unknown>) || {};
    
    await supabase
      .from('profiles')
      .update({ 
        preferences: { ...currentPrefs, hasCompletedTour: false } 
      })
      .eq('id', user.id);
    
    window.location.reload();
  };

  if (!hasCompletedTour) return null;

  return (
    <button
      onClick={handleStartTour}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
        "text-muted-foreground hover:text-foreground",
        "bg-muted/50 hover:bg-muted border border-border/50 hover:border-border",
        "transition-all animate-fade-in"
      )}
      style={{ animationDelay: "450ms" }}
      aria-label="Start the welcome tour"
    >
      <Compass className="h-4 w-4" aria-hidden="true" />
      <span>Take a Tour</span>
    </button>
  );
}

// Animated illustration component
function EmptyStateIllustration({ type }: { type: "chat" | "welcome" }) {
  if (type === "chat") {
    return (
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        {/* Animated circles */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse" style={{ animationDelay: "150ms" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-primary" aria-hidden="true" />
        </div>
        {/* Floating particles */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="absolute top-1/2 -right-2 w-2 h-2 rounded-full bg-success/60 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 md:w-24 md:h-24">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <KernelLogo size="xl" className="animate-pulse" />
      </div>
      {/* Decorative elements */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent/40 animate-bounce" />
      <div className="absolute -bottom-1 left-1/4 w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "100ms" }} />
      <div className="absolute top-1/4 -right-1 w-3 h-3 rounded-full bg-success/40 animate-bounce" style={{ animationDelay: "200ms" }} />
    </div>
  );
}

export function EmptyState({ type, onPromptSelect }: EmptyStateProps) {
  const { currentProject, projects, createConversation, isCreatingConversation } = useWorkspace();
  const isMobile = useIsMobile();
  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleNewConversation = async () => {
    if (currentProject && !isCreatingConversation) {
      await createConversation(currentProject.id);
    }
  };

  // No projects state - prompt user to create one
  if (projects.length === 0) {
    return (
      <>
        <div 
          className="flex flex-col items-center justify-center py-16 text-center animate-fade-in"
          role="status"
          aria-label="No projects found"
        >
          <EmptyStateIllustration type="welcome" />
          <h2 className="text-xl font-semibold mb-2 mt-6">{getTimeOfDayGreeting()}! Welcome to Kernel</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first project to start organizing your conversations and building amazing things.
          </p>
          <Button 
            onClick={() => setShowCreateProject(true)}
            className="gap-2"
            size="lg"
          >
            <FolderKanban className="h-4 w-4" />
            Create Your First Project
          </Button>
          
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50 max-w-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium">What are projects?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Projects help you organize conversations by topic, client, or any way you prefer.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <CreateProjectDialog
          open={showCreateProject}
          onOpenChange={setShowCreateProject}
        />
      </>
    );
  }

  if (type === "no-conversation") {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center animate-fade-in"
        role="status"
        aria-label="No conversation selected"
      >
        <EmptyStateIllustration type="chat" />
        <h2 className="text-xl font-semibold mb-2 mt-6">No Conversation Selected</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Select a conversation from the sidebar or create a new one to start
          chatting with your AI assistant.
        </p>
        {currentProject && (
          <Button 
            onClick={handleNewConversation}
            disabled={isCreatingConversation}
            className="gap-2"
            aria-label="Start a new conversation"
          >
            <span className="font-mono font-bold">{">_"}</span>
            {isCreatingConversation ? "Creating..." : "New Conversation"}
          </Button>
        )}
        
        {/* Contextual tip */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50 max-w-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-left">
              <p className="text-sm font-medium">Pro tip</p>
              <p className="text-xs text-muted-foreground mt-1">
                Press <kbd className="px-1.5 py-0.5 rounded bg-background border text-xs font-mono">⌘N</kbd> to quickly create a new conversation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center py-8 md:py-12 animate-fade-in"
      role="region"
      aria-label="Start a conversation"
    >
      <EmptyStateIllustration type="welcome" />
      
      <h2 className="text-xl md:text-2xl font-bold mb-2 mt-6 text-center">{getTimeOfDayGreeting()}, how can I help you?</h2>
      <p className="text-muted-foreground text-center max-w-lg mb-6 md:mb-8 text-sm md:text-base px-4">
        I'm Kernel, your AI-powered development assistant. Ask me anything about building
        apps, debugging issues, or improving your projects.
      </p>

      {/* Build Apps Card */}
      <Link
        to="/builder"
        className={cn(
          "w-full max-w-2xl mx-4 mb-6 p-4 md:p-5 rounded-xl border border-primary/30",
          "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
          "hover:border-primary/50 hover:from-primary/15 transition-all group",
          "animate-fade-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        )}
        style={{ animationDelay: "100ms" }}
        aria-label="Go to App Builder - Create web applications with a visual editor"
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Code2 className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-0.5 flex items-center gap-2">
              Build Apps
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" aria-hidden="true" />
            </h3>
            <p className="text-sm text-muted-foreground">
              Create web applications with a visual editor, live preview, and AI-powered code generation
            </p>
          </div>
        </div>
      </Link>

      {/* Quick prompts grid */}
      <nav 
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 w-full max-w-2xl px-4"
        aria-label="Quick prompts"
      >
        {quickPrompts.map((prompt, index) => {
          const IconComponent = prompt.icon;
          return (
            <button
              key={index}
              onClick={() => onPromptSelect?.(prompt.prompt)}
              className={cn(
                "flex items-start gap-3 p-3 md:p-4 rounded-xl border border-border/50 bg-card/50",
                "hover:bg-card hover:border-primary/30 active:scale-[0.98] transition-all text-left group",
                "animate-fade-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              )}
              style={{ animationDelay: `${150 + index * 50}ms` }}
              aria-label={`Use prompt: ${prompt.title}`}
            >
              <div className={cn(
                "shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-colors",
                prompt.bgColor
              )}>
                <IconComponent className={cn("h-4 w-4 md:h-5 md:w-5", prompt.color)} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-sm mb-0.5 md:mb-1">{prompt.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {prompt.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Learning resources - only show on larger screens */}
      {!isMobile && (
        <div className="flex items-center gap-4 mt-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
          {learningResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <resource.icon className="h-4 w-4" aria-hidden="true" />
              <span>{resource.title}</span>
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4">
        <StartTourButton />
      </div>

      {!isMobile && (
        <div 
          className="mt-6 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in"
          style={{ animationDelay: "550ms" }}
        >
          <span>Press</span>
          <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono">
            ⌘K
          </kbd>
          <span>to open command palette</span>
        </div>
      )}
    </div>
  );
}
