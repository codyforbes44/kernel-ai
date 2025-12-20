import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glowProgressVariants = cva(
  "relative w-full overflow-hidden rounded-full transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        glow: "bg-primary/10 shadow-[inset_0_0_8px_hsl(var(--primary)/0.2)]",
        subtle: "bg-muted",
        intense: "bg-primary/15 shadow-[inset_0_0_12px_hsl(var(--primary)/0.3)]",
      },
      size: {
        sm: "h-2",
        default: "h-3",
        lg: "h-4",
        xl: "h-6",
      },
    },
    defaultVariants: {
      variant: "glow",
      size: "default",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex-1 rounded-full transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        glow: [
          "bg-gradient-to-r from-primary via-primary/90 to-primary",
          "shadow-[0_0_12px_hsl(var(--primary)/0.5),0_0_24px_hsl(var(--primary)/0.3)]",
        ],
        subtle: "bg-primary/80",
        intense: [
          "bg-gradient-to-r from-primary/80 via-primary to-primary/80",
          "shadow-[0_0_16px_hsl(var(--primary)/0.6),0_0_32px_hsl(var(--primary)/0.4)]",
        ],
      },
    },
    defaultVariants: {
      variant: "glow",
    },
  }
);

export interface GlowProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof glowProgressVariants> {
  /** Enable animated shimmer effect */
  shimmer?: boolean;
  /** Enable pulse animation */
  pulse?: boolean;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label format */
  labelFormat?: (value: number) => string;
  /** Indeterminate loading state */
  indeterminate?: boolean;
}

const GlowProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  GlowProgressProps
>(
  (
    {
      className,
      value,
      variant,
      size,
      shimmer = true,
      pulse = false,
      showLabel = false,
      labelFormat = (v) => `${Math.round(v)}%`,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const progressValue = indeterminate ? 100 : value || 0;

    return (
      <div className="relative w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(glowProgressVariants({ variant, size }), className)}
          value={indeterminate ? undefined : value}
          {...props}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 rounded-full opacity-50"
            style={{
              background: `linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)`,
            }}
          />

          {/* Progress indicator */}
          <ProgressPrimitive.Indicator
            className={cn(
              indicatorVariants({ variant }),
              pulse && "animate-pulse",
              indeterminate && "animate-[indeterminate_1.5s_ease-in-out_infinite]"
            )}
            style={{
              transform: indeterminate ? undefined : `translateX(-${100 - progressValue}%)`,
            }}
          >
            {/* Shimmer effect */}
            {shimmer && !indeterminate && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(
                    90deg,
                    transparent 0%,
                    hsl(0 0% 100% / 0.3) 50%,
                    transparent 100%
                  )`,
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              />
            )}

            {/* Edge glow */}
            <div
              className="absolute right-0 top-0 bottom-0 w-4"
              style={{
                background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.8))`,
                filter: "blur(2px)",
              }}
            />
          </ProgressPrimitive.Indicator>
        </ProgressPrimitive.Root>

        {/* Label */}
        {showLabel && !indeterminate && (
          <span className="absolute right-0 -top-6 text-xs font-medium text-primary">
            {labelFormat(progressValue)}
          </span>
        )}

        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }
);
GlowProgress.displayName = "GlowProgress";

// Preset for loading bars
interface LoadingBarProps extends Omit<GlowProgressProps, "indeterminate"> {
  /** Loading text to display */
  loadingText?: string;
}

const LoadingBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  LoadingBarProps
>(({ loadingText = "Loading...", className, ...props }, ref) => {
  return (
    <div className={cn("space-y-2", className)}>
      {loadingText && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
          <span className="text-sm text-muted-foreground">{loadingText}</span>
        </div>
      )}
      <GlowProgress ref={ref} indeterminate variant="glow" size="sm" {...props} />
    </div>
  );
});
LoadingBar.displayName = "LoadingBar";

// Preset for step progress
interface StepProgressProps extends Omit<GlowProgressProps, "value" | "showLabel"> {
  /** Current step (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Step labels */
  labels?: string[];
}

const StepProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  StepProgressProps
>(({ currentStep, totalSteps, labels, className, ...props }, ref) => {
  const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      <GlowProgress
        ref={ref}
        value={progressValue}
        variant="glow"
        size="default"
        shimmer
        {...props}
      />
      {labels && (
        <div className="flex justify-between">
          {labels.map((label, index) => (
            <div
              key={label}
              className={cn(
                "flex flex-col items-center gap-1",
                index + 1 <= currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "h-3 w-3 rounded-full border-2 transition-all duration-300",
                  index + 1 < currentStep && "bg-primary border-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]",
                  index + 1 === currentStep && "border-primary bg-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.6)] animate-pulse",
                  index + 1 > currentStep && "border-muted-foreground/50 bg-transparent"
                )}
              />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
StepProgress.displayName = "StepProgress";

export { GlowProgress, LoadingBar, StepProgress };
