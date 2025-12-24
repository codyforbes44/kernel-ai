import { forwardRef } from "react";
import { MessageSquare, Paintbrush, Zap, ArrowRight } from "lucide-react";

const features = [
  { icon: MessageSquare, label: "AI Chat" },
  { icon: Paintbrush, label: "Visual Builder" },
  { icon: Zap, label: "Instant Deploy" },
];

export const HomepageOGImage = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: 1200,
        height: 630,
        background: "linear-gradient(135deg, #070a0f 0%, #0a1020 50%, #070a0f 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: 60,
      }}
    >
      {/* Background Grid Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(0, 212, 255, 0.08) 1px, transparent 0)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Left Cyan Glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Bottom Right Cyan Glow */}
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: -200,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Center Accent Glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 400,
          background: "radial-gradient(ellipse, rgba(0, 212, 255, 0.05) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />

      {/* Content Container */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Header: Logo + Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 50 }}>
          {/* Kernel Logo */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "rgba(0, 212, 255, 0.12)",
              border: "2px solid rgba(0, 212, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 28,
              fontWeight: 700,
              color: "#00d4ff",
              boxShadow: "0 0 40px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)",
            }}
          >
            {">_"}
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Kernel
          </span>
        </div>

        {/* Main Headline */}
        <div style={{ marginBottom: 24 }}>
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
              background: "linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)",
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

        {/* Divider Line */}
        <div
          style={{
            width: 120,
            height: 4,
            background: "linear-gradient(90deg, #00d4ff, transparent)",
            borderRadius: 2,
            marginBottom: 40,
          }}
        />

        {/* Features Row */}
        <div style={{ display: "flex", gap: 48, marginBottom: 40 }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "rgba(0, 212, 255, 0.1)",
                    border: "1px solid rgba(0, 212, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    style={{
                      width: 22,
                      height: 22,
                      color: "#00d4ff",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 20,
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
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.6)",
            fontWeight: 400,
            margin: 0,
          }}
        >
          From idea to production in minutes
        </p>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer: URL */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              background: "rgba(0, 212, 255, 0.08)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: 8,
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
      </div>
    </div>
  );
});

HomepageOGImage.displayName = "HomepageOGImage";
