import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

const glassCardVariants = cva(
  "relative rounded-xl backdrop-blur-md border transition-all duration-300 transform-gpu",
  {
    variants: {
      variant: {
        default: [
          "bg-card/60",
          "border-border/40",
          "shadow-[0_8px_32px_hsl(0_0%_0%/0.3)]",
        ],
        glow: [
          "bg-card/50",
          "border-primary/30",
          "shadow-[0_0_25px_hsl(var(--primary)/0.15),0_8px_32px_hsl(0_0%_0%/0.25)]",
          "hover:shadow-[0_0_35px_hsl(var(--primary)/0.25),0_8px_32px_hsl(0_0%_0%/0.3)]",
          "hover:border-primary/50",
        ],
        subtle: [
          "bg-card/40",
          "border-border/30",
          "shadow-[0_4px_20px_hsl(0_0%_0%/0.2)]",
        ],
        intense: [
          "bg-card/70",
          "border-primary/40",
          "shadow-[0_0_40px_hsl(var(--primary)/0.2),0_8px_40px_hsl(0_0%_0%/0.35)]",
          "hover:shadow-[0_0_50px_hsl(var(--primary)/0.3),0_12px_48px_hsl(0_0%_0%/0.4)]",
          "hover:border-primary/60",
        ],
        // New visionOS-inspired spatial variant
        spatial: [
          "bg-gradient-to-br from-card/70 via-card/50 to-card/30",
          "border-primary/20",
          "shadow-[0_0_30px_hsl(var(--primary)/0.1),0_20px_60px_-20px_hsl(0_0%_0%/0.4)]",
          "hover:shadow-[0_0_50px_hsl(var(--primary)/0.2),0_30px_80px_-25px_hsl(0_0%_0%/0.5)]",
          "hover:border-primary/40",
          "hover:-translate-y-1",
        ],
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  /** Show animated glow border effect */
  animatedBorder?: boolean;
  /** Enable gyroscope-based tilt effect */
  gyroscopeTilt?: boolean;
  /** Enable edge refraction highlight */
  edgeRefraction?: boolean;
  /** Depth for 3D effect */
  depth?: number;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    animatedBorder, 
    gyroscopeTilt = false,
    edgeRefraction = false,
    depth = 0,
    children, 
    style,
    ...props 
  }, ref) => {
    const { normalizedTilt, isSupported } = useDeviceOrientation();
    const [smoothTilt, setSmoothTilt] = React.useState({ x: 0, y: 0 });

    // Smooth gyroscope interpolation
    React.useEffect(() => {
      if (!gyroscopeTilt || !isSupported) return;

      const lerp = 0.08;
      let rafId: number;
      
      const animate = () => {
        setSmoothTilt(prev => ({
          x: prev.x + (normalizedTilt.x - prev.x) * lerp,
          y: prev.y + (normalizedTilt.y - prev.y) * lerp,
        }));
        rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId);
    }, [normalizedTilt.x, normalizedTilt.y, gyroscopeTilt, isSupported]);

    // Calculate tilt-based transforms
    const tiltTransform = gyroscopeTilt && isSupported ? {
      transform: `
        perspective(1200px)
        rotateX(${-smoothTilt.y * 5}deg)
        rotateY(${smoothTilt.x * 5}deg)
        translateZ(${depth}px)
      `,
    } : depth !== 0 ? {
      transform: `translateZ(${depth}px)`,
    } : {};

    // Edge refraction gradient position
    const refractionAngle = Math.atan2(smoothTilt.y, smoothTilt.x) * (180 / Math.PI) + 90;

    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size }),
          animatedBorder && "overflow-hidden",
          gyroscopeTilt && "will-change-transform",
          className
        )}
        style={{
          ...style,
          ...tiltTransform,
          transformStyle: 'preserve-3d',
        }}
        {...props}
      >
        {/* Animated border gradient */}
        {animatedBorder && (
          <div
            className="absolute inset-0 -z-10 rounded-xl opacity-50"
            style={{
              background: `linear-gradient(135deg, 
                hsl(185 100% 50% / 0.3) 0%, 
                transparent 40%, 
                transparent 60%, 
                hsl(185 100% 50% / 0.3) 100%)`,
              backgroundSize: "200% 200%",
              animation: "shimmer-border 4s ease-in-out infinite",
            }}
          />
        )}
        
        {/* Edge refraction highlight - visionOS style */}
        {edgeRefraction && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none opacity-60"
            style={{
              background: `linear-gradient(${refractionAngle}deg, 
                hsl(var(--primary) / 0.15) 0%, 
                transparent 30%, 
                transparent 70%, 
                hsl(var(--primary) / 0.1) 100%)`,
              transition: 'background 0.1s ease-out',
            }}
          />
        )}
        
        {/* Glass thickness effect - top edge highlight */}
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-xl pointer-events-none"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              hsl(var(--primary) / 0.3) 20%, 
              hsl(var(--primary) / 0.5) 50%, 
              hsl(var(--primary) / 0.3) 80%, 
              transparent 100%)`,
          }}
        />
        
        {/* Inner glow effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(ellipse at top, hsl(var(--primary) / 0.08) 0%, transparent 50%)`,
          }}
        />
        
        {/* Environment color bleeding from grid */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-30"
          style={{
            background: `radial-gradient(ellipse at bottom, hsl(var(--primary) / 0.1) 0%, transparent 60%)`,
          }}
        />
        
        {/* Content */}
        <div className="relative z-10" style={{ transform: 'translateZ(1px)' }}>
          {children}
        </div>
        
        <style>{`
          @keyframes shimmer-border {
            0%, 100% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
          }
        `}</style>
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
GlassCardHeader.displayName = "GlassCardHeader";

const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
GlassCardDescription.displayName = "GlassCardDescription";

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
GlassCardFooter.displayName = "GlassCardFooter";

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
};
