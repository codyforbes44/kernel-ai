import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'bordered';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  scanLine?: boolean;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = 'default', blur = 'lg', scanLine = false, children, ...props }, ref) => {
    const blurClasses = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl bg-card/60 border border-border/50",
          blurClasses[blur],
          "transition-all duration-300",
          // Inner glow effect
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
          variant === 'glow' && [
            "border-primary/30",
            "shadow-[0_0_30px_hsl(var(--primary)/0.15),inset_0_1px_1px_rgba(255,255,255,0.05)]",
          ],
          variant === 'bordered' && [
            "border-primary/40",
            "bg-gradient-to-br from-card/80 to-card/40",
          ],
          className
        )}
        {...props}
      >
        {/* Scan line effect */}
        {scanLine && (
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan-line" />
          </div>
        )}
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";

const GlassPanelHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
GlassPanelHeader.displayName = "GlassPanelHeader";

const GlassPanelTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
GlassPanelTitle.displayName = "GlassPanelTitle";

const GlassPanelContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
GlassPanelContent.displayName = "GlassPanelContent";

export {
  GlassPanel,
  GlassPanelHeader,
  GlassPanelTitle,
  GlassPanelContent,
};
