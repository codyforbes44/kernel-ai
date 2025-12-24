import { useMemo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleDelay: number;
}

interface ConstellationStar extends Star {
  id: string;
}

interface ConstellationLine {
  from: string;
  to: string;
}

interface ConstellationData {
  name: string;
  stars: ConstellationStar[];
  lines: ConstellationLine[];
}

// Classic constellation patterns (coordinates as percentages within constellation bounds)
const CONSTELLATIONS: ConstellationData[] = [
  {
    name: 'orion',
    stars: [
      // Belt
      { id: 'belt1', x: 40, y: 50, size: 2.5, brightness: 0.9, twinkleSpeed: 4, twinkleDelay: 0 },
      { id: 'belt2', x: 50, y: 52, size: 3, brightness: 1, twinkleSpeed: 3.5, twinkleDelay: 0.5 },
      { id: 'belt3', x: 60, y: 50, size: 2.5, brightness: 0.85, twinkleSpeed: 4.5, twinkleDelay: 1 },
      // Shoulders
      { id: 'betelgeuse', x: 25, y: 25, size: 4, brightness: 1, twinkleSpeed: 3, twinkleDelay: 0.3 },
      { id: 'bellatrix', x: 75, y: 28, size: 3.5, brightness: 0.9, twinkleSpeed: 3.2, twinkleDelay: 0.7 },
      // Feet
      { id: 'rigel', x: 70, y: 85, size: 4, brightness: 1, twinkleSpeed: 2.8, twinkleDelay: 0.2 },
      { id: 'saiph', x: 30, y: 82, size: 3, brightness: 0.8, twinkleSpeed: 4, twinkleDelay: 0.9 },
    ],
    lines: [
      { from: 'belt1', to: 'belt2' },
      { from: 'belt2', to: 'belt3' },
      { from: 'betelgeuse', to: 'belt1' },
      { from: 'bellatrix', to: 'belt3' },
      { from: 'belt1', to: 'saiph' },
      { from: 'belt3', to: 'rigel' },
    ],
  },
  {
    name: 'ursaMajor',
    stars: [
      // Big Dipper pattern
      { id: 'dubhe', x: 10, y: 20, size: 3.5, brightness: 0.95, twinkleSpeed: 3.5, twinkleDelay: 0 },
      { id: 'merak', x: 10, y: 45, size: 3, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.4 },
      { id: 'phecda', x: 30, y: 55, size: 2.8, brightness: 0.8, twinkleSpeed: 4.2, twinkleDelay: 0.8 },
      { id: 'megrez', x: 45, y: 45, size: 2.5, brightness: 0.7, twinkleSpeed: 4.5, twinkleDelay: 0.2 },
      { id: 'alioth', x: 60, y: 40, size: 3.2, brightness: 0.9, twinkleSpeed: 3.8, twinkleDelay: 0.6 },
      { id: 'mizar', x: 75, y: 35, size: 3, brightness: 0.85, twinkleSpeed: 3.5, twinkleDelay: 1 },
      { id: 'alkaid', x: 90, y: 25, size: 3.5, brightness: 0.95, twinkleSpeed: 3.2, twinkleDelay: 0.3 },
    ],
    lines: [
      { from: 'dubhe', to: 'merak' },
      { from: 'merak', to: 'phecda' },
      { from: 'phecda', to: 'megrez' },
      { from: 'megrez', to: 'dubhe' },
      { from: 'megrez', to: 'alioth' },
      { from: 'alioth', to: 'mizar' },
      { from: 'mizar', to: 'alkaid' },
    ],
  },
  {
    name: 'cassiopeia',
    stars: [
      // W-shape pattern
      { id: 'schedar', x: 10, y: 40, size: 3.5, brightness: 0.95, twinkleSpeed: 3.3, twinkleDelay: 0 },
      { id: 'caph', x: 25, y: 20, size: 3, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.5 },
      { id: 'gamma', x: 50, y: 50, size: 3.2, brightness: 0.9, twinkleSpeed: 3.5, twinkleDelay: 0.2 },
      { id: 'ruchbah', x: 75, y: 25, size: 2.8, brightness: 0.8, twinkleSpeed: 4.2, twinkleDelay: 0.7 },
      { id: 'segin', x: 90, y: 45, size: 3, brightness: 0.85, twinkleSpeed: 3.8, twinkleDelay: 0.4 },
    ],
    lines: [
      { from: 'schedar', to: 'caph' },
      { from: 'caph', to: 'gamma' },
      { from: 'gamma', to: 'ruchbah' },
      { from: 'ruchbah', to: 'segin' },
    ],
  },
];

