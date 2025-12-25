import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, X, MessageSquare, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/hooks/useHaptic";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  /** Enable expandable menu with multiple actions */
  expandable?: boolean;
  /** Actions to show when expanded */
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
}

const defaultActions = [
  { icon: <MessageSquare className="h-5 w-5" />, label: "New Chat", onClick: () => {} },
  { icon: <FileText className="h-5 w-5" />, label: "Templates", onClick: () => {} },
  { icon: <Sparkles className="h-5 w-5" />, label: "Quick Prompt", onClick: () => {} },
];

export function FloatingActionButton({
  onClick,
  className,
  disabled,
  isLoading,
  expandable = false,
  actions = defaultActions,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMainClick = () => {
    hapticFeedback("medium");
    if (expandable) {
      setIsExpanded(!isExpanded);
    } else {
      onClick();
    }
  };

  const handleActionClick = (action: typeof actions[0]) => {
    hapticFeedback("light");
    action.onClick();
    setIsExpanded(false);
  };

  return (
    <div className={cn("fixed bottom-24 right-4 z-50 safe-area-bottom", className)}>
      {/* Expandable actions */}
      {expandable && isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setIsExpanded(false)}
            aria-hidden="true"
          />
          
          {/* Action buttons */}
          <div className="absolute bottom-20 right-0 flex flex-col-reverse gap-3 animate-fade-in">
            {actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm font-medium shadow-lg whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  size="icon-touch"
                  variant="secondary"
                  onClick={() => handleActionClick(action)}
                  className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full shadow-lg"
                  aria-label={action.label}
                >
                  {action.icon}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Main FAB - 56px for primary FAB with 44px minimum touch target */}
      <Button
        size="icon"
        onClick={handleMainClick}
        disabled={disabled}
        className={cn(
          "h-14 w-14 min-h-[56px] min-w-[56px] rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          disabled && "opacity-50",
          isExpanded && "rotate-45"
        )}
        aria-label={isExpanded ? "Close menu" : "New conversation"}
        aria-expanded={expandable ? isExpanded : undefined}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        ) : isExpanded ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Plus className="h-6 w-6" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
