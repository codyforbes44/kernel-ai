import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Square,
  Paperclip,
  Sparkles,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useShortcut } from "@/hooks/useKeyboardShortcuts";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, onStop, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!message.trim() || isLoading || disabled) return;
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Global shortcut to focus input
  useShortcut("l", () => textareaRef.current?.focus(), {
    meta: true,
    description: "Focus chat input",
  });

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/50 bg-card/50 backdrop-blur",
        "focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
        "transition-all duration-200",
        disabled && "opacity-50"
      )}
    >
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? "Select a conversation to start chatting..."
            : "Ask me anything about Lovable... (⌘Enter to send)"
        }
        disabled={disabled || isLoading}
        className={cn(
          "min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
          "pr-24 py-4 px-4"
        )}
        rows={1}
      />

      <div className="absolute right-2 bottom-2 flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Attach file</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled={disabled}
            >
              <Command className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert template (/)</TooltipContent>
        </Tooltip>

        {isLoading ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={onStop}
              >
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Stop generating (Esc)</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
              >
                <Send className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message (⌘Enter)</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Character count */}
      {message.length > 0 && (
        <div className="absolute left-4 bottom-2 text-xs text-muted-foreground">
          {message.length} chars
        </div>
      )}
    </div>
  );
}
