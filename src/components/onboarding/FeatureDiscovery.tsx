import { useState, useEffect } from "react";
import { X, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureDiscoveryProps {
  /** Unique ID for this tip (used for dismissal tracking) */
  id: string;
  /** Title of the feature */
  title: string;
  /** Description of the feature */
  description: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Action button text */
  actionText?: string;
  /** Action to perform when button is clicked */
  onAction?: () => void;
  /** Whether this tip can be dismissed */
  dismissible?: boolean;
  /** Variant style */
  variant?: "inline" | "floating" | "banner";
  /** Position for floating variant */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Delay before showing (ms) */
  delay?: number;
  className?: string;
}

const DISMISSED_TIPS_KEY = "dismissed-feature-tips";

function getDismissedTips(): string[] {
  try {
    const stored = localStorage.getItem(DISMISSED_TIPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function dismissTip(id: string) {
  const dismissed = getDismissedTips();
  if (!dismissed.includes(id)) {
    dismissed.push(id);
    localStorage.setItem(DISMISSED_TIPS_KEY, JSON.stringify(dismissed));
  }
}

export function FeatureDiscovery({
  id,
  title,
  description,
  icon,
  actionText,
  onAction,
  dismissible = true,
  variant = "inline",
  position = "bottom-right",
  delay = 0,
  className,
}: FeatureDiscoveryProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = getDismissedTips();
    if (dismissed.includes(id)) {
      setIsDismissed(true);
      return;
    }

    setIsDismissed(false);

    // Show after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [id, delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissTip(id);
    setIsDismissed(true);
  };

  const handleAction = () => {
    onAction?.();
    handleDismiss();
  };

  if (isDismissed || !isVisible) return null;

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  if (variant === "floating") {
    return (
      <div
        className={cn(
          "fixed z-50 max-w-sm p-4 rounded-xl shadow-lg border border-border bg-card animate-slide-up",
          positionClasses[position],
          className
        )}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon || <Lightbulb className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm">{title}</h4>
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss tip"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            {actionText && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAction}
                className="mt-2 -ml-2 gap-1 text-primary hover:text-primary"
              >
                {actionText}
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "w-full p-3 rounded-lg border border-primary/20 bg-primary/5 animate-fade-in",
          className
        )}
        role="alert"
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon || <Lightbulb className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{title}</span>
              <span className="text-muted-foreground"> — {description}</span>
            </p>
          </div>
          {actionText && (
            <Button size="sm" variant="ghost" onClick={handleAction} className="shrink-0">
              {actionText}
            </Button>
          )}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div
      className={cn(
        "p-3 rounded-lg border border-border/50 bg-muted/30 animate-fade-in",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon || <Lightbulb className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm">{title}</h4>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss tip"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          {actionText && (
            <Button
              size="sm"
              variant="link"
              onClick={handleAction}
              className="h-auto p-0 mt-1 text-xs"
            >
              {actionText} →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Pre-configured feature tips
export const FEATURE_TIPS = {
  templates: {
    id: "tip-templates",
    title: "Use Templates",
    description: "Type / in the chat to quickly access pre-built templates for common tasks.",
    actionText: "Learn more",
  },
  commandPalette: {
    id: "tip-command-palette",
    title: "Command Palette",
    description: "Press ⌘K to quickly search, navigate, and perform actions.",
    actionText: "Try it now",
  },
  builder: {
    id: "tip-builder",
    title: "Build Full Apps",
    description: "Head to the Builder to create complete web applications with AI assistance.",
    actionText: "Open Builder",
  },
  keyboard: {
    id: "tip-keyboard",
    title: "Keyboard Shortcuts",
    description: "Press ⌘⇧/ to see all available keyboard shortcuts.",
    actionText: "View shortcuts",
  },
};
