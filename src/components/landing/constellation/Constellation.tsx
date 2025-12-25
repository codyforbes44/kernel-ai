import { memo, useMemo } from 'react';
import { DetailedStar } from './DetailedStar';
import { NebulaCloud } from './NebulaCloud';
import { CONSTELLATIONS } from './starData';
import type { ConstellationStar, ConstellationDetail } from './types';

interface ConstellationProps {
  name: 'creation' | 'development' | 'intelligence';
  className?: string;
  width: number;
  height: number;
  detailLevel: ConstellationDetail;
  showLabels?: boolean;
}

export const Constellation = memo(function Constellation({ 
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
