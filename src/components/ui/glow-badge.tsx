import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glowBadgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
    "transition-all duration-300",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-card/60 backdrop-blur-sm",
          "border-border/50",
          "text-foreground",
        ],
        primary: [
          "bg-primary/15 backdrop-blur-sm",
          "border-primary/40",
          "text-primary",
          "shadow-[0_0_12px_hsl(var(--primary)/0.2)]",
        ],
        glow: [
          "bg-primary/10 backdrop-blur-sm",
          "border-primary/50",
          "text-primary",
          "shadow-[0_0_15px_hsl(var(--primary)/0.3)]",
          "hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
          "hover:border-primary/70",
        ],
        success: [
          "bg-success/15 backdrop-blur-sm",
          "border-success/40",
          "text-success",
          "shadow-[0_0_12px_hsl(var(--success)/0.2)]",
        ],
        warning: [
          "bg-warning/15 backdrop-blur-sm",
          "border-warning/40",
          "text-warning-foreground",
          "shadow-[0_0_12px_hsl(var(--warning)/0.2)]",
        ],
        destructive: [
          "bg-destructive/15 backdrop-blur-sm",
          "border-destructive/40",
          "text-destructive",
          "shadow-[0_0_12px_hsl(var(--destructive)/0.2)]",
        ],
        outline: [
          "bg-transparent",
          "border-primary/30",
          "text-primary",
          "hover:bg-primary/10",
          "hover:border-primary/50",
        ],
        ghost: [
          "bg-muted/50 backdrop-blur-sm",
          "border-transparent",
          "text-muted-foreground",
          "hover:bg-muted",
          "hover:text-foreground",
        ],
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
      pulse: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        pulse: true,
        variant: "primary",
        className: "animate-[pulse-badge_2s_ease-in-out_infinite]",
      },
      {
        pulse: true,
        variant: "glow",
        className: "animate-[pulse-badge_2s_ease-in-out_infinite]",
      },
      {
        pulse: true,
        variant: "success",
        className: "animate-[pulse-success_2s_ease-in-out_infinite]",
      },
      {
        pulse: true,
        variant: "destructive",
        className: "animate-[pulse-destructive_2s_ease-in-out_infinite]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      pulse: false,
    },
  }
);

export interface GlowBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glowBadgeVariants> {
  /** Show a dot indicator */
  dot?: boolean;
  /** Dot color variant */
  dotVariant?: "primary" | "success" | "warning" | "destructive";
  /** Left icon */
  icon?: React.ReactNode;
}

const GlowBadge = React.forwardRef<HTMLDivElement, GlowBadgeProps>(
  (
    { className, variant, size, pulse, dot, dotVariant = "primary", icon, children, ...props },
    ref
  ) => {
    const dotColors = {
      primary: "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]",
      success: "bg-success shadow-[0_0_8px_hsl(var(--success)/0.6)]",
      warning: "bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.6)]",
      destructive: "bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.6)]",
    };

    return (
      <div
        ref={ref}
        className={cn(glowBadgeVariants({ variant, size, pulse }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              dotColors[dotVariant],
              pulse && "animate-pulse"
            )}
          />
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        {children}

        <style>{`
          @keyframes pulse-badge {
            0%, 100% { 
              box-shadow: 0 0 15px hsl(var(--primary) / 0.3);
              border-color: hsl(var(--primary) / 0.5);
            }
            50% { 
              box-shadow: 0 0 25px hsl(var(--primary) / 0.5);
              border-color: hsl(var(--primary) / 0.7);
            }
          }
          @keyframes pulse-success {
            0%, 100% { 
              box-shadow: 0 0 12px hsl(var(--success) / 0.2);
            }
            50% { 
              box-shadow: 0 0 20px hsl(var(--success) / 0.4);
            }
          }
          @keyframes pulse-destructive {
            0%, 100% { 
              box-shadow: 0 0 12px hsl(var(--destructive) / 0.2);
            }
            50% { 
              box-shadow: 0 0 20px hsl(var(--destructive) / 0.4);
            }
          }
        `}</style>
      </div>
    );
  }
);
GlowBadge.displayName = "GlowBadge";

// Status-specific presets
const StatusBadge = React.forwardRef<
  HTMLDivElement,
  Omit<GlowBadgeProps, "variant" | "dot" | "dotVariant"> & {
    status: "online" | "offline" | "busy" | "away";
  }
>(({ status, children, ...props }, ref) => {
  const statusConfig = {
    online: { variant: "success" as const, dotVariant: "success" as const, label: "Online" },
    offline: { variant: "ghost" as const, dotVariant: "destructive" as const, label: "Offline" },
    busy: { variant: "destructive" as const, dotVariant: "destructive" as const, label: "Busy" },
    away: { variant: "warning" as const, dotVariant: "warning" as const, label: "Away" },
  };

  const config = statusConfig[status];

  return (
    <GlowBadge
      ref={ref}
      variant={config.variant}
      dot
      dotVariant={config.dotVariant}
      {...props}
    >
      {children || config.label}
    </GlowBadge>
  );
});
StatusBadge.displayName = "StatusBadge";

// Tag badge for labels
const TagBadge = React.forwardRef<
  HTMLDivElement,
  Omit<GlowBadgeProps, "variant"> & { removable?: boolean; onRemove?: () => void }
>(({ removable, onRemove, children, ...props }, ref) => {
  return (
    <GlowBadge ref={ref} variant="outline" {...props}>
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 -mr-1 h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
          aria-label="Remove tag"
        >
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </GlowBadge>
  );
});
TagBadge.displayName = "TagBadge";

export { GlowBadge, StatusBadge, TagBadge, glowBadgeVariants };
