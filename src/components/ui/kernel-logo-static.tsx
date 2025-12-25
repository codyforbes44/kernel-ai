import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface KernelLogoStaticProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

/**
 * Static version of the Kernel logo optimized for PNG export.
 * No animations - pure static rendering for clean image capture.
 */
export const KernelLogoStatic = forwardRef<HTMLDivElement, KernelLogoStaticProps>(
  ({ size = 512, className, ...props }, ref) => {
    const borderWidth = Math.max(2, size * 0.008);
    const borderRadius = size * 0.15;
    const innerRadius = borderRadius - borderWidth;
    const fontSize = size * 0.28;
    const glyphOffset = size * 0.02;

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center", className)}
        style={{
          width: size,
          height: size,
          backgroundColor: "#0a0a0f",
        }}
        {...props}
      >
        {/* Outer glow */}
        <div
          className="absolute"
          style={{
            inset: size * 0.1,
            borderRadius: borderRadius * 1.2,
            background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)",
            filter: `blur(${size * 0.05}px)`,
          }}
        />

        {/* Gradient border container */}
        <div
          className="absolute"
          style={{
            inset: size * 0.15,
            borderRadius,
            background: "conic-gradient(from 45deg, #00d4ff, #ffd700, #00d4ff)",
            padding: borderWidth,
          }}
        >
          {/* Inner dark background */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: innerRadius,
              background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, rgba(0,212,255,0.03) 100%)",
            }}
          />
        </div>

        {/* Inner container with pattern */}
        <div
          className="absolute flex items-center justify-center overflow-hidden"
          style={{
            inset: size * 0.15 + borderWidth + 2,
            borderRadius: innerRadius - 2,
            background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d14 100%)",
          }}
        >
          {/* Neural network diamond pattern */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            style={{ opacity: 0.25 }}
          >
            {/* Diamond shape */}
            <path
              d="M50,15 L85,50 L50,85 L15,50 Z"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="0.8"
            />
            {/* Inner diamond */}
            <path
              d="M50,30 L70,50 L50,70 L30,50 Z"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="0.5"
            />
            {/* Center dot */}
            <circle cx="50" cy="50" r="3" fill="#00d4ff" opacity="0.8" />
            {/* Corner dots */}
            <circle cx="50" cy="15" r="2" fill="#00d4ff" opacity="0.6" />
            <circle cx="85" cy="50" r="2" fill="#00d4ff" opacity="0.6" />
            <circle cx="50" cy="85" r="2" fill="#00d4ff" opacity="0.6" />
            <circle cx="15" cy="50" r="2" fill="#00d4ff" opacity="0.6" />
          </svg>

          {/* Core glyph */}
          <div
            className="relative z-10 font-mono font-bold select-none"
            style={{
              fontSize,
              color: "#00d4ff",
              textShadow: "0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.2)",
              letterSpacing: `-${glyphOffset}px`,
            }}
          >
            {">_"}
          </div>
        </div>

        {/* Subtle corner accents */}
        <div
          className="absolute"
          style={{
            top: size * 0.12,
            left: size * 0.12,
            width: size * 0.08,
            height: size * 0.08,
            borderTop: `${borderWidth}px solid rgba(0,212,255,0.3)`,
            borderLeft: `${borderWidth}px solid rgba(0,212,255,0.3)`,
            borderRadius: `${borderRadius * 0.3}px 0 0 0`,
          }}
        />
        <div
          className="absolute"
          style={{
            top: size * 0.12,
            right: size * 0.12,
            width: size * 0.08,
            height: size * 0.08,
            borderTop: `${borderWidth}px solid rgba(255,215,0,0.3)`,
            borderRight: `${borderWidth}px solid rgba(255,215,0,0.3)`,
            borderRadius: `0 ${borderRadius * 0.3}px 0 0`,
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: size * 0.12,
            left: size * 0.12,
            width: size * 0.08,
            height: size * 0.08,
            borderBottom: `${borderWidth}px solid rgba(255,215,0,0.3)`,
            borderLeft: `${borderWidth}px solid rgba(255,215,0,0.3)`,
            borderRadius: `0 0 0 ${borderRadius * 0.3}px`,
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: size * 0.12,
            right: size * 0.12,
            width: size * 0.08,
            height: size * 0.08,
            borderBottom: `${borderWidth}px solid rgba(0,212,255,0.3)`,
            borderRight: `${borderWidth}px solid rgba(0,212,255,0.3)`,
            borderRadius: `0 0 ${borderRadius * 0.3}px 0`,
          }}
        />
      </div>
    );
  }
);

KernelLogoStatic.displayName = "KernelLogoStatic";
