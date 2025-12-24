import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { 
  SantaSleigh, 
  SnowPile, 
  NorthStar,
  Moon,
  MeteorShower,
  SnowAccumulation,
  SNOW_CONFIG,
  CHRISTMAS_LAYERS,
  DEPTH_LAYERS,
} from './christmas';
import { useChristmasPerformance, scaleParticleCount } from './christmas/hooks/useChristmasPerformance';
import type { Snowflake, Star } from './christmas/types';

interface WindGust {
  id: number;
  intensity: number;
  direction: number;
  startTime: number;
}

interface MousePosition {
  x: number;
  y: number;
}

/**
 * Main Christmas scene component with enhanced depth perception.
 * Uses 5-layer system with blur, perspective, and mouse parallax.
 */
export function Snowfall() {
  const { particleScale, prefersReducedMotion } = useChristmasPerformance();
  const [windGust, setWindGust] = useState<WindGust | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const gustTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gustClearRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for parallax effect
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -0.5 to 0.5 range
      setMousePosition({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  // Wind gust system
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

  // Generate snowflakes with 5-layer depth system
  const snowflakes = useMemo<Snowflake[]>(() => {
    // Layer distribution: more flakes in mid layers, sparse at extremes
    const layerDistribution = [0.12, 0.22, 0.32, 0.22, 0.12]; // 5 layers
    
    return Array.from({ length: snowflakeCount }, (_, i) => {
      // Determine layer based on distribution
      let layer = 2; // Default to mid
      const rand = Math.random();
      let cumulative = 0;
      for (let l = 0; l < 5; l++) {
        cumulative += layerDistribution[l];
        if (rand < cumulative) {
          layer = l;
          break;
        }
      }
      
      const config = DEPTH_LAYERS[layer as keyof typeof DEPTH_LAYERS];
      const sizeRange = config.sizeMax - config.sizeMin;
      const durationRange = config.durationMax - config.durationMin;
      const opacityRange = config.opacityMax - config.opacityMin;
      
      // Distribute evenly with slight randomness
      const baseX = (i / snowflakeCount) * 100;
      const xJitter = (Math.random() - 0.5) * 15;
      
      return {
        id: i,
        x: (baseX + xJitter + 100) % 100,
        size: config.sizeMin + Math.random() * sizeRange,
        opacity: config.opacityMin + Math.random() * opacityRange,
        duration: config.durationMin + Math.random() * durationRange,
        delay: Math.random() * 8,
        driftDuration: 2.5 + Math.random() * 2.5,
        layer,
        blur: config.blur,
        translateZ: config.translateZ,
        parallaxFactor: config.parallaxFactor,
      };
    });
  }, [snowflakeCount]);

  // Generate stars with organic timing
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

  // Calculate wind effect
  const getWindStyle = (flakeId: number, size: number) => {
    if (!windGust) return {};
    
    const sizeMultiplier = 1 + (5 - size) * 0.2;
    const flakeVariance = 0.7 + (flakeId % 10) * 0.06;
    const effectiveIntensity = windGust.intensity * sizeMultiplier * flakeVariance;
    
    return {
      '--wind-angle': `${windGust.direction * effectiveIntensity}deg`,
      '--wind-shift': `${windGust.direction * effectiveIntensity * 2}px`,
    } as React.CSSProperties;
  };

  // Calculate parallax offset for a snowflake
  const getParallaxOffset = (parallaxFactor: number) => {
    if (prefersReducedMotion) return { x: 0, y: 0 };
    return {
      x: mousePosition.x * parallaxFactor * 60,
      y: mousePosition.y * parallaxFactor * 40,
    };
  };

  // Get z-index based on layer
  const getLayerZIndex = (layer: number) => {
    if (layer <= 1) return CHRISTMAS_LAYERS.SNOWFLAKES_FAR;
    if (layer === 2) return CHRISTMAS_LAYERS.SNOWFLAKES_MID;
    return CHRISTMAS_LAYERS.SNOWFLAKES_CLOSE;
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        zIndex: CHRISTMAS_LAYERS.STARS,
        perspective: '1000px',
        perspectiveOrigin: '50% 50%',
      }}
      aria-hidden="true"
    >
      {/* 3D transform container */}
      <div 
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Layer 0: Subtle moon glow */}
        <Moon />
        
        {/* Layer 1: Twinkling stars */}
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
              transform: 'translateZ(-400px)',
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
        
        {/* Layer 3.5: Meteor shower */}
        <MeteorShower />
        
        {/* Layer 4: Santa sleigh */}
        <SantaSleigh />
        
        {/* Atmospheric haze layer - creates depth between far and close snowflakes */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: CHRISTMAS_LAYERS.ATMOSPHERIC_HAZE,
            background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.03) 30%, rgba(15, 23, 42, 0.08) 60%, transparent 100%)',
            transform: 'translateZ(-50px)',
          }}
        />
        
        {/* Layer 5: Snowflakes with 5-layer depth system */}
        {snowflakes.map((flake) => {
          const fallEnd = 60 + (flake.id % 10) * 4;
          const staggeredDelay = -(flake.id / snowflakes.length) * flake.duration + flake.delay;
          const parallaxOffset = getParallaxOffset(flake.parallaxFactor);
          
          // Close flakes get glow effect
          const glowStyle = flake.layer >= 3 
            ? { boxShadow: '0 0 4px rgba(255,255,255,0.5)' }
            : {};
          
          return (
            <div
              key={flake.id}
              className={`absolute rounded-full bg-white motion-reduce:hidden ${windGust ? 'wind-affected' : ''}`}
              style={{
                left: `${flake.x}%`,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                opacity: flake.opacity,
                filter: flake.blur > 0 ? `blur(${flake.blur}px)` : undefined,
              animation: `snowfallSmooth ${flake.duration}s linear infinite, snowDrift ${flake.driftDuration}s ease-in-out infinite${windGust ? ', windGust 2s ease-in-out' : ''}`,
              animationDelay: `${staggeredDelay}s, ${flake.delay}s${windGust ? ', 0s' : ''}`,
              willChange: 'transform',
              transform: `translateZ(${flake.translateZ}px) translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
              zIndex: getLayerZIndex(flake.layer),
              ...glowStyle,
              ...getWindStyle(flake.id, flake.size),
              ...{ '--fall-end': `calc(100% - ${fallEnd}px)` } as React.CSSProperties,
            }}
            />
          );
        })}
        
        {/* Layer 5.5: Snow accumulation */}
        <SnowAccumulation />
        
        {/* Layer 6: Snow pile */}
        <div style={{ zIndex: CHRISTMAS_LAYERS.SNOW_PILE }}>
          <SnowPile />
        </div>
      </div>
    </div>
  );
}
