import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  MessageSquare,
  Sparkles,
  Zap,
  Code,
  Database,
  Shield,
  Palette,
} from "lucide-react";

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

export function EmptyState({ type, onPromptSelect }: EmptyStateProps) {
  const { currentProject, createConversation } = useWorkspace();

  if (type === "no-conversation") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Conversation Selected</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Select a conversation from the sidebar or create a new one to start
          chatting with your AI assistant.
        </p>
        {currentProject && (
          <Button onClick={() => createConversation(currentProject.id)}>
            <Sparkles className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/20">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
      <p className="text-muted-foreground text-center max-w-lg mb-8">
        I'm your expert Lovable AI assistant. Ask me anything about building
        with Lovable, debugging issues, or improving your projects.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect?.(prompt.prompt)}
            className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all text-left group"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <prompt.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">{prompt.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {prompt.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Press</span>
        <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono">
          ⌘K
        </kbd>
        <span>to open command palette</span>
      </div>
    </div>
  );
}
