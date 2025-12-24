import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { 
  SantaSleigh, 
  SnowPile, 
  NorthStar,
  Moon,
  MeteorShower,
  SnowAccumulation,
  SNOW_CONFIG,
  MOBILE_SNOW_CONFIG,
  CHRISTMAS_LAYERS,
  DEPTH_LAYERS,
  MOBILE_DEPTH_LAYERS,
  PERSPECTIVE_CONFIG,
} from './christmas';
import { useChristmasPerformance, scaleParticleCount, lerp, clampSize } from './christmas/hooks/useChristmasPerformance';
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
  targetX: number;
  targetY: number;
}

/**
 * Main Christmas scene component with enhanced 7-layer depth perception.
 * Mobile-first optimized with removed atmospheric haze layers.
 */
export function Snowfall() {
  const performanceConfig = useChristmasPerformance();
  const { 
    particleScale, 
    prefersReducedMotion, 
    enableBlur, 
    enable3DTransforms, 
    enableAtmosphericEffects,
    isSmallScreen,
    maxSnowflakeSize,
  } = performanceConfig;
  
  const [windGust, setWindGust] = useState<WindGust | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ 
    x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 
  });
  const gustTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gustClearRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use mobile config for small screens
  const snowConfig = isSmallScreen ? MOBILE_SNOW_CONFIG : SNOW_CONFIG;
  const depthLayers = isSmallScreen ? MOBILE_DEPTH_LAYERS : DEPTH_LAYERS;

  // Smooth mouse position interpolation for buttery parallax
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    let animationFrame: number;
    const smoothFactor = PERSPECTIVE_CONFIG.PARALLAX_SMOOTHING;
    
    const updatePosition = () => {
      setMousePosition(prev => {
        const newX = lerp(prev.x, prev.targetX, smoothFactor);
        const newY = lerp(prev.y, prev.targetY, smoothFactor);
        if (Math.abs(newX - prev.x) > 0.001 || Math.abs(newY - prev.y) > 0.001) {
          return { ...prev, x: newX, y: newY };
        }
        return prev;
      });
      animationFrame = requestAnimationFrame(updatePosition);
    };
    
    animationFrame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrame);
  }, [prefersReducedMotion]);

  // Mouse tracking for parallax effect
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition(prev => ({
        ...prev,
        targetX: e.clientX / window.innerWidth,
        targetY: e.clientY / window.innerHeight,
      }));
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
  const snowflakeCount = scaleParticleCount(snowConfig.SNOWFLAKES, particleScale);
  const starCount = scaleParticleCount(snowConfig.STARS, particleScale);

  // Generate snowflakes with 7-layer depth system - CAPPED SIZES
  const snowflakes = useMemo<Snowflake[]>(() => {
    if (prefersReducedMotion) return [];
    
    const layerDistribution = [0.06, 0.10, 0.14, 0.18, 0.22, 0.18, 0.12];
    
    return Array.from({ length: snowflakeCount }, (_, i) => {
      let layer = 4;
      const rand = Math.random();
      let cumulative = 0;
      for (let l = 0; l <= 6; l++) {
        cumulative += layerDistribution[l];
        if (rand < cumulative) {
          layer = l;
          break;
        }
      }
      
      const config = depthLayers[layer];
      const sizeRange = config.sizeMax - config.sizeMin;
      const durationRange = config.durationMax - config.durationMin;
      const opacityRange = config.opacityMax - config.opacityMin;
      
      const baseX = (i / snowflakeCount) * 100;
      const xJitter = (Math.random() - 0.5) * 15;
      
      // Clamp size to maxSnowflakeSize
      const rawSize = config.sizeMin + Math.random() * sizeRange;
      const size = clampSize(rawSize, maxSnowflakeSize);
      
      return {
        id: i,
        x: (baseX + xJitter + 100) % 100,
        size,
        opacity: config.opacityMin + Math.random() * opacityRange,
        duration: config.durationMin + Math.random() * durationRange,
        delay: Math.random() * 8,
        driftDuration: 2.5 + Math.random() * 2.5,
        layer,
        blur: enableBlur ? config.blur : 0,
        translateZ: enable3DTransforms ? config.translateZ : 0,
        parallaxFactor: config.parallaxFactor,
        colorShift: enableAtmosphericEffects ? config.colorShift : 0,
      };
    });
  }, [snowflakeCount, prefersReducedMotion, enableBlur, enable3DTransforms, enableAtmosphericEffects, depthLayers, maxSnowflakeSize]);

  // Generate stars with organic timing - CAPPED SIZES
  const stars = useMemo<Star[]>(() => {
    if (prefersReducedMotion) return [];
    
    const maxStarSize = isSmallScreen ? 2 : 3;
    
    return Array.from({ length: starCount }, (_, i) => {
      const baseDuration = 2.2 + (i % 5) * 0.6;
      const variation = ((i * 7) % 10) * 0.12;
      return {
        id: i,
        x: (i * 5) % 100,
        y: 5 + (i * 2.8) % 55,
        size: Math.min(1.5 + (i % 3), maxStarSize),
        twinkleDuration: baseDuration + variation,
        delay: (i * 0.23) % 4,
      };
    });
  }, [starCount, prefersReducedMotion, isSmallScreen]);

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

  // Calculate parallax offset with enhanced range
  const getParallaxOffset = (parallaxFactor: number) => {
    if (prefersReducedMotion) return { x: 0, y: 0 };
    const maxOffset = performanceConfig.isSmallScreen 
      ? PERSPECTIVE_CONFIG.MAX_PARALLAX_MOBILE 
      : PERSPECTIVE_CONFIG.MAX_PARALLAX_DESKTOP;
    return {
      x: (mousePosition.x - 0.5) * parallaxFactor * maxOffset,
      y: (mousePosition.y - 0.5) * parallaxFactor * maxOffset * 0.6,
    };
  };

  // Get z-index based on layer (7-layer system)
  const getLayerZIndex = (layer: number): number => {
    const layerConfig = depthLayers[layer];
    return layerConfig?.zIndex || CHRISTMAS_LAYERS.SNOWFLAKES_MID;
  };

  // Generate atmospheric color for distant objects
  const getAtmosphericColor = (colorShift: number): string => {
    if (!enableAtmosphericEffects || colorShift === 0) {
      return 'white';
    }
    const blueIntensity = Math.min(35, colorShift * 55);
    return `hsl(210, ${blueIntensity}%, ${100 - colorShift * 8}%)`;
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        zIndex: CHRISTMAS_LAYERS.STARS,
        perspective: `${PERSPECTIVE_CONFIG.PERSPECTIVE}px`,
        perspectiveOrigin: PERSPECTIVE_CONFIG.PERSPECTIVE_ORIGIN,
      }}
      aria-hidden="true"
    >
      {/* 3D transform container */}
      <div 
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Layer 0: Subtle moon glow - deepest */}
        <Moon />
        
        {/* Layer 1: Twinkling stars with depth */}
        {stars.map((star) => {
          const parallax = getParallaxOffset(-0.25);
          return (
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
                transform: enable3DTransforms 
                  ? `translate3d(${parallax.x}px, ${parallax.y}px, -450px)`
                  : `translate(${parallax.x}px, ${parallax.y}px)`,
                zIndex: CHRISTMAS_LAYERS.STARS,
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white/80 drop-shadow-[0_0_2px_rgba(255,255,255,0.6)]">
                <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
              </svg>
            </div>
          );
        })}

        {/* Layer 3: Majestic North Star */}
        <NorthStar />
        
        {/* Layer 3.5: Meteor shower */}
        <MeteorShower />
        
        {/* Layer 4: Santa sleigh */}
        <SantaSleigh />
        
        {/* REMOVED: Atmospheric haze layers that created blurred box artifacts */}
        
        {/* Layer 5: Snowflakes with 7-layer depth system */}
        {snowflakes.map((flake) => {
          const fallEnd = 60 + (flake.id % 10) * 4;
          const staggeredDelay = -(flake.id / snowflakes.length) * flake.duration + flake.delay;
          const parallaxOffset = getParallaxOffset(flake.parallaxFactor);
          const atmosphericColor = getAtmosphericColor(flake.colorShift);
          
          // Reduced glow effect - only on close flakes, smaller spread
          const glowStyle = flake.layer >= 5 
            ? { boxShadow: `0 0 ${Math.min(flake.size * 0.3, 2)}px rgba(255,255,255,0.3)` }
            : {};
          
          return (
            <div
              key={flake.id}
              className={`absolute rounded-full motion-reduce:hidden ${windGust ? 'wind-affected' : ''}`}
              style={{
                left: `${flake.x}%`,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                backgroundColor: atmosphericColor,
                opacity: flake.opacity,
                filter: flake.blur > 0 ? `blur(${flake.blur}px)` : undefined,
                animation: `snowfallSmooth ${flake.duration}s linear infinite, snowDrift ${flake.driftDuration}s ease-in-out infinite${windGust ? ', windGust 2s ease-in-out' : ''}`,
                animationDelay: `${staggeredDelay}s, ${flake.delay}s${windGust ? ', 0s' : ''}`,
                willChange: 'transform',
                transform: enable3DTransforms
                  ? `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, ${flake.translateZ}px)`
                  : `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
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
