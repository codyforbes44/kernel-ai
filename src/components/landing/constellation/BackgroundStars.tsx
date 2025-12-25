import { useMemo } from 'react';
import { STAR_COLORS, type StarColor } from './types';

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
