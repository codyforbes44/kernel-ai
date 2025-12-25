import * as React from "react";
import { cn } from "@/lib/utils";

interface GlowTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'gold' | 'gradient';
  intensity?: 'low' | 'medium' | 'high';
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
}

const GlowText = React.forwardRef<HTMLSpanElement, GlowTextProps>(
  ({ className, variant = 'primary', intensity = 'medium', as: Component = 'span', children, ...props }, ref) => {
    const glowStyles = {
      low: {
        primary: 'text-primary drop-shadow-sm',
        gold: 'text-gold drop-shadow-sm',
        gradient: 'gradient-text drop-shadow-sm',
      },
      medium: {
        primary: 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]',
        gold: 'text-gold drop-shadow-[0_0_8px_hsl(var(--gold)/0.5)]',
        gradient: 'gradient-text drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)]',
      },
      high: {
        primary: 'text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.7)] animate-glow-pulse',
        gold: 'text-gold drop-shadow-[0_0_15px_hsl(var(--gold)/0.7)] animate-glow-pulse',
        gradient: 'gradient-text drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]',
      },
    };

    return React.createElement(
      Component,
      {
        ref,
        className: cn(glowStyles[intensity][variant], className),
        ...props,
      },
      children
    );
  }
);
GlowText.displayName = "GlowText";

export { GlowText };
