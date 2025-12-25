import { forwardRef, useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ============================================================================
// Theme Configuration
// ============================================================================

const LOGO_THEME = {
  colors: {
    primary: "hsl(var(--primary))",
    gold: "hsl(var(--gold))",
    background: "hsl(var(--background))",
  },
  glow: {
    idle: 0.5,
    hover: 1,
    active: 1,
  },
  particles: {
    radius: 20,
    radiusHover: 22,
  },
  timing: {
    borderRotation: 8,
    shimmer: 2,
    shimmerDelay: 3,
    pulse: 1.5,
    particle: 4,
  },
} as const;

// ============================================================================
// Size Configuration
// ============================================================================

const sizeConfig = {
  sm: { container: "w-8 h-8", text: "text-xs", particles: 6 },
  md: { container: "w-10 h-10", text: "text-sm", particles: 8 },
  lg: { container: "w-12 h-12", text: "text-base", particles: 10 },
  xl: { container: "w-16 h-16", text: "text-lg", particles: 12 },
};

// ============================================================================
// Types
// ============================================================================

interface KernelLogoAnimatedProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "static" | "animated" | "minimal";
  isActive?: boolean;
}

interface ParticleConfig {
  initialX: number;
  initialY: number;
  offsetX: number;
  offsetY: number;
}

// ============================================================================
// Helpers
// ============================================================================

const createParticleConfig = (count: number, index: number): ParticleConfig => {
  const angle = (index / count) * Math.PI * 2;
  return {
    initialX: Math.cos(angle) * LOGO_THEME.particles.radius,
    initialY: Math.sin(angle) * LOGO_THEME.particles.radius,
    offsetX: Math.cos(angle + Math.PI) * LOGO_THEME.particles.radiusHover,
    offsetY: Math.sin(angle + Math.PI) * LOGO_THEME.particles.radiusHover,
  };
};

// ============================================================================
// Sub-Components
// ============================================================================

interface SubComponentProps {
  isHovered: boolean;
  isActive: boolean;
  shouldAnimate: boolean;
  variant: "static" | "animated" | "minimal";
}

// Outer glow ring
const LogoGlowRing = memo(({ isHovered, isActive, shouldAnimate }: SubComponentProps) => (
  <motion.div
    className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent"
    initial={false}
    animate={shouldAnimate ? {
      opacity: isHovered || isActive ? 1 : 0.5,
      scale: isHovered ? 1.15 : 1,
    } : {
      opacity: isActive ? 1 : 0.5,
      scale: 1,
    }}
    transition={{ duration: 0.3 }}
    style={{ willChange: shouldAnimate ? "opacity, transform" : "auto" }}
  />
));
LogoGlowRing.displayName = "LogoGlowRing";

// Animated border with conic gradient
const LogoAnimatedBorder = memo(({ shouldAnimate, variant }: Pick<SubComponentProps, "shouldAnimate" | "variant">) => {
  const shouldRotate = shouldAnimate && variant === "animated";
  const rotationDuration = variant === "minimal" ? LOGO_THEME.timing.borderRotation * 2 : LOGO_THEME.timing.borderRotation;

  return (
    <motion.div
      className="absolute inset-0 rounded-xl"
      style={{
        background: `conic-gradient(from 0deg, ${LOGO_THEME.colors.primary}, ${LOGO_THEME.colors.gold}, ${LOGO_THEME.colors.primary})`,
        padding: "1px",
        willChange: shouldRotate ? "transform" : "auto",
      }}
      animate={shouldRotate ? { rotate: 360 } : { rotate: 0 }}
      transition={shouldRotate ? {
        duration: rotationDuration,
        repeat: Infinity,
        ease: "linear",
      } : undefined}
    >
      <div className="w-full h-full rounded-xl bg-background" />
    </motion.div>
  );
});
LogoAnimatedBorder.displayName = "LogoAnimatedBorder";

// Neural network SVG pattern
const LogoNeuralPattern = memo(({ shouldAnimate }: Pick<SubComponentProps, "shouldAnimate">) => (
  <svg
    className="absolute inset-0 w-full h-full opacity-20"
    viewBox="0 0 40 40"
    aria-hidden="true"
  >
    <motion.path
      d="M10,20 Q20,10 30,20 Q20,30 10,20"
      fill="none"
      stroke={LOGO_THEME.colors.primary}
      strokeWidth="0.5"
      initial={false}
      animate={shouldAnimate ? {
        pathLength: [0, 1, 0],
        opacity: [0.3, 0.8, 0.3],
      } : { pathLength: 1, opacity: 0.5 }}
      transition={shouldAnimate ? {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      } : undefined}
    />
    <motion.circle
      cx="20"
      cy="20"
      r="2"
      fill={LOGO_THEME.colors.primary}
      initial={false}
      animate={shouldAnimate ? {
        scale: [1, 1.5, 1],
        opacity: [0.5, 1, 0.5],
      } : { scale: 1, opacity: 0.7 }}
      transition={shouldAnimate ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      } : undefined}
    />
  </svg>
));
LogoNeuralPattern.displayName = "LogoNeuralPattern";

