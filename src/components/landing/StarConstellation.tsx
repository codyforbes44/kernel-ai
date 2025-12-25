import { useMemo, memo, useState, useEffect } from 'react';

// Kernel-themed star colors - using brand primary/accent colors
const STAR_COLORS: Record<string, string> = {
  'white': 'hsl(200, 20%, 95%)',
  'primary': 'hsl(var(--primary))',
  'accent': 'hsl(185, 80%, 65%)',
  'gold': 'hsl(45, 100%, 70%)',
  'innovation': 'hsl(280, 70%, 70%)',
  'energy': 'hsl(15, 90%, 65%)',
};

type StarColor = keyof typeof STAR_COLORS;
type ConstellationDetail = 'full' | 'simplified' | 'minimal';

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
  label?: string; // Kernel feature label
  color: StarColor;
  points: 4 | 6 | 8;
  hasSpark?: boolean; // Enable spark effect
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
  kernelTheme: string; // Kernel feature theme
  stars: ConstellationStar[];
  lines: ConstellationLine[];
  nebulae?: Nebula[];
}

// Simple performance hook to detect screen size
function usePerformance() {
  const [state, setState] = useState({
    isSmallScreen: false,
    isVerySmallScreen: false,
  });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setState({
        isSmallScreen: width < 768,
        isVerySmallScreen: width < 480,
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const constellationDetail: ConstellationDetail = state.isVerySmallScreen 
    ? 'minimal' 
    : state.isSmallScreen 
      ? 'simplified' 
      : 'full';

  return {
    ...state,
    constellationDetail,
    maxStarGlow: state.isSmallScreen ? 2 : 3,
  };
}

// Kernel-branded constellation patterns representing core capabilities
const CONSTELLATIONS: ConstellationData[] = [
  {
    name: 'creation',
    displayName: 'Creation',
    kernelTheme: 'Build & Create',
    stars: [
      { id: 'idea', x: 40, y: 50, size: 2.5, brightness: 0.9, twinkleSpeed: 4, twinkleDelay: 0, color: 'accent', points: 6, label: 'Idea' },
      { id: 'design', x: 50, y: 52, size: 3.5, brightness: 1, twinkleSpeed: 3.5, twinkleDelay: 0.5, name: 'Design', color: 'primary', points: 8, hasSpark: true, label: 'Design' },
      { id: 'prototype', x: 60, y: 50, size: 2.5, brightness: 0.85, twinkleSpeed: 4.5, twinkleDelay: 1, color: 'accent', points: 6, label: 'Prototype' },
      { id: 'innovate', x: 25, y: 25, size: 4, brightness: 1, twinkleSpeed: 3, twinkleDelay: 0.3, name: 'Innovate', color: 'innovation', points: 8, hasSpark: true, label: 'Innovate' },
      { id: 'iterate', x: 75, y: 28, size: 3, brightness: 0.9, twinkleSpeed: 3.2, twinkleDelay: 0.7, name: 'Iterate', color: 'accent', points: 6, label: 'Iterate' },
      { id: 'launch', x: 70, y: 85, size: 4, brightness: 1, twinkleSpeed: 2.8, twinkleDelay: 0.2, name: 'Launch', color: 'primary', points: 8, hasSpark: true, label: 'Launch' },
      { id: 'scale', x: 30, y: 82, size: 3, brightness: 0.8, twinkleSpeed: 4, twinkleDelay: 0.9, color: 'accent', points: 6, label: 'Scale' },
      { id: 'spark1', x: 48, y: 60, size: 1.5, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.2, color: 'white', points: 4 },
      { id: 'spark2', x: 50, y: 65, size: 2, brightness: 0.6, twinkleSpeed: 4.5, twinkleDelay: 0.8, color: 'gold', points: 4 },
      { id: 'spark3', x: 52, y: 70, size: 1.5, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.5, color: 'white', points: 4 },
    ],
    lines: [
      { from: 'idea', to: 'design' },
      { from: 'design', to: 'prototype' },
      { from: 'innovate', to: 'idea' },
      { from: 'iterate', to: 'prototype' },
      { from: 'idea', to: 'scale' },
      { from: 'prototype', to: 'launch' },
      { from: 'design', to: 'spark1' },
      { from: 'spark1', to: 'spark2' },
      { from: 'spark2', to: 'spark3' },
    ],
    nebulae: [
      { x: 48, y: 64, width: 24, height: 28, rotation: -15, opacity: 0.08, color: 'hsl(var(--primary))' },
    ],
  },
  {
    name: 'development',
    displayName: 'Development',
    kernelTheme: 'Code & Deploy',
    stars: [
      { id: 'code', x: 10, y: 20, size: 3, brightness: 0.95, twinkleSpeed: 3.5, twinkleDelay: 0, name: 'Code', color: 'primary', points: 8, hasSpark: true, label: 'Code' },
      { id: 'test', x: 10, y: 45, size: 2.8, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.4, name: 'Test', color: 'accent', points: 6, label: 'Test' },
      { id: 'build', x: 30, y: 55, size: 2.5, brightness: 0.8, twinkleSpeed: 4.2, twinkleDelay: 0.8, color: 'white', points: 6, label: 'Build' },
      { id: 'review', x: 45, y: 45, size: 2.2, brightness: 0.7, twinkleSpeed: 4.5, twinkleDelay: 0.2, color: 'white', points: 4, label: 'Review' },
      { id: 'merge', x: 60, y: 40, size: 2.8, brightness: 0.9, twinkleSpeed: 3.8, twinkleDelay: 0.6, name: 'Merge', color: 'accent', points: 6, label: 'Merge' },
      { id: 'deploy', x: 75, y: 35, size: 3.2, brightness: 0.95, twinkleSpeed: 3.5, twinkleDelay: 1, name: 'Deploy', color: 'primary', points: 8, hasSpark: true, label: 'Deploy' },
      { id: 'monitor', x: 77, y: 33, size: 1.5, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.2, color: 'gold', points: 4 },
      { id: 'ship', x: 90, y: 25, size: 3.5, brightness: 1, twinkleSpeed: 3.2, twinkleDelay: 0.3, name: 'Ship', color: 'energy', points: 8, hasSpark: true, label: 'Ship' },
    ],
    lines: [
      { from: 'code', to: 'test' },
      { from: 'test', to: 'build' },
      { from: 'build', to: 'review' },
      { from: 'review', to: 'code' },
      { from: 'review', to: 'merge' },
      { from: 'merge', to: 'deploy' },
      { from: 'deploy', to: 'ship' },
    ],
    nebulae: [
      { x: 55, y: 38, width: 30, height: 20, rotation: 10, opacity: 0.06, color: 'hsl(185, 80%, 65%)' },
    ],
  },
  {
    name: 'intelligence',
    displayName: 'Intelligence',
    kernelTheme: 'AI & Automation',
    stars: [
      { id: 'learn', x: 10, y: 40, size: 3, brightness: 0.95, twinkleSpeed: 3.3, twinkleDelay: 0, name: 'Learn', color: 'innovation', points: 8, hasSpark: true, label: 'Learn' },
      { id: 'analyze', x: 25, y: 20, size: 2.8, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.5, name: 'Analyze', color: 'accent', points: 6, label: 'Analyze' },
      { id: 'predict', x: 50, y: 50, size: 3.5, brightness: 1, twinkleSpeed: 3.5, twinkleDelay: 0.2, name: 'Predict', color: 'primary', points: 8, hasSpark: true, label: 'Predict' },
      { id: 'automate', x: 75, y: 25, size: 2.8, brightness: 0.9, twinkleSpeed: 4.2, twinkleDelay: 0.7, name: 'Automate', color: 'accent', points: 6, label: 'Automate' },
      { id: 'optimize', x: 90, y: 45, size: 3, brightness: 0.95, twinkleSpeed: 3.8, twinkleDelay: 0.4, name: 'Optimize', color: 'gold', points: 8, hasSpark: true, label: 'Optimize' },
    ],
    lines: [
      { from: 'learn', to: 'analyze' },
      { from: 'analyze', to: 'predict' },
      { from: 'predict', to: 'automate' },
      { from: 'automate', to: 'optimize' },
    ],
    nebulae: [
      { x: 50, y: 35, width: 40, height: 25, rotation: -5, opacity: 0.07, color: 'hsl(280, 70%, 70%)' },
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

// Spark effect component for bright stars
const SparkEffect = memo(function SparkEffect({ 
  size, 
  color, 
  delay 
}: { 
  size: number; 
  color: string; 
  delay: number;
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 8,
        height: size * 8,
      }}
    >
      {/* Radial spark pulse */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color.includes('var') ? `hsl(${color.replace('hsl(', '').replace(')', '')} / 0.6)` : color.replace(')', ' / 0.6)')}, transparent 60%)`,
          animation: `sparkPulse 4s ease-in-out infinite`,
          animationDelay: `${delay}s`,
        }}
      />
      {/* Cross spark lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{
          animation: `sparkRotate 8s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      >
        <line
          x1="50%"
          y1="15%"
          x2="50%"
          y2="85%"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.4"
          style={{
            animation: `sparkFade 4s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        />
        <line
          x1="15%"
          y1="50%"
          x2="85%"
          y2="50%"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.4"
          style={{
            animation: `sparkFade 4s ease-in-out infinite`,
            animationDelay: `${delay + 0.5}s`,
          }}
        />
      </svg>
    </div>
  );
});

// Multi-point detailed star component with Kernel branding
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
  
  // Diffraction spikes and spark effects only for bright stars on desktop
  const hasDiffraction = !simplified && star.brightness >= 0.9 && star.points === 8;
  const showSpark = !simplified && star.hasSpark;
  
  return (
    <div
      className="absolute"
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Spark effect for key Kernel stars */}
      {showSpark && (
        <SparkEffect 
          size={star.size} 
          color={colorValue} 
          delay={star.twinkleDelay} 
        />
      )}
      
      {/* Outer glow - enhanced with brand colors */}
      <div
        className="absolute rounded-full"
        style={{
          width: star.size * (simplified ? 4 : 6),
          height: star.size * (simplified ? 4 : 6),
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${colorValue.includes('var') ? `hsl(${colorValue.replace('hsl(', '').replace(')', '')} / 0.3)` : colorValue.replace(')', ' / 0.3)')}, transparent 70%)`,
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
            opacity: 0.4,
          }}
          viewBox="0 0 100 100"
        >
          <line x1="0" y1="50" x2="100" y2="50" stroke={colorValue} strokeWidth="0.5" opacity="0.6" />
          <line x1="50" y1="0" x2="50" y2="100" stroke={colorValue} strokeWidth="0.5" opacity="0.6" />
          <line x1="15" y1="15" x2="85" y2="85" stroke={colorValue} strokeWidth="0.3" opacity="0.3" />
          <line x1="85" y1="15" x2="15" y2="85" stroke={colorValue} strokeWidth="0.3" opacity="0.3" />
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
          filter: simplified ? undefined : `drop-shadow(0 0 ${star.size}px ${colorValue})`,
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
      
      {/* Kernel feature label - shows on desktop for key stars */}
      {showLabel && star.label && (
        <div
          className="absolute whitespace-nowrap text-[8px] font-medium tracking-wider opacity-50 pointer-events-none uppercase"
          style={{
            left: '50%',
            top: `${viewBoxSize + 4}px`,
            transform: 'translateX(-50%)',
            color: colorValue,
            textShadow: `0 0 8px ${colorValue}`,
          }}
        >
          {star.label}
        </div>
      )}
    </div>
  );
});

// Nebula component with Kernel brand colors
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
        filter: 'blur(6px)',
        animation: 'constellationPulse 12s ease-in-out infinite',
      }}
    />
  );
});

