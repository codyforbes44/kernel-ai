import * as React from "react";
import { cn } from "@/lib/utils";

interface HoloCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'bordered';
  hover?: boolean;
}

const HoloCard = React.forwardRef<HTMLDivElement, HoloCardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl bg-card/80 backdrop-blur-sm border border-border/50",
          "transition-all duration-300 ease-out",
          // Holographic gradient overlay
          "before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300",
          "before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-accent/10",
          hover && [
            "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
            "hover:before:opacity-100",
            "hover:-translate-y-1",
          ],
          variant === 'glow' && [
            "shadow-md shadow-primary/5",
            "before:opacity-50",
          ],
          variant === 'bordered' && [
            "border-primary/30",
            "bg-gradient-to-br from-card to-card/60",
          ],
          className
        )}
        {...props}
      >
        {/* Scan line effect */}
        <div 
          className={cn(
            "absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-0",
            "transition-opacity duration-300",
            hover && "group-hover:opacity-100"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan-line" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);
HoloCard.displayName = "HoloCard";

const HoloCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)}
    {...props}
  />
));
HoloCardHeader.displayName = "HoloCardHeader";

const HoloCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg sm:text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
HoloCardTitle.displayName = "HoloCardTitle";

const HoloCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
HoloCardDescription.displayName = "HoloCardDescription";

const HoloCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props} />
));
HoloCardContent.displayName = "HoloCardContent";

const HoloCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 sm:p-6 pt-0", className)}
    {...props}
  />
));
HoloCardFooter.displayName = "HoloCardFooter";

export {
  HoloCard,
  HoloCardHeader,
  HoloCardFooter,
  HoloCardTitle,
  HoloCardDescription,
  HoloCardContent,
};
