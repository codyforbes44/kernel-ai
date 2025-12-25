import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KernelLogoAnimatedProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "static" | "animated" | "minimal";
  isActive?: boolean;
}

const sizeConfig = {
  sm: { container: "w-8 h-8", text: "text-xs", particles: 6 },
  md: { container: "w-10 h-10", text: "text-sm", particles: 8 },
  lg: { container: "w-12 h-12", text: "text-base", particles: 10 },
  xl: { container: "w-16 h-16", text: "text-lg", particles: 12 },
};

export const KernelLogoAnimated = forwardRef<HTMLDivElement, KernelLogoAnimatedProps>(
  ({ size = "md", variant = "animated", isActive = false, className, onClick, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const config = sizeConfig[size];

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
        {...props}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent"
          animate={{
            opacity: isHovered || isActive ? 1 : 0.5,
            scale: isHovered ? 1.15 : 1,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--gold)), hsl(var(--primary)))`,
            padding: "1px",
          }}
          animate={{
            rotate: variant === "animated" ? 360 : 0,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full rounded-xl bg-background" />
        </motion.div>

        {/* Inner container */}
        <div className="absolute inset-[2px] rounded-[10px] bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center overflow-hidden">
          {/* Neural network pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 40 40"
          >
            <motion.path
              d="M10,20 Q20,10 30,20 Q20,30 10,20"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="20"
              cy="20"
              r="2"
              fill="hsl(var(--primary))"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>

          {/* Core glyph */}
          <motion.div
            className={cn(
              "relative z-10 font-mono font-bold text-primary",
              config.text
            )}
            animate={{
              textShadow: isHovered
                ? "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary)/0.5)"
                : "0 0 10px hsl(var(--primary)/0.5)",
            }}
          >
            <span className="relative">
              {/* Holographic shimmer overlay */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
                style={{ mixBlendMode: "overlay" }}
              />
              {">_"}
            </span>
          </motion.div>
        </div>

        {/* Orbiting particles */}
        {variant === "animated" && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: config.particles }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: [
                    Math.cos((i / config.particles) * Math.PI * 2) * 20,
                    Math.cos((i / config.particles) * Math.PI * 2 + Math.PI) * 22,
                    Math.cos((i / config.particles) * Math.PI * 2) * 20,
                  ],
                  y: [
                    Math.sin((i / config.particles) * Math.PI * 2) * 20,
                    Math.sin((i / config.particles) * Math.PI * 2 + Math.PI) * 22,
                    Math.sin((i / config.particles) * Math.PI * 2) * 20,
                  ],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 4 + i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}

        {/* Pulse effect on active/hover */}
        <motion.div
          className="absolute inset-0 rounded-xl border border-primary/50"
          animate={{
            scale: isActive ? [1, 1.3, 1] : 1,
            opacity: isActive ? [0.5, 0, 0.5] : 0,
          }}
          transition={{
            duration: 1.5,
            repeat: isActive ? Infinity : 0,
            ease: "easeOut",
          }}
        />
      </div>
    );
  }
);

KernelLogoAnimated.displayName = "KernelLogoAnimated";
