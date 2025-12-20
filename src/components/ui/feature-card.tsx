import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const featureCardVariants = cva(
  "relative rounded-xl backdrop-blur-md transition-all duration-300 group",
  {
    variants: {
      variant: {
        default: [
          "bg-card/60",
          "shadow-[0_8px_32px_hsl(0_0%_0%/0.3)]",
        ],
        glow: [
          "bg-card/50",
          "shadow-[0_0_25px_hsl(var(--primary)/0.15),0_8px_32px_hsl(0_0%_0%/0.25)]",
          "hover:shadow-[0_0_40px_hsl(var(--primary)/0.3),0_8px_32px_hsl(0_0%_0%/0.3)]",
        ],
        intense: [
          "bg-card/70",
          "shadow-[0_0_40px_hsl(var(--primary)/0.2),0_8px_40px_hsl(0_0%_0%/0.35)]",
          "hover:shadow-[0_0_60px_hsl(var(--primary)/0.35),0_12px_48px_hsl(0_0%_0%/0.4)]",
        ],
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "glow",
      size: "default",
    },
  }
);

export interface FeatureCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof featureCardVariants> {
  /** Enable animated rotating border */
  animatedBorder?: boolean;
  /** Border animation speed in seconds */
  borderSpeed?: number;
  /** Enable hover scale effect */
  hoverScale?: boolean;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      className,
      variant,
      size,
      animatedBorder = true,
      borderSpeed = 3,
      hoverScale = true,
      icon,
      title,
      description,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          featureCardVariants({ variant, size }),
          hoverScale && "hover:scale-[1.02]",
          "overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Animated rotating border gradient */}
        {animatedBorder && (
          <>
            {/* Outer glow pulse */}
            <div
              className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(90deg, 
                  hsl(var(--primary)) 0%, 
                  hsl(var(--primary) / 0.5) 50%, 
                  hsl(var(--primary)) 100%)`,
                filter: "blur(8px)",
              }}
            />
            
            {/* Rotating border */}
            <div
              className="absolute -inset-[1px] rounded-xl"
              style={{
                background: `conic-gradient(
                  from var(--border-angle, 0deg),
                  hsl(var(--primary) / 0.1) 0%,
                  hsl(var(--primary)) 10%,
                  hsl(var(--primary) / 0.8) 20%,
                  hsl(var(--primary) / 0.1) 30%,
                  transparent 50%,
                  hsl(var(--primary) / 0.1) 70%,
                  hsl(var(--primary) / 0.8) 80%,
                  hsl(var(--primary)) 90%,
                  hsl(var(--primary) / 0.1) 100%
                )`,
                animation: `rotate-border ${borderSpeed}s linear infinite`,
              }}
            />
            
            {/* Inner background to create border effect */}
            <div className="absolute inset-[1px] rounded-[10px] bg-card/95 backdrop-blur-md" />
          </>
        )}
        
        {/* Static border for non-animated */}
        {!animatedBorder && (
          <div className="absolute inset-0 rounded-xl border border-primary/30 group-hover:border-primary/50 transition-colors" />
        )}
        
        {/* Inner glow effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-50 group-hover:opacity-80 transition-opacity"
          style={{
            background: `radial-gradient(ellipse at top, hsl(var(--primary) / 0.12) 0%, transparent 60%)`,
          }}
        />
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent" />
          <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-primary to-transparent" />
        </div>
        <div className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary to-transparent" />
          <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-primary to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent" />
          <div className="absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-primary to-transparent" />
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary to-transparent" />
          <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-primary to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {icon && (
            <div className="h-12 w-12 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_15px_hsl(var(--primary)/0.2)] group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] group-hover:border-primary/50 transition-all duration-300">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          )}
          {children}
        </div>
        
        <style>{`
          @property --border-angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          
          @keyframes rotate-border {
            from { --border-angle: 0deg; }
            to { --border-angle: 360deg; }
          }
        `}</style>
      </div>
    );
  }
);
FeatureCard.displayName = "FeatureCard";

// Preset component for common feature highlight use case
interface FeatureHighlightProps extends Omit<FeatureCardProps, "icon"> {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureHighlight = React.forwardRef<HTMLDivElement, FeatureHighlightProps>(
  ({ icon, title, description, ...props }, ref) => {
    return (
      <FeatureCard
        ref={ref}
        icon={icon}
        title={title}
        description={description}
        {...props}
      />
    );
  }
);
FeatureHighlight.displayName = "FeatureHighlight";

export { FeatureCard, FeatureHighlight };