interface ConstellationProps {
  name: 'orion' | 'ursaMajor' | 'cassiopeia';
  className?: string;
  width: number;
  height: number;
}

function Constellation({ name, className, width, height }: ConstellationProps) {
  const data = CONSTELLATIONS.find(c => c.name === name);
  if (!data) return null;

  const starMap = useMemo(() => {
    const map = new Map<string, ConstellationStar>();
    data.stars.forEach(star => map.set(star.id, star));
    return map;
  }, [data.stars]);

  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ width, height }}>
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {data.lines.map((line, i) => {
          const from = starMap.get(line.from);
          const to = starMap.get(line.to);
          if (!from || !to) return null;
          
          return (
            <line
              key={i}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="hsl(var(--primary) / 0.12)"
              strokeWidth="0.5"
              className="animate-[constellationPulse_8s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          );
        })}
      </svg>

      {/* Stars */}
      {data.stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, 
              hsl(45 100% 95% / ${star.brightness}) 0%, 
              hsl(185 80% 70% / ${star.brightness * 0.6}) 40%, 
              transparent 70%)`,
            boxShadow: `0 0 ${star.size * 2}px hsl(185 80% 70% / ${star.brightness * 0.4}),
                        0 0 ${star.size * 4}px hsl(185 80% 70% / ${star.brightness * 0.2})`,
            animation: `starTwinkle ${star.twinkleSpeed}s ease-in-out infinite`,
            animationDelay: `${star.twinkleDelay}s`,
          }}
        />
      ))}
    </div>
  );
}

interface BackgroundStarsProps {
  count?: number;
}

export function BackgroundStars({ count = 50 }: BackgroundStarsProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60, // Keep in upper 60% of viewport
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.3,
      twinkleSpeed: 5 + Math.random() * 10,
      twinkleDelay: Math.random() * 5,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: `starTwinkle ${star.twinkleSpeed}s ease-in-out infinite`,
            animationDelay: `${star.twinkleDelay}s`,
          }}
        />
      ))}
    </div>
  );
}

interface StarConstellationProps {
  scrollY: number;
}

export function StarConstellation({ scrollY }: StarConstellationProps) {
  // Parallax transforms for different depth layers
  const slowParallax = scrollY * 0.3;
  const mediumParallax = scrollY * 0.5;
  const fastParallax = scrollY * 0.7;

  return (
    <>
      {/* Background star field - deepest layer */}
      <div 
        className="absolute inset-0"
        style={{ transform: `translateY(${slowParallax * 0.5}px)` }}
      >
        <BackgroundStars count={50} />
      </div>

      {/* Cassiopeia - slow parallax (furthest) */}
      <div 
        className="absolute top-[3%] left-[30%] opacity-60"
        style={{ transform: `translateY(${slowParallax}px)` }}
      >
        <Constellation name="cassiopeia" width={180} height={80} />
      </div>

      {/* Ursa Major - medium parallax */}
      <div 
        className="absolute top-[8%] right-[5%] opacity-70"
        style={{ transform: `translateY(${mediumParallax * 0.6}px)` }}
      >
        <Constellation name="ursaMajor" width={220} height={100} />
      </div>

      {/* Orion - fast parallax (closest) */}
      <div 
        className="absolute top-[12%] left-[5%] opacity-80"
        style={{ transform: `translateY(${fastParallax * 0.4}px)` }}
      >
        <Constellation name="orion" width={140} height={180} />
      </div>
    </>
  );
}
