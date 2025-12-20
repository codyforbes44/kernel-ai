import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Sparkles,
  Zap,
  Code,
  Database,
  Shield,
  Palette,
  Code2,
  ArrowRight,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "no-conversation" | "empty-conversation";
  onPromptSelect?: (prompt: string) => void;
}

const quickPrompts = [
  {
    icon: Code,
    title: "Debug an error",
    prompt: "I'm getting an error in my Lovable project. Can you help me debug it?",
  },
  {
    icon: Sparkles,
    title: "Generate a component",
    prompt: "Create a modern, responsive React component for",
  },
  {
    icon: Database,
    title: "Design database schema",
    prompt: "Help me design a database schema for",
  },
  {
    icon: Shield,
    title: "Review RLS policies",
    prompt: "Review my Row Level Security policies for potential issues",
  },
  {
    icon: Palette,
    title: "Improve UI/UX",
    prompt: "Suggest improvements for the user interface of my",
  },
  {
    icon: Zap,
    title: "Optimize performance",
    prompt: "Help me optimize the performance of my Lovable app",
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
        .single();
      
      const prefs = data?.preferences as Record<string, unknown> | null;
      setHasCompletedTour(prefs?.hasCompletedTour === true);
    };
    
    fetchPreferences();
  }, [user]);

  const handleStartTour = async () => {
    if (!user) return;
    
    // Reset the tour completion flag to trigger the tour
    const { data } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();
    
    const currentPrefs = (data?.preferences as Record<string, unknown>) || {};
    
    await supabase
      .from('profiles')
      .update({ 
        preferences: { ...currentPrefs, hasCompletedTour: false } 
      })
      .eq('id', user.id);
    
    // Reload the page to show the tour
    window.location.reload();
  };

  // Only show the button if the user has already completed the tour
  if (!hasCompletedTour) return null;

  return (
    <button
      onClick={handleStartTour}
      className={cn(
        "mt-6 flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
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

export function EmptyState({ type, onPromptSelect }: EmptyStateProps) {
  const { currentProject, createConversation, isCreatingConversation } = useWorkspace();
  const isMobile = useIsMobile();

  const handleNewConversation = async () => {
    if (currentProject && !isCreatingConversation) {
      await createConversation(currentProject.id);
    }
  };

  if (type === "no-conversation") {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center animate-fade-in"
        role="status"
        aria-label="No conversation selected"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
          <MessageSquare className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Conversation Selected</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Select a conversation from the sidebar or create a new one to start
          chatting with your AI assistant.
        </p>
        {currentProject && (
          <Button 
            onClick={handleNewConversation}
            disabled={isCreatingConversation}
            aria-label="Start a new conversation"
          >
            <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
            {isCreatingConversation ? "Creating..." : "New Conversation"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center py-8 md:py-12 animate-fade-in"
      role="region"
      aria-label="Start a conversation"
    >
      <div 
        className={cn(
          "w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5",
          "flex items-center justify-center mb-4 md:mb-6 border border-primary/20",
          "animate-scale-in"
        )}
      >
        <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary" aria-hidden="true" />
      </div>
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">How can I help you today?</h2>
      <p className="text-muted-foreground text-center max-w-lg mb-6 md:mb-8 text-sm md:text-base px-4">
        I'm your expert Lovable AI assistant. Ask me anything about building
        with Lovable, debugging issues, or improving your projects.
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
              <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
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

      <StartTourButton />

      {!isMobile && (
        <div 
          className="mt-6 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in"
          style={{ animationDelay: "500ms" }}
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
