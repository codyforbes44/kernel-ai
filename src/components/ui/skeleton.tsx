import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation delay in milliseconds for staggered effects */
  delay?: number;
}

function Skeleton({ className, delay = 0, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        className
      )}
      style={{
        ...style,
        animationDelay: delay > 0 ? `${delay}ms` : undefined,
      }}
      {...props}
    >
      <div 
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/5 dark:via-foreground/10 to-transparent dark:shadow-[0_0_8px_rgba(255,255,255,0.05)]"
        style={{
          animationDelay: delay > 0 ? `${delay}ms` : undefined,
        }}
      />
    </div>
  );
}

export { Skeleton };
