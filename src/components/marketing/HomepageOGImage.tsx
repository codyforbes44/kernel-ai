import { forwardRef } from "react";
import { MessageSquare, Paintbrush, Zap, ArrowRight, Sparkles } from "lucide-react";

const features = [
  { icon: MessageSquare, label: "AI Chat" },
  { icon: Paintbrush, label: "Visual Builder" },
  { icon: Zap, label: "Instant Deploy" },
];

// Floating geometric shapes as inline SVGs
const FloatingHexagon = ({ style }: { style: React.CSSProperties }) => (
  <svg
    width="60"
    height="52"
    viewBox="0 0 60 52"
    fill="none"
    style={{ position: "absolute", ...style }}
  >
    <path
      d="M30 2L56 15V37L30 50L4 37V15L30 2Z"
      stroke="rgba(0, 212, 255, 0.3)"
      strokeWidth="2"
      fill="rgba(0, 212, 255, 0.05)"
    />
  </svg>
);

const FloatingDiamond = ({ style }: { style: React.CSSProperties }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    style={{ position: "absolute", ...style }}
  >
    <rect
      x="20"
      y="2"
      width="25"
      height="25"
      transform="rotate(45 20 2)"
      stroke="rgba(0, 212, 255, 0.25)"
      strokeWidth="2"
      fill="rgba(0, 212, 255, 0.03)"
    />
  </svg>
);

const FloatingTriangle = ({ style }: { style: React.CSSProperties }) => (
  <svg
    width="50"
    height="44"
    viewBox="0 0 50 44"
    fill="none"
    style={{ position: "absolute", ...style }}
  >
    <path
      d="M25 4L46 40H4L25 4Z"
      stroke="rgba(0, 212, 255, 0.2)"
      strokeWidth="2"
      fill="rgba(0, 212, 255, 0.02)"
    />
  </svg>
);

export const HomepageOGImage = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: 1200,
        height: 630,
        background: "linear-gradient(135deg, #050810 0%, #0a1628 50%, #050810 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Tech Grid Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Dot Grid Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 212, 255, 0.08) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Multi-layer Glow System */}
      <div
        style={{
          position: "absolute",
          top: -300,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1000,
          height: 600,
          background: "radial-gradient(ellipse, rgba(0, 212, 255, 0.12) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 500,
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 50%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: -200,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: -200,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Floating Geometric Shapes */}
      <FloatingHexagon style={{ top: 80, left: 100, opacity: 0.8 }} />
      <FloatingDiamond style={{ top: 120, right: 150, opacity: 0.6 }} />
      <FloatingTriangle style={{ bottom: 100, left: 180, opacity: 0.5 }} />
      <FloatingHexagon style={{ bottom: 80, right: 120, opacity: 0.7, transform: "rotate(30deg)" }} />
      <FloatingDiamond style={{ top: 200, left: 60, opacity: 0.4 }} />
      <FloatingTriangle style={{ top: 60, right: 300, opacity: 0.5, transform: "rotate(180deg)" }} />

      {/* Content Container */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 24,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "rgba(0, 212, 255, 0.08)",
            border: "1px solid rgba(0, 212, 255, 0.25)",
            borderRadius: 100,
            marginBottom: 8,
          }}
        >
          <Sparkles
            style={{
              width: 16,
              height: 16,
              color: "#00d4ff",
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.9)",
              letterSpacing: "0.02em",
            }}
          >
            AI-Powered Development Platform
          </span>
        </div>

        {/* Logo + Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "rgba(0, 212, 255, 0.1)",
              border: "2px solid rgba(0, 212, 255, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 32,
              fontWeight: 700,
              color: "#00d4ff",
              boxShadow: "0 0 60px rgba(0, 212, 255, 0.35), inset 0 0 30px rgba(0, 212, 255, 0.1)",
            }}
          >
            {">_"}
          </div>
          <span
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Kernel
          </span>
        </div>

        {/* Main Headlines */}
        <div style={{ marginBottom: 8 }}>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Build Beautiful Apps
          </h1>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: "linear-gradient(135deg, #00d4ff 0%, #00a8cc 50%, #0099cc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            With AI Assistance
          </h1>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 160,
            height: 4,
            background: "linear-gradient(90deg, transparent, #00d4ff, transparent)",
            borderRadius: 2,
            marginBottom: 8,
          }}
        />

        {/* Features Row */}
        <div style={{ display: "flex", gap: 40, marginBottom: 16 }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 20px",
                  background: "rgba(0, 212, 255, 0.06)",
                  border: "1px solid rgba(0, 212, 255, 0.15)",
                  borderRadius: 12,
                }}
              >
                <Icon
                  style={{
                    width: 22,
                    height: 22,
                    color: "#00d4ff",
                  }}
                />
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {feature.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Subheadline */}
        <p
          style={{
            fontSize: 22,
            color: "rgba(255, 255, 255, 0.55)",
            fontWeight: 400,
            margin: 0,
          }}
        >
          From idea to deployment in minutes
        </p>
      </div>

      {/* Footer CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 24px",
          background: "rgba(0, 212, 255, 0.1)",
          border: "1px solid rgba(0, 212, 255, 0.25)",
          borderRadius: 10,
          boxShadow: "0 0 30px rgba(0, 212, 255, 0.15)",
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#00d4ff",
          }}
        >
          kernel.cool
        </span>
        <ArrowRight
          style={{
            width: 18,
            height: 18,
            color: "#00d4ff",
          }}
        />
      </div>
    </div>
  );
});

HomepageOGImage.displayName = "HomepageOGImage";