interface ConstellationProps {
  name: 'creation' | 'development' | 'intelligence';
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
      {/* Nebulae (background) with brand colors */}
      {showNebulaEffects && data.nebulae?.map((nebula, i) => (
        <NebulaCloud key={`nebula-${i}`} nebula={nebula} simplified={simplified} />
      ))}
      
      {/* Connection lines with gradient */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`line-gradient-${name}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
            <stop offset="50%" stopColor="hsl(185, 80%, 65%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
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
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                opacity="0.2"
              />
            </g>
          );
        })}
      </svg>

      {/* Detailed stars with Kernel branding */}
      {visibleStars.map((star) => (
        <DetailedStar 
          key={star.id} 
          star={star} 
          showLabel={showStarLabels}
          simplified={simplified}
        />
      ))}
      
      {/* Kernel theme label - desktop only */}
      {showStarLabels && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-light tracking-[0.3em] uppercase opacity-25"
          style={{ color: 'hsl(var(--primary))' }}
        >
          {data.kernelTheme}
        </div>
      )}
    </div>
  );
});

interface BackgroundStarsProps {
  count?: number;
  maxGlow?: number;
}

export function BackgroundStars({ count = 50, maxGlow = 3 }: BackgroundStarsProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const rand = Math.random();
      const points = rand < 0.7 ? 4 : rand < 0.9 ? 6 : 8;
      const color: StarColor = rand < 0.6 ? 'white' : rand < 0.8 ? 'accent' : rand < 0.95 ? 'primary' : 'gold';
      
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60,
        size: Math.min(0.6 + Math.random() * 1.6, 2.2),
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
              boxShadow: `0 0 ${glowSize}px ${colorValue.includes('var') ? `hsl(var(--primary) / 0.5)` : colorValue.replace(')', ' / 0.5)')}`,
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
  const { constellationDetail, isSmallScreen, isVerySmallScreen, maxStarGlow } = usePerformance();
  
  const slowParallax = scrollY * 0.3;
  const mediumParallax = scrollY * 0.5;
  const fastParallax = scrollY * 0.7;
  
  // Responsive sizing - reduced for mobile
  const getConstellationSize = (baseWidth: number, baseHeight: number) => {
    if (isVerySmallScreen) return { width: baseWidth * 0.4, height: baseHeight * 0.4 };
    if (isSmallScreen) return { width: baseWidth * 0.6, height: baseHeight * 0.6 };
    return { width: baseWidth, height: baseHeight };
  };
  
  const creationSize = getConstellationSize(150, 190);
  const developmentSize = getConstellationSize(210, 110);
  const intelligenceSize = getConstellationSize(190, 90);
  
  // Background star count based on screen size
  const bgStarCount = isVerySmallScreen ? 20 : isSmallScreen ? 35 : 60;

  return (
    <>
      {/* Background star field with Kernel colors */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          transform: `translateY(${slowParallax * 0.3}px)`,
        }}
      >
        <BackgroundStars count={bgStarCount} maxGlow={maxStarGlow} />
      </div>

      {/* Intelligence constellation - top right (AI & Automation) */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: isSmallScreen ? '2%' : '8%',
          top: isSmallScreen ? '8%' : '12%',
          transform: `translateY(${slowParallax * 0.4}px)`,
          opacity: 0.85,
        }}
      >
        <Constellation
          name="intelligence"
          width={intelligenceSize.width}
          height={intelligenceSize.height}
          detailLevel={constellationDetail}
          showLabels={!isSmallScreen}
        />
      </div>

      {/* Development constellation - top left (Code & Deploy) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: isSmallScreen ? '3%' : '5%',
          top: isSmallScreen ? '15%' : '20%',
          transform: `translateY(${mediumParallax * 0.3}px)`,
          opacity: 0.75,
        }}
      >
        <Constellation
          name="development"
          width={developmentSize.width}
          height={developmentSize.height}
          detailLevel={constellationDetail}
          showLabels={!isSmallScreen}
        />
      </div>

      {/* Creation constellation - center bottom (Build & Create) */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: isSmallScreen ? '15%' : '25%',
          bottom: isSmallScreen ? '20%' : '15%',
          transform: `translateY(${fastParallax * 0.2}px)`,
          opacity: 0.9,
        }}
      >
        <Constellation
          name="creation"
          width={creationSize.width}
          height={creationSize.height}
          detailLevel={constellationDetail}
          showLabels={!isSmallScreen}
        />
      </div>
    </>
  );
}
