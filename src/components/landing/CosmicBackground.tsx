import { useMemo } from 'react';

interface DistantStar {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
}

interface GalaxyNebula {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  hue: number;
  opacity: number;
}

export function CosmicBackground() {
  // Generate distant galaxy stars
  const distantStars = useMemo<DistantStar[]>(() => {
    return Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.3 + Math.random() * 0.8,
      opacity: 0.1 + Math.random() * 0.25,
      delay: Math.random() * 10,
    }));
  }, []);

  // Generate galaxy nebulae
  const nebulae = useMemo<GalaxyNebula[]>(() => [
    { x: 15, y: 20, width: 300, height: 200, rotation: 25, hue: 280, opacity: 0.08 },
    { x: 75, y: 35, width: 250, height: 180, rotation: -15, hue: 200, opacity: 0.06 },
    { x: 45, y: 70, width: 350, height: 220, rotation: 10, hue: 160, opacity: 0.05 },
    { x: 85, y: 80, width: 200, height: 150, rotation: -30, hue: 320, opacity: 0.04 },
  ], []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Deep space void gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 20%, 
              transparent 0%, 
              hsl(220 40% 3% / 0.5) 40%, 
              hsl(220 50% 2% / 0.8) 70%, 
              hsl(220 60% 1%) 100%
            )
          `,
        }}
      />

      {/* Galaxy nebula effects - distant colorful clouds */}
      {nebulae.map((nebula, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${nebula.x}%`,
            top: `${nebula.y}%`,
            width: nebula.width,
            height: nebula.height,
            transform: `translate(-50%, -50%) rotate(${nebula.rotation}deg)`,
            background: `radial-gradient(ellipse, hsl(${nebula.hue} 60% 40% / ${nebula.opacity}), transparent 60%)`,
            filter: 'blur(80px)',
            animation: `cosmicDrift ${20 + i * 5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 3}s`,
          }}
        />
      ))}

      {/* Distant star field */}
      {distantStars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: `hsl(200 30% 90% / ${star.opacity})`,
            boxShadow: `0 0 ${star.size * 2}px hsl(200 30% 90% / ${star.opacity * 0.5})`,
            animation: `starTwinkle ${8 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Occasional light flare */}
      <div
        className="absolute"
        style={{
          left: '70%',
          top: '25%',
          width: 4,
          height: 4,
          background: 'radial-gradient(circle, hsl(40 100% 90% / 0.6), transparent 50%)',
          boxShadow: `
            0 0 60px 20px hsl(40 100% 80% / 0.15),
            0 0 100px 40px hsl(40 100% 70% / 0.08)
          `,
          animation: 'flareGlow 15s ease-in-out infinite',
        }}
      />

      {/* Secondary flare */}
      <div
        className="absolute"
        style={{
          left: '20%',
          top: '60%',
          width: 3,
          height: 3,
          background: 'radial-gradient(circle, hsl(185 80% 85% / 0.5), transparent 50%)',
          boxShadow: `
            0 0 40px 15px hsl(185 80% 75% / 0.12),
            0 0 80px 30px hsl(185 80% 65% / 0.06)
          `,
          animation: 'flareGlow 18s ease-in-out infinite 5s',
        }}
      />
    </div>
  );
}
