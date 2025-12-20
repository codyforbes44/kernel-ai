import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  variant?: "check" | "sparkle" | "confetti";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SuccessAnimation({
  show,
  onComplete,
  variant = "check",
  size = "md",
  className,
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  if (variant === "confetti") {
    return (
      <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              backgroundColor: [
                "hsl(var(--primary))",
                "hsl(var(--accent))",
                "hsl(var(--success))",
                "hsl(var(--warning))",
              ][Math.floor(Math.random() * 4)],
              width: `${8 + Math.random() * 8}px`,
              height: `${8 + Math.random() * 8}px`,
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center pointer-events-none z-50",
        className
      )}
    >
      <div
        className={cn(
          sizeClasses[size],
          "rounded-full bg-success flex items-center justify-center",
          "animate-success-pop"
        )}
      >
        {variant === "check" && (
          <Check className={cn(iconSizes[size], "text-success-foreground animate-check-draw")} />
        )}
        {variant === "sparkle" && (
          <Sparkles className={cn(iconSizes[size], "text-success-foreground animate-sparkle")} />
        )}
      </div>
    </div>
  );
}

// Inline success indicator for use within components
interface InlineSuccessProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function InlineSuccess({ show, message, className }: InlineSuccessProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-success text-sm animate-fade-in",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center">
        <Check className="h-3 w-3" />
      </div>
      {message && <span>{message}</span>}
    </div>
  );
}
