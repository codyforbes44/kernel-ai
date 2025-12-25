import { forwardRef, useMemo } from "react";
import {
  MessageSquare,
  Palette,
  Database,
  Rocket,
  Shield,
  Zap,
} from "lucide-react";

// X/Twitter cover dimensions: 1500x500 (3:1 ratio)
const COVER_WIDTH = 1500;
const COVER_HEIGHT = 500;

// Capability nodes for horizontal layout (reduced to 6 for spacing)
const capabilities = [
  { icon: MessageSquare, label: "AI Chat", color: "#60A5FA" },
  { icon: Palette, label: "Design", color: "#A78BFA" },
  { icon: Database, label: "Database", color: "#34D399" },
  { icon: Shield, label: "Security", color: "#F472B6" },
  { icon: Zap, label: "Edge", color: "#FBBF24" },
  { icon: Rocket, label: "Deploy", color: "#F87171" },
];

// Particle field for background atmosphere
const XCoverParticleField = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * COVER_WIDTH,
      y: Math.random() * COVER_HEIGHT,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(168, 139, 250, ${p.opacity})`,
          }}
        />
      ))}
    </div>
  );
};

// Connection lines between nodes
const XCoverConnectionLines = () => {
  const nodePositions = useMemo(() => {
    const centerX = COVER_WIDTH / 2;
    const centerY = COVER_HEIGHT / 2;
    const spacing = 180;
    
    return capabilities.map((_, i) => {
      const offset = (i - (capabilities.length - 1) / 2) * spacing;
      return { x: centerX + offset, y: centerY };
    });
  }, []);

  return (
    <svg
      className="absolute inset-0"
      width={COVER_WIDTH}
      height={COVER_HEIGHT}
      style={{ opacity: 0.3 }}
    >
      <defs>
        <linearGradient id="xcover-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0" />
          <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Horizontal connecting line */}
      <line
        x1={nodePositions[0]?.x ?? 0}
        y1={COVER_HEIGHT / 2}
        x2={nodePositions[nodePositions.length - 1]?.x ?? COVER_WIDTH}
        y2={COVER_HEIGHT / 2}
        stroke="url(#xcover-line-gradient)"
        strokeWidth="2"
        strokeDasharray="8,4"
      />
      
      {/* Subtle arc above */}
      <path
        d={`M ${nodePositions[0]?.x ?? 200} ${COVER_HEIGHT / 2} Q ${COVER_WIDTH / 2} ${COVER_HEIGHT / 2 - 80} ${nodePositions[nodePositions.length - 1]?.x ?? COVER_WIDTH - 200} ${COVER_HEIGHT / 2}`}
        fill="none"
        stroke="url(#xcover-line-gradient)"
        strokeWidth="1"
        strokeDasharray="4,8"
        opacity="0.5"
      />
    </svg>
  );
};

// Central logo core
const XCoverCentralCore = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl"
        style={{
          background: "radial-gradient(circle, rgba(168, 139, 250, 0.4) 0%, transparent 70%)",
          width: 140,
          height: 140,
          left: -20,
          top: -20,
        }}
      />
      
      {/* Hexagon container */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 100,
          height: 100,
          background: "linear-gradient(135deg, rgba(168, 139, 250, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%)",
          borderRadius: 16,
          border: "2px solid rgba(168, 139, 250, 0.5)",
          boxShadow: "0 0 40px rgba(168, 139, 250, 0.3), inset 0 0 20px rgba(168, 139, 250, 0.1)",
        }}
      >
        {/* Inner glow ring */}
        <div
          className="absolute inset-2 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(15, 15, 25, 0.9) 0%, rgba(20, 20, 35, 0.9) 100%)",
            border: "1px solid rgba(168, 139, 250, 0.3)",
          }}
        />
        
        {/* Core glyph */}
        <span
          className="relative z-10 font-mono font-bold"
          style={{
            fontSize: 32,
            color: "#A78BFA",
            textShadow: "0 0 20px rgba(168, 139, 250, 0.8), 0 0 40px rgba(168, 139, 250, 0.4)",
          }}
        >
          {">_"}
        </span>
      </div>
    </div>
  );
};

// Individual capability node
const XCoverCapabilityNode = ({
  icon: Icon,
  label,
  color,
  position,
}: {
  icon: typeof MessageSquare;
  label: string;
  color: string;
  position: { x: number; y: number };
}) => {
  return (
    <div
      className="absolute flex flex-col items-center gap-2 -translate-x-1/2 -translate-y-1/2"
      style={{ left: position.x, top: position.y }}
    >
      {/* Node circle */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 48,
          height: 48,
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          border: `1.5px solid ${color}60`,
          boxShadow: `0 0 20px ${color}30`,
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      
      {/* Label */}
      <span
        className="text-xs font-medium whitespace-nowrap"
        style={{ color: `${color}CC`, textShadow: `0 0 10px ${color}40` }}
      >
        {label}
      </span>
    </div>
  );
};

// Main X Cover Image component
export const XCoverImage = forwardRef<HTMLDivElement>((_, ref) => {
  const nodePositions = useMemo(() => {
    const centerX = COVER_WIDTH / 2;
    const centerY = COVER_HEIGHT / 2;
    const spacing = 180;
    
    return capabilities.map((cap, i) => {
      const offset = (i - (capabilities.length - 1) / 2) * spacing;
      // Slight vertical wave for visual interest
      const yOffset = Math.sin((i / (capabilities.length - 1)) * Math.PI) * 15;
      return {
        ...cap,
        position: { x: centerX + offset, y: centerY + yOffset },
      };
    });
  }, []);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        background: "linear-gradient(135deg, #0a0a12 0%, #0f0f1a 50%, #0a0a12 100%)",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 139, 250, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 139, 250, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Particle field */}
      <XCoverParticleField />

      {/* Connection lines */}
      <XCoverConnectionLines />

      {/* Capability nodes */}
      {nodePositions.map((node, i) => (
        <XCoverCapabilityNode
          key={i}
          icon={node.icon}
          label={node.label}
          color={node.color}
          position={node.position}
        />
      ))}

      {/* Central logo */}
      <XCoverCentralCore />

      {/* Top left badge */}
      <div
        className="absolute top-6 left-8 flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(168, 139, 250, 0.1)",
          border: "1px solid rgba(168, 139, 250, 0.3)",
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#34D399", boxShadow: "0 0 8px #34D399" }}
        />
        <span className="text-xs font-medium" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
          AI-Powered Development Platform
        </span>
      </div>

      {/* Top right domain */}
      <div className="absolute top-6 right-8 flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          kernel.cool
        </span>
        <span style={{ color: "#A78BFA" }}>→</span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
        {/* Tagline */}
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              color: "rgba(255, 255, 255, 0.95)",
              textShadow: "0 2px 20px rgba(0, 0, 0, 0.5)",
            }}
          >
            Build Complete Apps with AI
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "rgba(255, 255, 255, 0.5)" }}
          >
            From idea to production in minutes, not months
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex items-center gap-3">
          {["Database", "Auth", "Edge Functions", "Deploy"].map((feature) => (
            <span
              key={feature}
              className="px-3 py-1 text-xs font-medium rounded-full"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

XCoverImage.displayName = "XCoverImage";
