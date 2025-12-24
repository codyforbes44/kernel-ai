import { forwardRef } from "react";

// Star positions for background
const stars = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 70,
  size: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.6 + 0.3,
}));

// Snowflake positions with depth layers
const snowflakes = [
  // Background layer (small, subtle)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `bg-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: 0.2,
    layer: "bg",
  })),
  // Mid layer
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `mid-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 5 + 3,
    opacity: 0.4,
    layer: "mid",
  })),
  // Foreground layer (larger, crisp)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `fg-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 5,
    opacity: 0.7,
    layer: "fg",
  })),
];

// Orion constellation star positions (approximate)
const orionStars = [
  { name: "Betelgeuse", x: 75, y: 25, size: 4, color: "#ff6b4a" },
  { name: "Rigel", x: 82, y: 55, size: 3.5, color: "#a8d4ff" },
  { name: "Bellatrix", x: 83, y: 25, size: 2.5, color: "#c8e0ff" },
  { name: "Saiph", x: 75, y: 55, size: 2.5, color: "#c8e0ff" },
  // Belt stars
  { name: "Alnitak", x: 76, y: 40, size: 2, color: "#fff" },
  { name: "Alnilam", x: 79, y: 40, size: 2.2, color: "#fff" },
  { name: "Mintaka", x: 82, y: 40, size: 2, color: "#fff" },
];

