import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { 
  SantaSleigh, 
  SnowPile, 
  Snowblower,
  NorthStar,
  Moon,
  MeteorShower,
  SnowAccumulation,
  SNOW_CONFIG,
  CHRISTMAS_LAYERS,
} from './christmas';
import { useChristmasPerformance, scaleParticleCount } from './christmas/hooks/useChristmasPerformance';
import type { Snowflake, Star } from './christmas/types';

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
  const gustTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gustClearRef = useRef<NodeJS.Timeout | null>(null);

  // Wind gust system - creates occasional gentle gusts
  const triggerWindGust = useCallback(() => {
    const intensity = 0.3 + Math.random() * 0.7;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const angle = direction * (15 + Math.random() * 25);
    
    setWindGust({
      id: Date.now(),
      intensity,
      direction: angle,
      startTime: Date.now(),
    });

    // Clear gust after duration
    if (gustClearRef.current) clearTimeout(gustClearRef.current);
    gustClearRef.current = setTimeout(() => {
      setWindGust(null);
    }, 2000 + intensity * 1500);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const scheduleNextGust = () => {
      const delay = 8000 + Math.random() * 7000;
      gustTimeoutRef.current = setTimeout(() => {
        triggerWindGust();
        scheduleNextGust();
      }, delay);
    };

    // Initial gust after 5 seconds
    const initialTimeout = setTimeout(() => {
      triggerWindGust();
      scheduleNextGust();
    }, 5000);

    return () => {
      clearTimeout(initialTimeout);
      if (gustTimeoutRef.current) clearTimeout(gustTimeoutRef.current);
      if (gustClearRef.current) clearTimeout(gustClearRef.current);
    };
  }, [prefersReducedMotion, triggerWindGust]);

  // Scale particle counts based on device capabilities
  const snowflakeCount = scaleParticleCount(SNOW_CONFIG.SNOWFLAKES, particleScale);
  const starCount = scaleParticleCount(SNOW_CONFIG.STARS, particleScale);

  // Optimized snowflake generation with layered variety for magical effect
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: snowflakeCount }, (_, i) => {
      // Three layers: far (small/slow), mid (medium), close (large/fast)
      const layer = i % 3;
      const baseSize = layer === 0 ? 1.5 : layer === 1 ? 3 : 5;
      const sizeVariation = Math.random() * 1.5;
      
      // Distribute evenly with slight randomness
      const baseX = (i / snowflakeCount) * 100;
      const xJitter = (Math.random() - 0.5) * 15;
      
      return {
        id: i,
        x: (baseX + xJitter + 100) % 100,
        size: baseSize + sizeVariation,
        opacity: 0.15 + layer * 0.25 + Math.random() * 0.15,
        duration: 14 - layer * 3 + Math.random() * 4, // Far: 11-15s, Close: 5-9s
        delay: Math.random() * 8,
        driftDuration: 2.5 + Math.random() * 2.5,
      };
    });
  }, [snowflakeCount]);

  // Optimized star generation with varied organic timing
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: starCount }, (_, i) => {
      const baseDuration = 2.2 + (i % 5) * 0.6;
      const variation = ((i * 7) % 10) * 0.12;
      return {
        id: i,
        x: (i * 5) % 100,
        y: 5 + (i * 2.8) % 55,
        size: 2 + (i % 3),
        twinkleDuration: baseDuration + variation,
        delay: (i * 0.23) % 4,
      };
    });
  }, [starCount]);

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

      {/* Layer 3: Majestic North Star */}
      <NorthStar />
      
      {/* Layer 3.5: Meteor shower effects */}
      <MeteorShower />
      
      {/* Layer 4: Santa and reindeer sleigh */}
      <SantaSleigh />
      
      {/* Layer 5: Snowflakes with wind gust effects */}
      {snowflakes.map((flake) => {
        // Vary the fall endpoint between 60px and 100px from bottom for natural look
        const fallEnd = 60 + (flake.id % 10) * 4;
        // Use negative delay to stagger snowflakes throughout their animation cycle
        const staggeredDelay = -(flake.id / snowflakes.length) * flake.duration + flake.delay;
        
        return (
          <div
            key={flake.id}
            className={`absolute rounded-full bg-white/80 motion-reduce:hidden ${windGust ? 'wind-affected' : ''}`}
            style={{
              left: `${flake.x}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animation: `snowfallSmooth ${flake.duration}s linear infinite, snowDrift ${flake.driftDuration}s ease-in-out infinite${windGust ? `, windGust 2s ease-in-out` : ''}`,
              animationDelay: `${staggeredDelay}s, ${flake.delay}s${windGust ? ', 0s' : ''}`,
              willChange: 'transform',
              transform: 'translateZ(0)',
              zIndex: CHRISTMAS_LAYERS.SNOWFLAKES,
              '--fall-end': `calc(100% - ${fallEnd}px)`,
              ...getWindStyle(flake.id, flake.size),
            } as React.CSSProperties}
          />
        );
      })}
      
      {/* Layer 5.5: Snow accumulation */}
      <SnowAccumulation />
      
      {/* Layer 6: Snow pile */}
      <div style={{ zIndex: CHRISTMAS_LAYERS.SNOW_PILE }}>
        <SnowPile />
      </div>
      
      {/* Layer 7: Snowblower (topmost) */}
      <Snowblower />
    </div>
  );
}