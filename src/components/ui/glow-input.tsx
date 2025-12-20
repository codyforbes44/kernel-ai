import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glowInputVariants = cva(
  [
    "flex w-full rounded-lg border bg-card/60 backdrop-blur-sm px-4 py-2.5 text-base",
    "transition-all duration-300 ease-out",
    "placeholder:text-muted-foreground/60",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-border/50",
          "focus:border-primary/60",
          "focus:outline-none",
          "focus:ring-2 focus:ring-primary/20",
          "focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)]",
          "hover:border-border/80",
        ],
        glow: [
          "border-primary/30",
          "shadow-[0_0_10px_hsl(var(--primary)/0.1)]",
          "focus:border-primary/70",
          "focus:outline-none",
          "focus:ring-2 focus:ring-primary/30",
          "focus:shadow-[0_0_25px_hsl(var(--primary)/0.25)]",
          "hover:border-primary/50",
          "hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)]",
        ],
        subtle: [
          "border-border/40",
          "focus:border-primary/50",
          "focus:outline-none",
          "focus:ring-1 focus:ring-primary/15",
          "focus:shadow-[0_0_12px_hsl(var(--primary)/0.1)]",
        ],
        intense: [
          "border-primary/40",
          "shadow-[0_0_15px_hsl(var(--primary)/0.15)]",
          "focus:border-primary",
          "focus:outline-none",
          "focus:ring-2 focus:ring-primary/40",
          "focus:shadow-[0_0_30px_hsl(var(--primary)/0.35)]",
          "hover:border-primary/60",
          "hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]",
        ],
      },
      inputSize: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-4",
        lg: "h-13 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface GlowInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof glowInputVariants> {
  /** Show animated glow pulse on focus */
  pulseOnFocus?: boolean;
  /** Left icon/element */
  leftElement?: React.ReactNode;
  /** Right icon/element */
  rightElement?: React.ReactNode;
}

const GlowInput = React.forwardRef<HTMLInputElement, GlowInputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type,
      pulseOnFocus,
      leftElement,
      rightElement,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="relative">
        {/* Animated glow background */}
        {pulseOnFocus && isFocused && (
          <div
            className="absolute inset-0 -z-10 rounded-lg opacity-60"
            style={{
              background: `radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)`,
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Input wrapper for icons */}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
              {leftElement}
            </div>
          )}

          <input
            type={type}
            className={cn(
              glowInputVariants({ variant, inputSize }),
              leftElement && "pl-10",
              rightElement && "pr-10",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center text-muted-foreground">
              {rightElement}
            </div>
          )}
        </div>

        <style>{`
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.02); }
          }
        `}</style>
      </div>
    );
  }
);
GlowInput.displayName = "GlowInput";

// Textarea variant
const glowTextareaVariants = cva(
  [
    "flex w-full rounded-lg border bg-card/60 backdrop-blur-sm px-4 py-3 text-base",
    "transition-all duration-300 ease-out",
    "placeholder:text-muted-foreground/60",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "resize-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-border/50",
          "focus:border-primary/60",
          "focus:outline-none",
          "focus:ring-2 focus:ring-primary/20",
          "focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)]",
          "hover:border-border/80",
        ],
        glow: [
          "border-primary/30",
          "shadow-[0_0_10px_hsl(var(--primary)/0.1)]",
          "focus:border-primary/70",
          "focus:outline-none",
          "focus:ring-2 focus:ring-primary/30",
          "focus:shadow-[0_0_25px_hsl(var(--primary)/0.25)]",
          "hover:border-primary/50",
          "hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)]",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface GlowTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof glowTextareaVariants> {}

const GlowTextarea = React.forwardRef<HTMLTextAreaElement, GlowTextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(glowTextareaVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
GlowTextarea.displayName = "GlowTextarea";

export { GlowInput, GlowTextarea, glowInputVariants, glowTextareaVariants };
