import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glowSkeletonVariants = cva(
  "relative overflow-hidden rounded-md transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-muted",
        glow: [
          "bg-primary/5",
          "shadow-[inset_0_0_8px_hsl(var(--primary)/0.1)]",
        ],
        subtle: "bg-muted/60",
        intense: [
          "bg-primary/10",
          "shadow-[inset_0_0_12px_hsl(var(--primary)/0.15),0_0_8px_hsl(var(--primary)/0.1)]",
        ],
      },
    },
    defaultVariants: {
      variant: "glow",
    },
  }
);

export interface GlowSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glowSkeletonVariants> {
  /** Animation delay in milliseconds for staggered effects */
  delay?: number;
  /** Enable pulse animation */
  pulse?: boolean;
}

function GlowSkeleton({
  className,
  variant,
  delay = 0,
  pulse = false,
  style,
  ...props
}: GlowSkeletonProps) {
  return (
    <div
      className={cn(
        glowSkeletonVariants({ variant }),
        pulse && "animate-pulse",
        className
      )}
      style={{
        ...style,
        animationDelay: delay > 0 ? `${delay}ms` : undefined,
      }}
      {...props}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            hsl(var(--primary) / 0.08) 20%,
            hsl(var(--primary) / 0.15) 50%,
            hsl(var(--primary) / 0.08) 80%,
            transparent 100%
          )`,
          animation: `glow-shimmer 2s ease-in-out infinite`,
          animationDelay: delay > 0 ? `${delay}ms` : undefined,
        }}
      />

      {/* Edge glow */}
      <div
        className="absolute inset-0 opacity-0 animate-[glow-pulse_3s_ease-in-out_infinite]"
        style={{
          boxShadow: `inset 0 0 20px hsl(var(--primary) / 0.1)`,
          animationDelay: delay > 0 ? `${delay}ms` : undefined,
        }}
      />

      <style>{`
        @keyframes glow-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Preset skeleton shapes
interface SkeletonTextProps extends GlowSkeletonProps {
  lines?: number;
  lastLineWidth?: string;
}

function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <GlowSkeleton
          key={i}
          className="h-4"
          style={{
            width: i === lines - 1 ? lastLineWidth : "100%",
          }}
          delay={i * 100}
          {...props}
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({
  className,
  ...props
}: GlowSkeletonProps) {
  return (
    <GlowSkeleton
      className={cn("h-10 w-10 rounded-full", className)}
      {...props}
    />
  );
}

function SkeletonCard({
  className,
  ...props
}: GlowSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/10 bg-card/50 p-6 space-y-4",
        "shadow-[0_0_16px_hsl(var(--primary)/0.05)]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <SkeletonAvatar {...props} />
        <div className="flex-1 space-y-2">
          <GlowSkeleton className="h-4 w-1/3" delay={50} {...props} />
          <GlowSkeleton className="h-3 w-1/4" delay={100} {...props} />
        </div>
      </div>
      <SkeletonText lines={3} delay={150} {...props} />
      <div className="flex gap-2 pt-2">
        <GlowSkeleton className="h-8 w-20 rounded-md" delay={300} {...props} />
        <GlowSkeleton className="h-8 w-20 rounded-md" delay={350} {...props} />
      </div>
    </div>
  );
}

function SkeletonImage({
  className,
  aspectRatio = "16/9",
  ...props
}: GlowSkeletonProps & { aspectRatio?: string }) {
  return (
    <GlowSkeleton
      className={cn("w-full rounded-lg", className)}
      style={{ aspectRatio }}
      {...props}
    />
  );
}

interface SkeletonListProps extends GlowSkeletonProps {
  items?: number;
}

function SkeletonList({
  items = 5,
  className,
  ...props
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonAvatar className="h-8 w-8" delay={i * 50} {...props} />
          <div className="flex-1 space-y-1.5">
            <GlowSkeleton
              className="h-3.5"
              style={{ width: `${70 + Math.random() * 30}%` }}
              delay={i * 50 + 25}
              {...props}
            />
            <GlowSkeleton
              className="h-2.5"
              style={{ width: `${40 + Math.random() * 30}%` }}
              delay={i * 50 + 50}
              {...props}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: GlowSkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-primary/10">
        {Array.from({ length: columns }).map((_, i) => (
          <GlowSkeleton
            key={i}
            className="h-4 flex-1"
            delay={i * 30}
            variant="intense"
            {...props}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <GlowSkeleton
              key={colIndex}
              className="h-3 flex-1"
              delay={rowIndex * 50 + colIndex * 30}
              {...props}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export {
  GlowSkeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonImage,
  SkeletonList,
  SkeletonTable,
};