export const HolidayOGImage = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: 1200,
        height: 630,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}
    >
      {/* Night Sky Gradient Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #050818 0%, #0a1a35 40%, #0f2847 70%, #1a3a5c 100%)",
        }}
      />

      {/* Aurora / Northern Lights Effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: `
            radial-gradient(ellipse 80% 50% at 20% 0%, rgba(0, 212, 255, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 50% 10%, rgba(79, 172, 254, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 70% 45% at 80% 5%, rgba(168, 85, 247, 0.1) 0%, transparent 55%)
          `,
        }}
      />

      {/* Star Field */}
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            backgroundColor: "#fff",
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity})`,
          }}
        />
      ))}

      {/* Moon */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #fff9e6 0%, #f5e6c8 40%, #e8d4a8 70%, #d4c090 100%)",
          boxShadow: `
            0 0 40px rgba(255, 249, 230, 0.6),
            0 0 80px rgba(255, 249, 230, 0.3),
            0 0 120px rgba(255, 249, 230, 0.15)
          `,
        }}
      >
        {/* Moon craters */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "20%",
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: "rgba(200, 180, 140, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "55%",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "rgba(200, 180, 140, 0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "65%",
            left: "25%",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "rgba(200, 180, 140, 0.3)",
          }}
        />
      </div>

      {/* North Star */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 200,
          width: 20,
          height: 20,
        }}
      >
        {/* 8-point star */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#ffd700",
            clipPath: "polygon(50% 0%, 61% 35%, 100% 50%, 61% 65%, 50% 100%, 39% 65%, 0% 50%, 39% 35%)",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4)",
          }}
        />
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)",
          }}
        />
        {/* Rays */}
        {[0, 45, 90, 135].map((angle) => (
          <div
            key={angle}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 80,
              height: 1,
              background: "linear-gradient(90deg, rgba(255, 215, 0, 0.4), transparent)",
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              transformOrigin: "center",
            }}
          />
        ))}
      </div>

      {/* Orion Constellation */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* Constellation lines */}
        <g stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1">
          {/* Shoulders to belt */}
          <line x1="75%" y1="25%" x2="76%" y2="40%" />
          <line x1="83%" y1="25%" x2="82%" y2="40%" />
          {/* Belt */}
          <line x1="76%" y1="40%" x2="79%" y2="40%" />
          <line x1="79%" y1="40%" x2="82%" y2="40%" />
          {/* Belt to feet */}
          <line x1="76%" y1="40%" x2="75%" y2="55%" />
          <line x1="82%" y1="40%" x2="82%" y2="55%" />
        </g>
        {/* Stars with glow */}
        {orionStars.map((star) => (
          <g key={star.name}>
            <circle
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size * 2}
              fill={star.color}
              opacity={0.2}
            />
            <circle
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size}
              fill={star.color}
            />
          </g>
        ))}
        {/* Star labels */}
        <text x="75%" y="21%" fill="rgba(255, 255, 255, 0.5)" fontSize="9" textAnchor="middle">
          Betelgeuse
        </text>
        <text x="82%" y="59%" fill="rgba(255, 255, 255, 0.5)" fontSize="9" textAnchor="middle">
          Rigel
        </text>
      </svg>

      {/* Santa Sleigh Silhouette */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 280,
          opacity: 0.85,
        }}
      >
        <svg width="180" height="60" viewBox="0 0 180 60" fill="#1a1a2e">
          {/* Reindeer (simplified) */}
          <ellipse cx="25" cy="35" rx="12" ry="8" /> {/* Body */}
          <circle cx="15" cy="30" r="5" /> {/* Head */}
          <path d="M12 25 L8 15 M12 25 L16 15" stroke="#1a1a2e" strokeWidth="2" fill="none" /> {/* Antlers */}
          <line x1="20" y1="43" x2="18" y2="52" stroke="#1a1a2e" strokeWidth="2" /> {/* Legs */}
          <line x1="30" y1="43" x2="32" y2="52" stroke="#1a1a2e" strokeWidth="2" />
          
          {/* Second reindeer */}
          <ellipse cx="55" cy="35" rx="12" ry="8" />
          <circle cx="45" cy="30" r="5" />
          <path d="M42 25 L38 15 M42 25 L46 15" stroke="#1a1a2e" strokeWidth="2" fill="none" />
          <line x1="50" y1="43" x2="48" y2="52" stroke="#1a1a2e" strokeWidth="2" />
          <line x1="60" y1="43" x2="62" y2="52" stroke="#1a1a2e" strokeWidth="2" />
          
          {/* Harness lines */}
          <line x1="37" y1="35" x2="43" y2="35" stroke="#1a1a2e" strokeWidth="1.5" />
          <line x1="67" y1="35" x2="100" y2="38" stroke="#1a1a2e" strokeWidth="1.5" />
          
          {/* Sleigh */}
          <path
            d="M100 30 Q105 25 130 25 L145 25 Q155 25 160 35 L165 45 Q167 50 160 52 L105 52 Q95 52 95 45 L95 40 Q95 30 100 30"
            fill="#1a1a2e"
          />
          {/* Runner */}
          <path
            d="M90 55 Q85 55 85 52 L170 52 Q175 52 175 55 Q175 58 170 58 L90 58 Q85 58 85 55"
            fill="#1a1a2e"
          />
          {/* Santa silhouette */}
          <ellipse cx="135" cy="28" rx="10" ry="12" />
          <circle cx="135" cy="15" r="8" />
        </svg>
      </div>

      {/* Shooting Star / Meteor */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 550,
          width: 100,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), #fff)",
          transform: "rotate(-25deg)",
          borderRadius: 2,
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
        }}
      />

      {/* Background Snowflakes */}
      {snowflakes
        .filter((s) => s.layer === "bg")
        .map((flake) => (
          <div
            key={flake.id}
            style={{
              position: "absolute",
              left: `${flake.x}%`,
              top: `${flake.y}%`,
              width: flake.size,
              height: flake.size,
              borderRadius: "50%",
              backgroundColor: "#fff",
              opacity: flake.opacity,
            }}
          />
        ))}

      {/* Mid Snowflakes */}
      {snowflakes
        .filter((s) => s.layer === "mid")
        .map((flake) => (
          <div
            key={flake.id}
            style={{
              position: "absolute",
              left: `${flake.x}%`,
              top: `${flake.y}%`,
              width: flake.size,
              height: flake.size,
              borderRadius: "50%",
              backgroundColor: "#fff",
              opacity: flake.opacity,
              boxShadow: "0 0 3px rgba(255, 255, 255, 0.3)",
            }}
          />
        ))}

      {/* Snow Accumulation at Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
        }}
      >
        {/* Main snow layer */}
        <svg
          style={{ position: "absolute", bottom: 0, width: "100%", height: 80 }}
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80 L0 40 Q100 20 200 35 Q350 50 500 30 Q650 10 800 35 Q950 55 1100 25 Q1150 15 1200 30 L1200 80 Z"
            fill="#e8f4fc"
          />
          <path
            d="M0 80 L0 55 Q150 40 300 50 Q450 60 600 45 Q750 30 900 50 Q1050 65 1200 45 L1200 80 Z"
            fill="#f5fafd"
          />
        </svg>
        {/* Snow sparkles */}
        {[100, 300, 500, 700, 900, 1100].map((x, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 30 + (i % 3) * 15,
              left: x,
              width: 3,
              height: 3,
              borderRadius: "50%",
              backgroundColor: "#fff",
              boxShadow: "0 0 6px rgba(255, 255, 255, 0.8)",
            }}
          />
        ))}
      </div>

      {/* Foreground Snowflakes */}
      {snowflakes
        .filter((s) => s.layer === "fg")
        .map((flake) => (
          <div
            key={flake.id}
            style={{
              position: "absolute",
              left: `${flake.x}%`,
              top: `${flake.y}%`,
              width: flake.size,
              height: flake.size,
              borderRadius: "50%",
              backgroundColor: "#fff",
              opacity: flake.opacity,
              boxShadow: "0 0 6px rgba(255, 255, 255, 0.5)",
            }}
          />
        ))}

      {/* Corner Frost Decorations */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 150,
          height: 150,
          background: "radial-gradient(ellipse at 0% 0%, rgba(200, 230, 255, 0.15) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 150,
          height: 150,
          background: "radial-gradient(ellipse at 100% 0%, rgba(200, 230, 255, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Content Layer - Branding */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 80,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Holiday Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            background: "rgba(255, 215, 0, 0.15)",
            border: "1px solid rgba(255, 215, 0, 0.3)",
            borderRadius: 20,
            width: "fit-content",
          }}
        >
          <span style={{ fontSize: 14 }}>❄️</span>
          <span style={{ color: "#ffd700", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>
            SEASON 2024
          </span>
        </div>

        {/* Kernel Logo & Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #ffd700 0%, #ffb347 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(255, 215, 0, 0.3)",
            }}
          >
            <span style={{ fontSize: 28, color: "#1a1a2e" }}>K</span>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>
              Kernel
            </div>
            <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.6)", letterSpacing: 0.5 }}>
              AI-Powered Development
            </div>
          </div>
        </div>

        {/* Holiday Message */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            textShadow: "0 2px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          Happy Holidays
        </div>

        {/* Subtext */}
        <div style={{ fontSize: 18, color: "rgba(255, 255, 255, 0.7)" }}>
          Wishing you peace, joy, and brilliant code in the new year
        </div>

        {/* CTA */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
            padding: "10px 20px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 8,
            width: "fit-content",
          }}
        >
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>kernel.cool</span>
          <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>→</span>
        </div>
      </div>

      {/* Decorative Holiday Sparkles */}
      {[
        { x: 600, y: 200, size: 8 },
        { x: 750, y: 280, size: 6 },
        { x: 850, y: 350, size: 7 },
        { x: 950, y: 180, size: 5 },
        { x: 1050, y: 300, size: 8 },
      ].map((sparkle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#ffd700",
              clipPath: "polygon(50% 0%, 61% 35%, 100% 50%, 61% 65%, 50% 100%, 39% 65%, 0% 50%, 39% 35%)",
              opacity: 0.6,
            }}
          />
        </div>
      ))}
    </div>
  );
});

HolidayOGImage.displayName = "HolidayOGImage";
