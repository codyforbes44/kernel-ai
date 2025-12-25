import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const holoBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 hover:shadow-sm hover:shadow-primary/20",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        glow:
          "border-primary/50 bg-primary/20 text-primary shadow-sm shadow-primary/30 hover:shadow-md hover:shadow-primary/40",
        success:
          "border-success/30 bg-success/10 text-success hover:bg-success/20",
        warning:
          "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
        gold:
          "border-gold/40 bg-gold/15 text-gold hover:bg-gold/25 hover:shadow-sm hover:shadow-gold/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface HoloBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof holoBadgeVariants> {
  pulse?: boolean;
}

function HoloBadge({ className, variant, pulse, ...props }: HoloBadgeProps) {
  return (
    <div 
      className={cn(
        holoBadgeVariants({ variant }), 
        pulse && "animate-pulse",
        className
      )} 
      {...props} 
    />
  );
}

export { HoloBadge, holoBadgeVariants };
