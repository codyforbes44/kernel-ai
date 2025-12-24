import { useMemo, memo } from 'react';
import { useChristmasPerformance } from './christmas/hooks/useChristmasPerformance';
import { STAR_COLORS, PERSPECTIVE_CONFIG } from './christmas/constants';
import type { StarColor, ConstellationDetail } from './christmas/types';

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
  name?: string;
  color: StarColor;
  points: 4 | 6 | 8;
}

interface ConstellationLine {
  from: string;
  to: string;
}

interface Nebula {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color: string;
}

interface ConstellationData {
  name: string;
  displayName: string;
  stars: ConstellationStar[];
  lines: ConstellationLine[];
  nebulae?: Nebula[];
}

// Classic constellation patterns with enhanced star data
const CONSTELLATIONS: ConstellationData[] = [
  {
    name: 'orion',
    displayName: 'Orion',
    stars: [
      { id: 'alnitak', x: 40, y: 50, size: 2.5, brightness: 0.9, twinkleSpeed: 4, twinkleDelay: 0, color: 'blue-white', points: 6 },
      { id: 'alnilam', x: 50, y: 52, size: 3, brightness: 1, twinkleSpeed: 3.5, twinkleDelay: 0.5, name: 'Alnilam', color: 'blue-white', points: 8 },
      { id: 'mintaka', x: 60, y: 50, size: 2.5, brightness: 0.85, twinkleSpeed: 4.5, twinkleDelay: 1, color: 'blue-white', points: 6 },
      { id: 'betelgeuse', x: 25, y: 25, size: 4, brightness: 1, twinkleSpeed: 3, twinkleDelay: 0.3, name: 'Betelgeuse', color: 'red-orange', points: 8 },
      { id: 'bellatrix', x: 75, y: 28, size: 3, brightness: 0.9, twinkleSpeed: 3.2, twinkleDelay: 0.7, name: 'Bellatrix', color: 'blue-white', points: 6 },
      { id: 'rigel', x: 70, y: 85, size: 4, brightness: 1, twinkleSpeed: 2.8, twinkleDelay: 0.2, name: 'Rigel', color: 'blue-white', points: 8 },
      { id: 'saiph', x: 30, y: 82, size: 3, brightness: 0.8, twinkleSpeed: 4, twinkleDelay: 0.9, color: 'blue-white', points: 6 },
      { id: 'sword1', x: 48, y: 60, size: 1.5, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.2, color: 'white', points: 4 },
      { id: 'sword2', x: 50, y: 65, size: 2, brightness: 0.6, twinkleSpeed: 4.5, twinkleDelay: 0.8, color: 'cyan', points: 4 },
      { id: 'sword3', x: 52, y: 70, size: 1.5, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.5, color: 'white', points: 4 },
    ],
    lines: [
      { from: 'alnitak', to: 'alnilam' },
      { from: 'alnilam', to: 'mintaka' },
      { from: 'betelgeuse', to: 'alnitak' },
      { from: 'bellatrix', to: 'mintaka' },
      { from: 'alnitak', to: 'saiph' },
      { from: 'mintaka', to: 'rigel' },
      { from: 'alnilam', to: 'sword1' },
      { from: 'sword1', to: 'sword2' },
      { from: 'sword2', to: 'sword3' },
    ],
    nebulae: [
      { x: 48, y: 64, width: 20, height: 24, rotation: -15, opacity: 0.05, color: 'hsl(280, 60%, 60%)' },
    ],
  },
  {
    name: 'ursaMajor',
    displayName: 'Ursa Major',
    stars: [
      { id: 'dubhe', x: 10, y: 20, size: 3, brightness: 0.95, twinkleSpeed: 3.5, twinkleDelay: 0, name: 'Dubhe', color: 'gold', points: 8 },
      { id: 'merak', x: 10, y: 45, size: 2.8, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.4, name: 'Merak', color: 'white', points: 6 },
      { id: 'phecda', x: 30, y: 55, size: 2.5, brightness: 0.8, twinkleSpeed: 4.2, twinkleDelay: 0.8, color: 'white', points: 6 },
      { id: 'megrez', x: 45, y: 45, size: 2.2, brightness: 0.7, twinkleSpeed: 4.5, twinkleDelay: 0.2, color: 'white', points: 4 },
      { id: 'alioth', x: 60, y: 40, size: 2.8, brightness: 0.9, twinkleSpeed: 3.8, twinkleDelay: 0.6, name: 'Alioth', color: 'white', points: 6 },
      { id: 'mizar', x: 75, y: 35, size: 2.8, brightness: 0.85, twinkleSpeed: 3.5, twinkleDelay: 1, name: 'Mizar', color: 'white', points: 6 },
      { id: 'alcor', x: 77, y: 33, size: 1.5, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.2, color: 'white', points: 4 },
      { id: 'alkaid', x: 90, y: 25, size: 3, brightness: 0.95, twinkleSpeed: 3.2, twinkleDelay: 0.3, name: 'Alkaid', color: 'blue-white', points: 8 },
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
    displayName: 'Cassiopeia',
    stars: [
      { id: 'schedar', x: 10, y: 40, size: 3, brightness: 0.95, twinkleSpeed: 3.3, twinkleDelay: 0, name: 'Schedar', color: 'gold', points: 8 },
      { id: 'caph', x: 25, y: 20, size: 2.8, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.5, name: 'Caph', color: 'white', points: 6 },
      { id: 'gamma', x: 50, y: 50, size: 2.8, brightness: 0.9, twinkleSpeed: 3.5, twinkleDelay: 0.2, name: 'Navi', color: 'blue-white', points: 8 },
      { id: 'ruchbah', x: 75, y: 25, size: 2.5, brightness: 0.8, twinkleSpeed: 4.2, twinkleDelay: 0.7, color: 'white', points: 6 },
      { id: 'segin', x: 90, y: 45, size: 2.8, brightness: 0.85, twinkleSpeed: 3.8, twinkleDelay: 0.4, name: 'Segin', color: 'blue-white', points: 6 },
    ],
    lines: [
      { from: 'schedar', to: 'caph' },
      { from: 'caph', to: 'gamma' },
      { from: 'gamma', to: 'ruchbah' },
      { from: 'ruchbah', to: 'segin' },
    ],
  },
];

// Generate SVG path for multi-point star
function getStarPath(points: number, outerRadius: number, innerRadius: number): string {
  const angle = Math.PI / points;
  const path: string[] = [];
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(i * angle - Math.PI / 2) * radius + outerRadius;
    const y = Math.sin(i * angle - Math.PI / 2) * radius + outerRadius;
    path.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  path.push('Z');
  
  return path.join(' ');
}

// Multi-point detailed star component - simplified for mobile
const DetailedStar = memo(function DetailedStar({ 
  star, 
  showLabel,
  simplified,
}: { 
  star: ConstellationStar; 
  showLabel: boolean;
  simplified: boolean;
}) {
  const colorValue = STAR_COLORS[star.color] || STAR_COLORS.white;
  const outerRadius = star.size * 1.2;
  const innerRadius = star.size * 0.4;
  const viewBoxSize = outerRadius * 2;
  
  // Diffraction spikes only for bright stars on desktop
  const hasDiffraction = !simplified && star.brightness >= 0.9 && star.points === 8;
  
  return (
    <div
      className="absolute"
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outer glow - reduced on mobile */}
      <div
        className="absolute rounded-full"
        style={{
          width: star.size * (simplified ? 4 : 5),
          height: star.size * (simplified ? 4 : 5),
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${colorValue.replace(')', ' / 0.25)')}, transparent 70%)`,
          animation: `starTwinkle ${star.twinkleSpeed}s ease-in-out infinite`,
          animationDelay: `${star.twinkleDelay}s`,
        }}
      />
      
      {/* Diffraction spikes for bright stars - desktop only */}
      {hasDiffraction && (
        <svg
          className="absolute"
          width={star.size * 6}
          height={star.size * 6}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.3,
          }}
          viewBox="0 0 100 100"
        >
          <line x1="0" y1="50" x2="100" y2="50" stroke={colorValue} strokeWidth="0.5" opacity="0.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke={colorValue} strokeWidth="0.5" opacity="0.5" />
        </svg>
      )}
      
      {/* Multi-point star shape */}
      <svg
        width={viewBoxSize}
        height={viewBoxSize}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="relative"
        style={{
          animation: `starTwinkle ${star.twinkleSpeed}s ease-in-out infinite`,
          animationDelay: `${star.twinkleDelay}s`,
          filter: simplified ? undefined : `drop-shadow(0 0 ${star.size * 0.8}px ${colorValue})`,
        }}
      >
        <defs>
          <radialGradient id={`star-gradient-${star.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity={star.brightness} />
            <stop offset="30%" stopColor={colorValue} stopOpacity={star.brightness * 0.9} />
            <stop offset="100%" stopColor={colorValue} stopOpacity={star.brightness * 0.3} />
          </radialGradient>
        </defs>
        <path
          d={getStarPath(star.points, outerRadius, innerRadius)}
          fill={`url(#star-gradient-${star.id})`}
        />
        <circle
          cx={outerRadius}
          cy={outerRadius}
          r={star.size * 0.25}
          fill="white"
          opacity={star.brightness}
        />
      </svg>
      
      {/* Star label - hidden on mobile */}
      {showLabel && star.name && (
        <div
          className="absolute whitespace-nowrap text-[7px] font-light tracking-wider opacity-35 pointer-events-none"
          style={{
            left: '50%',
            top: `${viewBoxSize + 3}px`,
            transform: 'translateX(-50%)',
            color: colorValue,
          }}
        >
          {star.name}
        </div>
      )}
    </div>
  );
});

// Nebula component - simplified/hidden on mobile
const NebulaCloud = memo(function NebulaCloud({ nebula, simplified }: { nebula: Nebula; simplified: boolean }) {
  if (simplified) return null;
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${nebula.x}%`,
        top: `${nebula.y}%`,
        width: nebula.width,
        height: nebula.height,
        transform: `translate(-50%, -50%) rotate(${nebula.rotation}deg)`,
        background: `radial-gradient(ellipse, ${nebula.color.replace(')', ` / ${nebula.opacity})`)}, transparent 70%)`,
        filter: 'blur(4px)',
        animation: 'constellationPulse 12s ease-in-out infinite',
      }}
    />
  );
});

interface ConstellationProps {
  name: 'orion' | 'ursaMajor' | 'cassiopeia';
  className?: string;
  width: number;
  height: number;
  detailLevel: ConstellationDetail;
  showLabels?: boolean;
}

const Constellation = memo(function Constellation({ 
  name, 
  className, 
  width, 
  height, 
  detailLevel,
  showLabels = true,
}: ConstellationProps) {
  const data = CONSTELLATIONS.find(c => c.name === name);
  if (!data) return null;

  const starMap = useMemo(() => {
    const map = new Map<string, ConstellationStar>();
    data.stars.forEach(star => map.set(star.id, star));
    return map;
  }, [data.stars]);

  const visibleStars = useMemo(() => {
    if (detailLevel === 'full') return data.stars;
    if (detailLevel === 'simplified') return data.stars.filter(s => s.brightness >= 0.7);
    return data.stars.filter(s => s.brightness >= 0.85);
  }, [data.stars, detailLevel]);

  const showNebulaEffects = detailLevel === 'full' && data.nebulae;
  const showStarLabels = showLabels && detailLevel === 'full';
  const simplified = detailLevel !== 'full';

  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ width, height }}>
      {/* Nebulae (background) */}
      {showNebulaEffects && data.nebulae?.map((nebula, i) => (
        <NebulaCloud key={`nebula-${i}`} nebula={nebula} simplified={simplified} />
      ))}
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`line-gradient-${name}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0.04" />
            <stop offset="50%" stopColor="hsl(185, 80%, 70%)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {data.lines.map((line, i) => {
          const from = starMap.get(line.from);
          const to = starMap.get(line.to);
          if (!from || !to) return null;
          
          if (detailLevel !== 'full' && (from.brightness < 0.7 || to.brightness < 0.7)) return null;
          
          return (
            <g key={i}>
              <line
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke={`url(#line-gradient-${name})`}
                strokeWidth="2"
                className="animate-[constellationPulse_8s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
              <line
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke="hsl(185, 80%, 75%)"
                strokeWidth="0.4"
                opacity="0.15"
              />
            </g>
          );
        })}
      </svg>

      {/* Detailed stars */}
      {visibleStars.map((star) => (
        <DetailedStar 
          key={star.id} 
          star={star} 
          showLabel={showStarLabels}
          simplified={simplified}
        />
      ))}
      
      {/* Constellation name label - desktop only */}
      {showStarLabels && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-light tracking-[0.25em] uppercase opacity-20 text-cyan-300"
        >
          {data.displayName}
        </div>
      )}
    </div>
  );
});

