import * as React from "react";
import { cn } from "@/lib/utils";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

interface HoloCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'bordered' | 'spatial';
  hover?: boolean;
  /** Enable gyroscope-based perspective tilt */
  gyroscopeTilt?: boolean;
  /** Enable color-shifting edge highlights */
  chromaticEdge?: boolean;
  /** Depth value for z-transform */
  depth?: number;
}

const HoloCard = React.forwardRef<HTMLDivElement, HoloCardProps>(
  ({ 
    className, 
    variant = 'default', 
    hover = true, 
    gyroscopeTilt = false,
    chromaticEdge = false,
    depth = 0,
    children, 
    style,
    ...props 
  }, ref) => {
    const { normalizedTilt, isSupported } = useDeviceOrientation();
    const [smoothTilt, setSmoothTilt] = React.useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = React.useState(false);

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

    // Calculate transforms
    const tiltX = smoothTilt.y * 8;
    const tiltY = smoothTilt.x * 8;
    const hoverDepth = isHovered ? 20 : 0;

    const transformStyle = gyroscopeTilt && isSupported ? {
      transform: `
        perspective(1200px)
        rotateX(${-tiltX}deg)
        rotateY(${tiltY}deg)
        translateZ(${depth + hoverDepth}px)
        scale(${isHovered ? 1.02 : 1})
      `,
    } : {
      transform: `
        translateZ(${depth + hoverDepth}px)
        scale(${isHovered ? 1.02 : 1})
      `,
    };

    // Chromatic edge angle based on tilt
    const chromaticAngle = Math.atan2(smoothTilt.y, smoothTilt.x) * (180 / Math.PI);

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl bg-card/80 backdrop-blur-sm border border-border/50",
          "transition-all duration-300 ease-out transform-gpu will-change-transform",
          // Holographic gradient overlay
          "before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300",
          "before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-accent/10",
          hover && [
            "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
            "hover:before:opacity-100",
          ],
          variant === 'glow' && [
            "shadow-md shadow-primary/5",
            "before:opacity-50",
          ],
          variant === 'bordered' && [
            "border-primary/30",
            "bg-gradient-to-br from-card to-card/60",
          ],
          variant === 'spatial' && [
            "bg-gradient-to-br from-card/80 via-card/60 to-card/40",
            "border-primary/20",
            "shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.2)]",
          ],
          className
        )}
        style={{
          ...style,
          ...transformStyle,
          transformStyle: 'preserve-3d',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Chromatic edge highlight */}
        {chromaticEdge && (
          <>
            <div
              className="absolute inset-0 rounded-xl pointer-events-none opacity-40"
              style={{
                background: `linear-gradient(${chromaticAngle + 90}deg, 
                  hsl(185 100% 50% / 0.2) 0%, 
                  transparent 40%, 
                  transparent 60%, 
                  hsl(280 100% 60% / 0.2) 100%)`,
                transition: 'background 0.15s ease-out',
              }}
            />
            {/* Top edge glow line */}
            <div
              className="absolute inset-x-2 top-0 h-px rounded-t-xl pointer-events-none"
              style={{
                background: `linear-gradient(90deg,
                  transparent 0%,
                  hsl(185 100% 60% / 0.4) 30%,
                  hsl(var(--primary) / 0.6) 50%,
                  hsl(280 100% 60% / 0.4) 70%,
                  transparent 100%)`,
              }}
            />
          </>
        )}
        
        {/* Scan line effect */}
        <div 
          className={cn(
            "absolute inset-0 rounded-xl overflow-hidden pointer-events-none",
            "transition-opacity duration-300",
            isHovered ? "opacity-30" : "opacity-0"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan-line" />
        </div>
        
        {/* Glass thickness - bottom edge shadow */}
        <div
          className="absolute inset-x-0 -bottom-px h-2 rounded-b-xl pointer-events-none opacity-50"
          style={{
            background: `linear-gradient(to bottom, transparent, hsl(var(--background) / 0.5))`,
          }}
        />
        
        {/* Content with subtle Z offset */}
        <div className="relative z-10" style={{ transform: 'translateZ(2px)' }}>
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
