import * as React from "react";
import { cn } from "@/lib/utils";

interface HoloSectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'glow' | 'gradient';
  as?: 'section' | 'div' | 'article';
}

const HoloSection = React.forwardRef<HTMLDivElement, HoloSectionProps>(
  ({ className, variant = 'default', as: Component = 'section', children, ...props }, ref) => {
    const ElementComponent = Component as React.ElementType;
    return (
      <ElementComponent
        ref={ref}
        className={cn(
          "relative",
          variant === 'gradient' && [
            "bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent",
          ],
          variant === 'glow' && [
            "before:absolute before:inset-0 before:-z-10",
            "before:bg-gradient-radial before:from-primary/5 before:to-transparent",
            "before:opacity-50",
          ],
          className
        )}
        {...props}
      >
        {children}
      </ElementComponent>
    );
  }
);
HoloSection.displayName = "HoloSection";

export { HoloSection };
