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
  name?: string;           // Star name for labels
  color: StarColor;
  points: 4 | 6 | 8;       // Multi-point star shape
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
      // Belt - Alnitak, Alnilam, Mintaka
      { id: 'alnitak', x: 40, y: 50, size: 3, brightness: 0.9, twinkleSpeed: 4, twinkleDelay: 0, color: 'blue-white', points: 6 },
      { id: 'alnilam', x: 50, y: 52, size: 3.5, brightness: 1, twinkleSpeed: 3.5, twinkleDelay: 0.5, name: 'Alnilam', color: 'blue-white', points: 8 },
      { id: 'mintaka', x: 60, y: 50, size: 3, brightness: 0.85, twinkleSpeed: 4.5, twinkleDelay: 1, color: 'blue-white', points: 6 },
      // Shoulders
      { id: 'betelgeuse', x: 25, y: 25, size: 5, brightness: 1, twinkleSpeed: 3, twinkleDelay: 0.3, name: 'Betelgeuse', color: 'red-orange', points: 8 },
      { id: 'bellatrix', x: 75, y: 28, size: 4, brightness: 0.9, twinkleSpeed: 3.2, twinkleDelay: 0.7, name: 'Bellatrix', color: 'blue-white', points: 6 },
      // Feet
      { id: 'rigel', x: 70, y: 85, size: 5, brightness: 1, twinkleSpeed: 2.8, twinkleDelay: 0.2, name: 'Rigel', color: 'blue-white', points: 8 },
      { id: 'saiph', x: 30, y: 82, size: 3.5, brightness: 0.8, twinkleSpeed: 4, twinkleDelay: 0.9, color: 'blue-white', points: 6 },
      // Sword region (fainter)
      { id: 'sword1', x: 48, y: 60, size: 2, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.2, color: 'white', points: 4 },
      { id: 'sword2', x: 50, y: 65, size: 2.5, brightness: 0.6, twinkleSpeed: 4.5, twinkleDelay: 0.8, color: 'cyan', points: 4 },
      { id: 'sword3', x: 52, y: 70, size: 2, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.5, color: 'white', points: 4 },
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
      // Orion Nebula region (around the sword)
      { x: 48, y: 64, width: 25, height: 30, rotation: -15, opacity: 0.08, color: 'hsl(280, 60%, 60%)' },
      { x: 52, y: 66, width: 18, height: 22, rotation: 10, opacity: 0.06, color: 'hsl(200, 70%, 65%)' },
    ],
  },
  {
    name: 'ursaMajor',
    displayName: 'Ursa Major',
    stars: [
      // Big Dipper pattern
      { id: 'dubhe', x: 10, y: 20, size: 4, brightness: 0.95, twinkleSpeed: 3.5, twinkleDelay: 0, name: 'Dubhe', color: 'gold', points: 8 },
      { id: 'merak', x: 10, y: 45, size: 3.5, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.4, name: 'Merak', color: 'white', points: 6 },
      { id: 'phecda', x: 30, y: 55, size: 3, brightness: 0.8, twinkleSpeed: 4.2, twinkleDelay: 0.8, color: 'white', points: 6 },
      { id: 'megrez', x: 45, y: 45, size: 2.8, brightness: 0.7, twinkleSpeed: 4.5, twinkleDelay: 0.2, color: 'white', points: 4 },
      { id: 'alioth', x: 60, y: 40, size: 3.5, brightness: 0.9, twinkleSpeed: 3.8, twinkleDelay: 0.6, name: 'Alioth', color: 'white', points: 6 },
      { id: 'mizar', x: 75, y: 35, size: 3.5, brightness: 0.85, twinkleSpeed: 3.5, twinkleDelay: 1, name: 'Mizar', color: 'white', points: 6 },
      { id: 'alcor', x: 77, y: 33, size: 1.8, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.2, color: 'white', points: 4 }, // Companion to Mizar
      { id: 'alkaid', x: 90, y: 25, size: 4, brightness: 0.95, twinkleSpeed: 3.2, twinkleDelay: 0.3, name: 'Alkaid', color: 'blue-white', points: 8 },
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
      // W-shape pattern
      { id: 'schedar', x: 10, y: 40, size: 4, brightness: 0.95, twinkleSpeed: 3.3, twinkleDelay: 0, name: 'Schedar', color: 'gold', points: 8 },
      { id: 'caph', x: 25, y: 20, size: 3.5, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.5, name: 'Caph', color: 'white', points: 6 },
      { id: 'gamma', x: 50, y: 50, size: 3.5, brightness: 0.9, twinkleSpeed: 3.5, twinkleDelay: 0.2, name: 'Navi', color: 'blue-white', points: 8 },
      { id: 'ruchbah', x: 75, y: 25, size: 3, brightness: 0.8, twinkleSpeed: 4.2, twinkleDelay: 0.7, color: 'white', points: 6 },
      { id: 'segin', x: 90, y: 45, size: 3.5, brightness: 0.85, twinkleSpeed: 3.8, twinkleDelay: 0.4, name: 'Segin', color: 'blue-white', points: 6 },
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

// Multi-point detailed star component
const DetailedStar = memo(function DetailedStar({ 
  star, 
  showLabel,
  blur,
}: { 
  star: ConstellationStar; 
  showLabel: boolean;
  blur: number;
}) {
  const colorValue = STAR_COLORS[star.color] || STAR_COLORS.white;
  const outerRadius = star.size * 1.5;
  const innerRadius = star.size * 0.5;
  const viewBoxSize = outerRadius * 2;
  
  // Diffraction spikes for bright stars
  const hasDiffraction = star.brightness >= 0.9 && star.points === 8;
  
  return (
    <div
      className="absolute"
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: 'translate(-50%, -50%)',
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      {/* Outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: star.size * 6,
          height: star.size * 6,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${colorValue.replace(')', ' / 0.3)')}, transparent 70%)`,
          animation: `starTwinkle ${star.twinkleSpeed}s ease-in-out infinite`,
          animationDelay: `${star.twinkleDelay}s`,
        }}
      />
      
      {/* Diffraction spikes for bright stars */}
      {hasDiffraction && (
        <svg
          className="absolute"
          width={star.size * 8}
          height={star.size * 8}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.4,
          }}
          viewBox="0 0 100 100"
        >
          {/* Horizontal spike */}
          <line x1="0" y1="50" x2="100" y2="50" stroke={colorValue} strokeWidth="0.5" opacity="0.6" />
          {/* Vertical spike */}
          <line x1="50" y1="0" x2="50" y2="100" stroke={colorValue} strokeWidth="0.5" opacity="0.6" />
          {/* Diagonal spikes */}
          <line x1="15" y1="15" x2="85" y2="85" stroke={colorValue} strokeWidth="0.3" opacity="0.4" />
          <line x1="85" y1="15" x2="15" y2="85" stroke={colorValue} strokeWidth="0.3" opacity="0.4" />
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
          filter: `drop-shadow(0 0 ${star.size}px ${colorValue})`,
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
        {/* Bright core */}
        <circle
          cx={outerRadius}
          cy={outerRadius}
          r={star.size * 0.3}
          fill="white"
          opacity={star.brightness}
        />
      </svg>
      
      {/* Star label */}
      {showLabel && star.name && (
        <div
          className="absolute whitespace-nowrap text-[8px] font-light tracking-wider opacity-40 pointer-events-none"
          style={{
            left: '50%',
            top: `${viewBoxSize + 4}px`,
            transform: 'translateX(-50%)',
            color: colorValue,
            textShadow: `0 0 4px ${colorValue}`,
          }}
        >
          {star.name}
        </div>
      )}
    </div>
  );
});

// Nebula component for gas cloud effects
const NebulaCloud = memo(function NebulaCloud({ nebula }: { nebula: Nebula }) {
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
        filter: 'blur(8px)',
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
  blur?: number;
  showLabels?: boolean;
}

const Constellation = memo(function Constellation({ 
  name, 
  className, 
  width, 
  height, 
  detailLevel,
  blur = 0,
  showLabels = true,
}: ConstellationProps) {
  const data = CONSTELLATIONS.find(c => c.name === name);
  if (!data) return null;

  const starMap = useMemo(() => {
    const map = new Map<string, ConstellationStar>();
    data.stars.forEach(star => map.set(star.id, star));
    return map;
  }, [data.stars]);

  // Filter stars based on detail level
  const visibleStars = useMemo(() => {
    if (detailLevel === 'full') return data.stars;
    if (detailLevel === 'simplified') return data.stars.filter(s => s.brightness >= 0.7);
    return data.stars.filter(s => s.brightness >= 0.85); // minimal
  }, [data.stars, detailLevel]);

  const showNebulaEffects = detailLevel === 'full' && data.nebulae;
  const showStarLabels = showLabels && detailLevel !== 'minimal';

  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ width, height }}>
      {/* Nebulae (background) */}
      {showNebulaEffects && data.nebulae?.map((nebula, i) => (
        <NebulaCloud key={`nebula-${i}`} nebula={nebula} />
      ))}
      
      {/* Connection lines with gradient */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`line-gradient-${name}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0.05" />
            <stop offset="50%" stopColor="hsl(185, 80%, 70%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {data.lines.map((line, i) => {
          const from = starMap.get(line.from);
          const to = starMap.get(line.to);
          if (!from || !to) return null;
          
          // Skip lines to hidden stars in simplified mode
          if (detailLevel !== 'full' && (from.brightness < 0.7 || to.brightness < 0.7)) return null;
          
          return (
            <g key={i}>
              {/* Glow effect */}
              <line
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke={`url(#line-gradient-${name})`}
                strokeWidth="3"
                className="animate-[constellationPulse_8s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
              {/* Core line */}
              <line
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke="hsl(185, 80%, 75%)"
                strokeWidth="0.5"
                opacity="0.2"
                className="animate-[constellationPulse_8s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.5}s` }}
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
          blur={blur}
        />
      ))}
      
      {/* Constellation name label */}
      {showStarLabels && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-light tracking-[0.3em] uppercase opacity-25 text-cyan-300"
          style={{ textShadow: '0 0 8px hsl(185, 80%, 70%)' }}
        >
          {data.displayName}
        </div>
      )}
    </div>
  );
});