interface BackgroundStarsProps {
  count?: number;
  maxGlow?: number;
}

export function BackgroundStars({ count = 40, maxGlow = 3 }: BackgroundStarsProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const rand = Math.random();
      const points = rand < 0.7 ? 4 : rand < 0.9 ? 6 : 8;
      const color: StarColor = rand < 0.75 ? 'white' : rand < 0.9 ? 'blue-white' : 'gold';
      
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60,
        size: Math.min(0.6 + Math.random() * 1.4, 2), // Capped at 2px
        opacity: 0.12 + Math.random() * 0.28,
        twinkleSpeed: 5 + Math.random() * 10,
        twinkleDelay: Math.random() * 5,
        points,
        color,
      };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => {
        const colorValue = STAR_COLORS[star.color];
        const glowSize = Math.min(star.size * 1.5, maxGlow);
        return (
          <div
            key={star.id}
            className="absolute"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              backgroundColor: colorValue,
              borderRadius: '50%',
              boxShadow: `0 0 ${glowSize}px ${colorValue.replace(')', ' / 0.4)')}`,
              animation: `starTwinkle ${star.twinkleSpeed}s ease-in-out infinite`,
              animationDelay: `${star.twinkleDelay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

interface StarConstellationProps {
  scrollY: number;
}

export function StarConstellation({ scrollY }: StarConstellationProps) {
  const performanceConfig = useChristmasPerformance();
  const { constellationDetail, isSmallScreen, isVerySmallScreen, maxStarGlow } = performanceConfig;
  
  const slowParallax = scrollY * 0.3;
  const mediumParallax = scrollY * 0.5;
  const fastParallax = scrollY * 0.7;
  
  // Responsive sizing - reduced for mobile
  const getConstellationSize = (baseWidth: number, baseHeight: number) => {
    if (isVerySmallScreen) return { width: baseWidth * 0.4, height: baseHeight * 0.4 };
    if (isSmallScreen) return { width: baseWidth * 0.6, height: baseHeight * 0.6 };
    return { width: baseWidth, height: baseHeight };
  };
  
  const orionSize = getConstellationSize(140, 180);
  const ursaSize = getConstellationSize(200, 100);
  const cassiopeiaSize = getConstellationSize(180, 80);
  
  // Background star count based on screen size
  const bgStarCount = isVerySmallScreen ? 15 : isSmallScreen ? 25 : 45;

  return (
    <>
      {/* Background star field - NO container blur */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: `translateY(${slowParallax * 0.5}px)`,
        }}
      >
        <BackgroundStars 
          count={bgStarCount} 
          maxGlow={maxStarGlow}
        />
      </div>

      {/* Cassiopeia - slow parallax (furthest) */}
      <div 
        className="absolute top-[3%] left-[30%] opacity-45"
        style={{ 
          transform: `translateY(${slowParallax}px)`,
        }}
      >
        <Constellation 
          name="cassiopeia" 
          width={cassiopeiaSize.width} 
          height={cassiopeiaSize.height}
          detailLevel={constellationDetail}
          showLabels={!isSmallScreen}
        />
      </div>

      {/* Ursa Major - medium parallax */}
      <div 
        className="absolute top-[8%] right-[5%] opacity-55"
        style={{ 
          transform: `translateY(${mediumParallax * 0.6}px)`,
        }}
      >
        <Constellation 
          name="ursaMajor" 
          width={ursaSize.width} 
          height={ursaSize.height}
          detailLevel={constellationDetail}
          showLabels={!isSmallScreen}
        />
      </div>

      {/* Orion - fast parallax (closest) */}
      <div 
        className="absolute top-[12%] left-[5%] opacity-65"
        style={{ 
          transform: `translateY(${fastParallax * 0.4}px)`,
        }}
      >
        <Constellation 
          name="orion" 
          width={orionSize.width} 
          height={orionSize.height}
          detailLevel={constellationDetail}
          showLabels={!isSmallScreen}
        />
      </div>
    </>
  );
}
