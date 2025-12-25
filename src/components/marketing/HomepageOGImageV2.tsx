import { forwardRef } from "react";
import { MessageSquare, Palette, PaintBucket, LayoutGrid, Rocket, Users, ArrowRight } from "lucide-react";

const capabilities = [
  { icon: MessageSquare, label: "AI Chat", color: "#00d4ff", angle: -60 },
  { icon: PaintBucket, label: "Design System", color: "#a855f7", angle: 0, exclusive: true },
  { icon: LayoutGrid, label: "Components", color: "#22c55e", angle: 60 },
  { icon: Users, label: "Collaborate", color: "#f97316", angle: 120 },
  { icon: Rocket, label: "Deploy", color: "#fbbf24", angle: 180 },
  { icon: Palette, label: "Visual Builder", color: "#ec4899", angle: -120 },
];

interface CapabilityNodeProps {
  icon: React.ElementType;
  label: string;
  color: string;
  x: number;
  y: number;
  exclusive?: boolean;
}

const CapabilityNode = ({ icon: Icon, label, color, x, y, exclusive }: CapabilityNodeProps) => (
  <div
    className="absolute flex flex-col items-center gap-2"
    style={{
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
    }}
  >
    {exclusive && (
      <div
        className="absolute -top-6 px-2 py-0.5 text-[10px] font-bold rounded-full"
        style={{
          background: `linear-gradient(135deg, ${color}40, ${color}20)`,
          border: `1px solid ${color}60`,
          color: color,
        }}
      >
        EXCLUSIVE
      </div>
    )}
    <div
      className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${color}30, ${color}10)`,
        border: `2px solid ${color}60`,
        boxShadow: `0 0 30px ${color}40, inset 0 0 20px ${color}20`,
      }}
    >
      <Icon className="w-7 h-7" style={{ color }} />
    </div>
    <span
      className="text-sm font-semibold whitespace-nowrap"
      style={{ color }}
    >
      {label}
    </span>
  </div>
);

const CentralCore = () => (
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    {/* Outer glow rings */}
    <div
      className="absolute -inset-16 rounded-full opacity-20"
      style={{
        background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)",
      }}
    />
    <div
      className="absolute -inset-10 rounded-full opacity-30"
      style={{
        background: "radial-gradient(circle, #a855f7 0%, transparent 60%)",
      }}
    />
    
    {/* Hexagonal core */}
    <div className="relative">
      <svg width="120" height="140" viewBox="0 0 120 140" className="drop-shadow-2xl">
        <defs>
          <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Hexagon shape */}
        <polygon
          points="60,5 110,35 110,105 60,135 10,105 10,35"
          fill="url(#coreGradient)"
          stroke="#00d4ff"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Inner hexagon */}
        <polygon
          points="60,25 90,45 90,95 60,115 30,95 30,45"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
      
      {/* Logo text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-3xl font-bold"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 30px rgba(0, 212, 255, 0.5)",
          }}
        >
          {">_"}
        </span>
      </div>
    </div>
  </div>
);

const ConnectionLines = () => {
  const centerX = 600;
  const centerY = 280;
  const radius = 180;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Orbital ring */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={radius + 20}
        ry={radius - 20}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="1"
        strokeDasharray="8 4"
        opacity="0.4"
      />
      
      {/* Connection lines to each capability */}
      {capabilities.map((cap, i) => {
        const angleRad = (cap.angle * Math.PI) / 180;
        const x = centerX + Math.cos(angleRad) * (radius + 20);
        const y = centerY + Math.sin(angleRad) * (radius - 20);
        
        return (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke={cap.color}
            strokeWidth="1"
            opacity="0.3"
            strokeDasharray="4 4"
          />
        );
      })}
    </svg>
  );
};

const ParticleField = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    x: Math.random() * 1200,
    y: Math.random() * 630,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: i % 2 === 0 ? "#00d4ff" : "#a855f7",
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

export const HomepageOGImageV2 = forwardRef<HTMLDivElement>((_, ref) => {
  const centerX = 600;
  const centerY = 280;
  const radius = 180;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        width: 1200,
        height: 630,
        background: "linear-gradient(135deg, #030712 0%, #0a0f1a 50%, #0f172a 100%)",
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial gradient overlays */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "30%",
          top: "30%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* Particle field */}
      <ParticleField />

      {/* Connection lines */}
      <ConnectionLines />

      {/* Top badge */}
      <div className="absolute top-8 left-10">
        <div
          className="px-4 py-2 rounded-full text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(168, 85, 247, 0.2))",
            border: "1px solid rgba(0, 212, 255, 0.3)",
            color: "#00d4ff",
          }}
        >
          ✦ AI-Powered Development Platform
        </div>
      </div>

      {/* Top right domain */}
      <div className="absolute top-8 right-10 flex items-center gap-2">
        <span className="text-white/60 text-lg font-medium">kernel.cool</span>
        <ArrowRight className="w-5 h-5 text-white/40" />
      </div>

      {/* Central AI Core */}
      <CentralCore />

      {/* Capability nodes */}
      {capabilities.map((cap, i) => {
        const angleRad = (cap.angle * Math.PI) / 180;
        const x = centerX + Math.cos(angleRad) * (radius + 60);
        const y = centerY + Math.sin(angleRad) * (radius - 10);

        return (
          <CapabilityNode
            key={i}
            icon={cap.icon}
            label={cap.label}
            color={cap.color}
            x={x}
            y={y}
            exclusive={cap.exclusive}
          />
        );
      })}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 px-10 pb-8">
        {/* Divider */}
        <div
          className="h-px mb-6"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), rgba(168, 85, 247, 0.3), transparent)",
          }}
        />

        <div className="flex items-end justify-between">
          {/* Tagline */}
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Build Complete Apps with AI
            </h1>
            <p className="text-lg text-white/50">
              <span style={{ color: "#00d4ff" }}>6 Capabilities</span>
              <span className="mx-2">•</span>
              <span style={{ color: "#a855f7" }}>One Platform</span>
              <span className="mx-2">•</span>
              <span style={{ color: "#22c55e" }}>Zero Compromises</span>
            </p>
          </div>

          {/* CTA */}
          <div
            className="px-6 py-3 rounded-xl text-white font-semibold"
            style={{
              background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
              boxShadow: "0 0 30px rgba(0, 212, 255, 0.3)",
            }}
          >
            Start Building Free →
          </div>
        </div>
      </div>
    </div>
  );
});

HomepageOGImageV2.displayName = "HomepageOGImageV2";