interface BackgroundStarsProps {
  count?: number;
  blur?: number;
}

export function BackgroundStars({ count = 50, blur = 0 }: BackgroundStarsProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Varied star types
      const rand = Math.random();
      const points = rand < 0.6 ? 4 : rand < 0.9 ? 6 : 8;
      const color: StarColor = rand < 0.7 ? 'white' : rand < 0.85 ? 'blue-white' : rand < 0.95 ? 'gold' : 'cyan';
      
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60, // Keep in upper 60% of viewport
        size: 0.8 + Math.random() * 1.8,
        opacity: 0.15 + Math.random() * 0.35,
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
              boxShadow: `0 0 ${star.size * 2}px ${colorValue.replace(')', ' / 0.5)')}`,
              animation: `starTwinkle ${star.twinkleSpeed}s ease-in-out infinite`,
              animationDelay: `${star.twinkleDelay}s`,
              filter: blur > 0 ? `blur(${blur}px)` : undefined,
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
  const { constellationDetail, enableBlur, isSmallScreen, isVerySmallScreen } = performanceConfig;
  
  // Parallax transforms for different depth layers
  const slowParallax = scrollY * 0.3;
  const mediumParallax = scrollY * 0.5;
  const fastParallax = scrollY * 0.7;
  
  // Responsive sizing
  const getConstellationSize = (baseWidth: number, baseHeight: number) => {
    if (isVerySmallScreen) return { width: baseWidth * 0.5, height: baseHeight * 0.5 };
    if (isSmallScreen) return { width: baseWidth * 0.7, height: baseHeight * 0.7 };
    return { width: baseWidth, height: baseHeight };
  };
  
  const orionSize = getConstellationSize(160, 200);
  const ursaSize = getConstellationSize(240, 110);
  const cassiopeiaSize = getConstellationSize(200, 90);
  
  // Depth blur for atmospheric perspective
  const farBlur = enableBlur ? 1.5 : 0;
  const midBlur = enableBlur ? 0.8 : 0;
  const nearBlur = 0;

  return (
    <>
      {/* Background star field - deepest layer */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: `translateY(${slowParallax * 0.5}px)`,
          filter: enableBlur ? 'blur(1px)' : undefined,
        }}
      >
        <BackgroundStars 
          count={isSmallScreen ? 30 : 60} 
          blur={farBlur}
        />
      </div>

      {/* Cassiopeia - slow parallax (furthest) */}
      <div 
        className="absolute top-[3%] left-[30%] opacity-50"
        style={{ 
          transform: `translateY(${slowParallax}px) translateZ(-300px)`,
        }}
      >
        <Constellation 
          name="cassiopeia" 
          width={cassiopeiaSize.width} 
          height={cassiopeiaSize.height}
          detailLevel={constellationDetail}
          blur={farBlur}
          showLabels={!isVerySmallScreen}
        />
      </div>

      {/* Ursa Major - medium parallax */}
      <div 
        className="absolute top-[8%] right-[5%] opacity-60"
        style={{ 
          transform: `translateY(${mediumParallax * 0.6}px) translateZ(-200px)`,
        }}
      >
        <Constellation 
          name="ursaMajor" 
          width={ursaSize.width} 
          height={ursaSize.height}
          detailLevel={constellationDetail}
          blur={midBlur}
          showLabels={!isVerySmallScreen}
        />
      </div>

      {/* Orion - fast parallax (closest) */}
      <div 
        className="absolute top-[12%] left-[5%] opacity-75"
        style={{ 
          transform: `translateY(${fastParallax * 0.4}px) translateZ(-100px)`,
        }}
      >
        <Constellation 
          name="orion" 
          width={orionSize.width} 
          height={orionSize.height}
          detailLevel={constellationDetail}
          blur={nearBlur}
          showLabels={!isSmallScreen}
        />
      </div>
    </>
  );
}
