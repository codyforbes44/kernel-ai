import { useMemo } from 'react';
import { 
  SantaSleigh, 
  SnowPile, 
  Snowblower,
  NorthStar,
  Aurora,
  SNOW_CONFIG,
  CHRISTMAS_LAYERS,
} from './christmas';
import { useChristmasPerformance, scaleParticleCount } from './christmas/hooks/useChristmasPerformance';
import type { Snowflake, Star, ShootingStar } from './christmas/types';

/**
 * Main Christmas scene component that orchestrates all winter wonderland elements.
 * Uses z-index layering for proper visual stacking and optimizes for performance.
 */
export function Snowfall() {
  const { particleScale } = useChristmasPerformance();

  // Scale particle counts based on device capabilities
  const snowflakeCount = scaleParticleCount(SNOW_CONFIG.SNOWFLAKES, particleScale);
  const starCount = scaleParticleCount(SNOW_CONFIG.STARS, particleScale);
  const shootingStarCount = scaleParticleCount(SNOW_CONFIG.SHOOTING_STARS, particleScale);

  // Optimized snowflake generation
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: snowflakeCount }, (_, i) => ({
      id: i,
      x: (i * 3.33) % 100,
      size: 2 + (i % 4),
      opacity: 0.3 + (i % 5) * 0.12,
      duration: 8 + (i % 6),
      delay: (i * 0.35) % 5,
      driftDuration: 3 + (i % 4),
    }));
  }, [snowflakeCount]);

  // Optimized star generation
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: (i * 5) % 100,
      y: 5 + (i * 2.8) % 55,
      size: 2 + (i % 3),
      twinkleDuration: 1.5 + (i % 3) * 0.5,
      delay: (i * 0.15) % 3,
    }));
  }, [starCount]);

  // Subtle shooting stars - rare and peaceful
  const shootingStars = useMemo<ShootingStar[]>(() => {
    return Array.from({ length: shootingStarCount }, (_, i) => ({
      id: i,
      startX: 15 + (i * 40),
      startY: 8 + (i * 8),
      delay: 18 + i * 30,
      duration: 2.8 + i * 0.5,
    }));
  }, [shootingStarCount]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: CHRISTMAS_LAYERS.STARS }}
      aria-hidden="true"
    >
      {/* Layer 0: Aurora Borealis (deepest background) */}
      <Aurora />
      {/* Layer 1: Twinkling stars (background) */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute motion-reduce:hidden"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.twinkleDuration}s ease-in-out infinite, starParallax 40s ease-in-out infinite`,
            animationDelay: `${star.delay}s, ${star.delay * 5}s`,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
            zIndex: CHRISTMAS_LAYERS.STARS,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white/90 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
          </svg>
        </div>
      ))}

      {/* Layer 2: Shooting stars */}
      {shootingStars.map((star) => (
        <div
          key={`shooting-${star.id}`}
          className="absolute motion-reduce:hidden"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            animation: `shootingStarPeaceful ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            willChange: 'transform, opacity',
            zIndex: CHRISTMAS_LAYERS.SHOOTING_STARS,
          }}
        >
          <div 
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(240,245,255,0.6) 60%, transparent 100%)',
              boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.5), 0 0 8px 2px rgba(220, 230, 255, 0.25)',
            }}
          />
          <div 
            className="absolute top-0.5 -left-16 w-16 h-0.5 origin-right"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0.4) 100%)',
              transform: 'rotate(-35deg)',
              borderRadius: '0 2px 2px 0',
            }}
          />
          {[0, 1, 2].map((i) => (
            <div
              key={`trail-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${2 - i * 0.5}px`,
                height: `${2 - i * 0.5}px`,
                background: `rgba(255, 255, 255, ${0.4 - i * 0.12})`,
                left: `${-6 - i * 5}px`,
                top: `${2 + i * 3}px`,
              }}
            />
          ))}
        </div>
      ))}
      
      {/* Layer 3: Majestic North Star */}
      <NorthStar />
      
      {/* Layer 4: Santa and reindeer sleigh */}
      <SantaSleigh />
      
      {/* Layer 5: Snowflakes with GPU acceleration */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white/80 motion-reduce:hidden"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfallSmooth ${flake.duration}s linear infinite, snowDrift ${flake.driftDuration}s ease-in-out infinite`,
            animationDelay: `${flake.delay}s`,
            willChange: 'transform',
            transform: 'translateZ(0)',
            zIndex: CHRISTMAS_LAYERS.SNOWFLAKES,
          }}
        />
      ))}
      
      {/* Layer 6: Snow pile */}
      <div style={{ zIndex: CHRISTMAS_LAYERS.SNOW_PILE }}>
        <SnowPile />
      </div>
      
      {/* Layer 7: Snowblower (topmost) */}
      <Snowblower />
    </div>
  );
}
