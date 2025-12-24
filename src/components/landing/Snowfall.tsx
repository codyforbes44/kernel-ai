import { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  SantaSleigh, 
  SnowPile, 
  Snowblower,
  NorthStar,
  Moon,
  MeteorShower,
  SNOW_CONFIG,
  CHRISTMAS_LAYERS,
} from './christmas';
import { useChristmasPerformance, scaleParticleCount } from './christmas/hooks/useChristmasPerformance';
import type { Snowflake, Star, ShootingStar } from './christmas/types';

interface WindGust {
  id: number;
  intensity: number; // 0.3 to 1.0
  direction: number; // angle in degrees
  startTime: number;
}

/**
 * Main Christmas scene component that orchestrates all winter wonderland elements.
 * Uses z-index layering for proper visual stacking and optimizes for performance.
 */
export function Snowfall() {
  const { particleScale, prefersReducedMotion } = useChristmasPerformance();
  const [windGust, setWindGust] = useState<WindGust | null>(null);

  // Wind gust system - creates occasional gentle gusts
  const triggerWindGust = useCallback(() => {
    const intensity = 0.3 + Math.random() * 0.7;
    const direction = Math.random() > 0.5 ? 1 : -1; // left or right
    const angle = direction * (15 + Math.random() * 25); // 15-40 degrees
    
    setWindGust({
      id: Date.now(),
      intensity,
      direction: angle,
      startTime: Date.now(),
    });

    // Clear gust after duration
    setTimeout(() => {
      setWindGust(null);
    }, 2000 + intensity * 1500); // 2-3.5s duration
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Random gusts every 8-15 seconds
    const scheduleNextGust = () => {
      const delay = 8000 + Math.random() * 7000;
      return setTimeout(() => {
        triggerWindGust();
        scheduleNextGust();
      }, delay);
    };

    // Initial gust after 5 seconds
    const initialTimeout = setTimeout(() => {
      triggerWindGust();
    }, 5000);

    const gustTimeout = scheduleNextGust();

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(gustTimeout);
    };
  }, [prefersReducedMotion, triggerWindGust]);

  // Scale particle counts based on device capabilities
  const snowflakeCount = scaleParticleCount(SNOW_CONFIG.SNOWFLAKES, particleScale);
  const starCount = scaleParticleCount(SNOW_CONFIG.STARS, particleScale);
  const shootingStarCount = scaleParticleCount(SNOW_CONFIG.SHOOTING_STARS, particleScale);

  // Optimized snowflake generation with wind responsiveness
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

  // Optimized star generation with varied organic timing
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: starCount }, (_, i) => {
      // Create varied twinkle durations based on position for organic feel
      const baseDuration = 2.2 + (i % 5) * 0.6; // 2.2s to 4.6s range
      const variation = ((i * 7) % 10) * 0.12; // Add pseudo-random variation
      return {
        id: i,
        x: (i * 5) % 100,
        y: 5 + (i * 2.8) % 55,
        size: 2 + (i % 3),
        twinkleDuration: baseDuration + variation,
        delay: (i * 0.23) % 4, // Stagger delays more
      };
    });
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

  // Calculate wind effect for each snowflake based on its position
  const getWindStyle = (flakeId: number, size: number) => {
    if (!windGust) return {};
    
    // Smaller flakes are more affected by wind
    const sizeMultiplier = 1 + (5 - size) * 0.2;
    // Add some randomness per flake
    const flakeVariance = 0.7 + (flakeId % 10) * 0.06;
    const effectiveIntensity = windGust.intensity * sizeMultiplier * flakeVariance;
    
    return {
      animation: `snowfallSmooth 8s linear infinite, windGust ${1.5 + Math.random() * 0.5}s ease-in-out`,
      '--wind-angle': `${windGust.direction * effectiveIntensity}deg`,
      '--wind-shift': `${windGust.direction * effectiveIntensity * 2}px`,
    } as React.CSSProperties;
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: CHRISTMAS_LAYERS.STARS }}
      aria-hidden="true"
    >
      {/* Layer 0: Subtle moon glow */}
      <Moon />
      
      {/* Layer 1: Twinkling stars (background) - organic varied timing */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute motion-reduce:hidden"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.twinkleDuration}s cubic-bezier(0.4, 0, 0.6, 1) infinite, starParallax 40s ease-in-out infinite`,
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
      
      {/* Layer 3.5: Meteor shower effects */}
      <MeteorShower />
      
      {/* Layer 4: Santa and reindeer sleigh */}
      <SantaSleigh />
      
      {/* Layer 5: Snowflakes with wind gust effects */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className={`absolute rounded-full bg-white/80 motion-reduce:hidden ${windGust ? 'wind-affected' : ''}`}
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfallSmooth ${flake.duration}s linear infinite, snowDrift ${flake.driftDuration}s ease-in-out infinite${windGust ? `, windGust 2s ease-in-out` : ''}`,
            animationDelay: `${flake.delay}s`,
            willChange: 'transform',
            transform: 'translateZ(0)',
            zIndex: CHRISTMAS_LAYERS.SNOWFLAKES,
            ...getWindStyle(flake.id, flake.size),
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