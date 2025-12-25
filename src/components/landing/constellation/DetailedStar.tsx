import { memo } from 'react';
import { SparkEffect } from './SparkEffect';
import { STAR_COLORS, type ConstellationStar } from './types';

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

interface DetailedStarProps {
  star: ConstellationStar;
  showLabel: boolean;
  simplified: boolean;
}

export const DetailedStar = memo(function DetailedStar({ star, showLabel, simplified }: DetailedStarProps) {
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
