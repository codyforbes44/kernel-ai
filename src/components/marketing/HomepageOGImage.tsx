import { forwardRef } from "react";
import { Sparkles, Hash, Code2, Zap, Database, Layers, Bot, Cpu, Braces } from "lucide-react";

interface FloatingHexagonProps {
  Icon: React.ElementType;
  size: "sm" | "md" | "lg";
  x: number;
  y: number;
  glowing?: boolean;
}

const FloatingHexagon = ({ Icon, size, x, y, glowing = false }: FloatingHexagonProps) => {
  const sizeConfig = {
    sm: { width: 48, height: 56, iconSize: 16, strokeWidth: 1.5 },
    md: { width: 64, height: 74, iconSize: 22, strokeWidth: 2 },
    lg: { width: 96, height: 110, iconSize: 32, strokeWidth: 2.5 },
  };

  const config = sizeConfig[size];

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width: config.width,
        height: config.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 100 115"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          filter: glowing
            ? "drop-shadow(0 0 25px rgba(0, 212, 255, 0.7))"
            : "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))",
        }}
      >
        <polygon
          points="50,2 98,27 98,88 50,113 2,88 2,27"
          fill={glowing ? "rgba(0, 50, 60, 0.95)" : "rgba(8, 30, 45, 0.9)"}
          stroke={glowing ? "rgba(0, 212, 255, 0.9)" : "rgba(0, 180, 210, 0.4)"}
          strokeWidth={config.strokeWidth}
        />
      </svg>
      <Icon
        size={config.iconSize}
        color={glowing ? "#67e8f9" : "rgba(0, 200, 230, 0.75)"}
        style={{ position: "relative", zIndex: 1 }}
      />
    </div>
  );
};

const SmallParticle = ({ x, y, size = 4 }: { x: number; y: number; size?: number }) => (
  <div
    style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      borderRadius: "50%",
      background: "rgba(0, 212, 255, 0.6)",
      boxShadow: "0 0 8px rgba(0, 212, 255, 0.5)",
    }}
  />
);

const ConnectionLine = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <svg
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    }}
  >
    <line
      x1={`${x1}%`}
      y1={`${y1}%`}
      x2={`${x2}%`}
      y2={`${y2}%`}
      stroke="rgba(0, 180, 210, 0.15)"
      strokeWidth="1"
      strokeDasharray="4 4"
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
        background: "linear-gradient(145deg, #051525 0%, #0a2035 35%, #071a2c 65%, #040e18 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Radial gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, rgba(0, 140, 180, 0.12) 0%, transparent 55%)",
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.08,
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Connection lines between hexagons */}
      <ConnectionLine x1={50} y1={18} x2={35} y2={18} />
      <ConnectionLine x1={50} y1={18} x2={80} y2={12} />
      <ConnectionLine x1={50} y1={18} x2={20} y2={30} />
      <ConnectionLine x1={20} y1={30} x2={12} y2={50} />
      <ConnectionLine x1={80} y1={12} x2={88} y2={35} />

      {/* Floating hexagons with icons */}
      <FloatingHexagon Icon={Sparkles} size="lg" x={50} y={18} glowing />
      <FloatingHexagon Icon={Hash} size="md" x={80} y={12} />
      <FloatingHexagon Icon={Code2} size="md" x={20} y={30} />
      <FloatingHexagon Icon={Zap} size="sm" x={88} y={35} />
      <FloatingHexagon Icon={Database} size="md" x={85} y={58} />
      <FloatingHexagon Icon={Layers} size="sm" x={28} y={72} />
      <FloatingHexagon Icon={Bot} size="md" x={12} y={50} />
      <FloatingHexagon Icon={Braces} size="sm" x={35} y={18} />
      <FloatingHexagon Icon={Cpu} size="sm" x={72} y={78} />

      {/* Small particles */}
      <SmallParticle x={15} y={22} size={3} />
      <SmallParticle x={90} y={25} size={2} />
      <SmallParticle x={5} y={60} size={3} />
      <SmallParticle x={95} y={70} size={2} />
      <SmallParticle x={68} y={10} size={2} />
      <SmallParticle x={32} y={85} size={3} />
      <SmallParticle x={58} y={5} size={2} />
      <SmallParticle x={93} y={48} size={2} />

      {/* Main glow effect behind center hexagon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "18%",
          width: 220,
          height: 220,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          paddingTop: 60,
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.1,
            textShadow: "0 2px 30px rgba(0, 0, 0, 0.6)",
          }}
        >
          Build Production-Ready
        </h1>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            margin: "8px 0 0 0",
            lineHeight: 1.1,
            textShadow: "0 2px 30px rgba(0, 0, 0, 0.6)",
          }}
        >
          Beautiful Apps
        </h1>

        <p
          style={{
            fontSize: 22,
            color: "rgba(160, 200, 215, 0.85)",
            marginTop: 28,
            marginBottom: 0,
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          The AI-Powered Development Platform. Chat with AI,
          <br />
          design beautiful interfaces, and deploy in minutes.
        </p>

        {/* CTA Button */}
        <div
          style={{
            marginTop: 36,
            padding: "16px 36px",
            background: "linear-gradient(135deg, rgba(0, 190, 230, 0.95), rgba(0, 150, 190, 0.95))",
            borderRadius: 10,
            fontSize: 20,
            fontWeight: 600,
            color: "#ffffff",
            boxShadow: "0 8px 32px rgba(0, 180, 220, 0.45)",
          }}
        >
          Start Building with AI
        </div>

        <p
          style={{
            fontSize: 16,
            color: "rgba(130, 170, 185, 0.7)",
            marginTop: 20,
          }}
        >
          From idea to deployment in minutes
        </p>
      </div>

      {/* Bottom logo */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, rgba(0, 190, 230, 0.9), rgba(0, 150, 190, 0.9))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Cpu size={20} color="#ffffff" />
        </div>
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "rgba(200, 220, 230, 0.9)",
          }}
        >
          Kernel.cool
        </span>
      </div>
    </div>
  );
});

HomepageOGImage.displayName = "HomepageOGImage";