// Core glyph with shimmer effect
interface LogoCoreGlyphProps {
  textClass: string;
  isHovered: boolean;
  shouldAnimate: boolean;
  variant: "static" | "animated" | "minimal";
}

const LogoCoreGlyph = memo(({ textClass, isHovered, shouldAnimate, variant }: LogoCoreGlyphProps) => {
  const showShimmer = shouldAnimate && variant === "animated";

  return (
    <motion.div
      className={cn("relative z-10 font-mono font-bold text-primary", textClass)}
      animate={shouldAnimate ? {
        textShadow: isHovered
          ? `0 0 20px ${LOGO_THEME.colors.primary}, 0 0 40px hsl(var(--primary) / 0.5)`
          : `0 0 10px hsl(var(--primary) / 0.5)`,
      } : undefined}
    >
      <span className="relative">
        {showShimmer && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: LOGO_THEME.timing.shimmer,
              repeat: Infinity,
              repeatDelay: LOGO_THEME.timing.shimmerDelay,
              ease: "easeInOut",
            }}
            style={{ mixBlendMode: "overlay" }}
            aria-hidden="true"
          />
        )}
        {">_"}
      </span>
    </motion.div>
  );
});
LogoCoreGlyph.displayName = "LogoCoreGlyph";

// Orbiting particles
interface LogoOrbitingParticlesProps {
  particleConfigs: ParticleConfig[];
  shouldAnimate: boolean;
}

const LogoOrbitingParticles = memo(({ particleConfigs, shouldAnimate }: LogoOrbitingParticlesProps) => {
  if (!shouldAnimate) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {particleConfigs.map((config, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary"
          style={{
            left: "50%",
            top: "50%",
            willChange: "transform, opacity",
          }}
          animate={{
            x: [config.initialX, config.offsetX, config.initialX],
            y: [config.initialY, config.offsetY, config.initialY],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: LOGO_THEME.timing.particle + i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
});
LogoOrbitingParticles.displayName = "LogoOrbitingParticles";

// Pulse ring effect for active state
const LogoPulseRing = memo(({ isActive, shouldAnimate }: Pick<SubComponentProps, "isActive" | "shouldAnimate">) => {
  if (!shouldAnimate || !isActive) return null;

  return (
    <motion.div
      className="absolute inset-0 rounded-xl border border-primary/50"
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.5, 0, 0.5],
      }}
      transition={{
        duration: LOGO_THEME.timing.pulse,
        repeat: Infinity,
        ease: "easeOut",
      }}
      style={{ willChange: "transform, opacity" }}
      aria-hidden="true"
    />
  );
});
LogoPulseRing.displayName = "LogoPulseRing";

// ============================================================================
// Main Component
// ============================================================================

export const KernelLogoAnimated = memo(forwardRef<HTMLDivElement, KernelLogoAnimatedProps>(
  ({ size = "md", variant = "animated", isActive = false, className, onClick, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const { shouldReduceMotion } = useReducedMotion();
    const config = sizeConfig[size];

    // Determine if animations should run based on variant and reduced motion preference
    const shouldAnimate = useMemo(() => {
      if (shouldReduceMotion) return false;
      if (variant === "static") return false;
      return true;
    }, [shouldReduceMotion, variant]);

    // Memoize particle configurations
    const particleConfigs = useMemo(() => {
      if (variant !== "animated" || shouldReduceMotion) return [];
      return Array.from({ length: config.particles }, (_, i) =>
        createParticleConfig(config.particles, i)
      );
    }, [config.particles, variant, shouldReduceMotion]);

    // Sub-component common props
    const subProps: SubComponentProps = {
      isHovered,
      isActive,
      shouldAnimate,
      variant,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center cursor-pointer select-none",
          config.container,
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        role="img"
        aria-label="Kernel Logo"
        {...props}
      >
        <LogoGlowRing {...subProps} />
        <LogoAnimatedBorder shouldAnimate={shouldAnimate} variant={variant} />

        {/* Inner container */}
        <div className="absolute inset-[2px] rounded-[10px] bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center overflow-hidden">
          <LogoNeuralPattern shouldAnimate={shouldAnimate && variant === "animated"} />
          <LogoCoreGlyph
            textClass={config.text}
            isHovered={isHovered}
            shouldAnimate={shouldAnimate}
            variant={variant}
          />
        </div>

        {variant === "animated" && (
          <LogoOrbitingParticles
            particleConfigs={particleConfigs}
            shouldAnimate={shouldAnimate}
          />
        )}

        <LogoPulseRing isActive={isActive} shouldAnimate={shouldAnimate} />
      </div>
    );
  }
));

KernelLogoAnimated.displayName = "KernelLogoAnimated";
