import { useState, useEffect, useMemo } from 'react';
import { useChristmasPerformance } from './hooks/useChristmasPerformance';
import { CHRISTMAS_LAYERS } from './constants';

interface SnowDrift {
  id: number;
  x: number;
  width: number;
  maxHeight: number;
  delay: number;
}

/**
 * Gentle snow accumulation effect at the bottom of the screen.
 * Mobile-first optimized with fewer drifts and sparkles.
 */
export function SnowAccumulation() {
  const { prefersReducedMotion, isSmallScreen, isVerySmallScreen, deviceTier } = useChristmasPerformance();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }

    const duration = 30000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);
      
      if (newProgress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [prefersReducedMotion]);

  // Reduced drift count on mobile
  const drifts = useMemo<SnowDrift[]>(() => {
    const count = isVerySmallScreen ? 5 : isSmallScreen ? 7 : 10;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (i / count) * 100 - 5,
      width: 12 + (i % 3) * 6,
      maxHeight: 15 + (i % 4) * 8 + Math.sin(i * 0.8) * 6,
      delay: i * 0.12,
    }));
  }, [isSmallScreen, isVerySmallScreen]);

  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
  const easedProgress = easeOutQuart(progress);
  
  // Simplified sparkles on mobile
  const sparkleCount = isVerySmallScreen ? 2 : isSmallScreen ? 4 : 6;
  const showSparkles = easedProgress > 0.3 && deviceTier !== 'low';

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 pointer-events-none motion-reduce:hidden"
      style={{ zIndex: CHRISTMAS_LAYERS.SNOW_PILE - 1 }}
      aria-hidden="true"
    >
      {/* Base snow layer */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent"
        style={{
          height: `${easedProgress * 20}px`,
          transition: 'height 0.5s ease-out',
        }}
      />

      {/* Organic snow drifts */}
      {drifts.map((drift) => {
        const driftProgress = Math.max(0, Math.min(1, (progress - drift.delay * 0.1) * 1.5));
        const height = easeOutQuart(driftProgress) * drift.maxHeight;
        
        return (
          <div
            key={drift.id}
            className="absolute bottom-0"
            style={{
              left: `${drift.x}%`,
              width: `${drift.width}%`,
              height: `${height}px`,
              background: 'linear-gradient(to top, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.8) 60%, rgba(255,255,255,0) 100%)',
              borderRadius: '50% 50% 0 0',
              transform: 'translateZ(0)',
            }}
          />
        );
      })}

      {/* Sparkle highlights - reduced on mobile */}
      {showSparkles && (
        <div className="absolute bottom-0 left-0 right-0 h-6 overflow-hidden">
          {Array.from({ length: sparkleCount }, (_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                left: `${10 + i * (85 / sparkleCount)}%`,
                bottom: `${3 + (i % 2) * 2}px`,
                width: '2px',
                height: '2px',
                opacity: 0.5 + (i % 2) * 0.25,
                animation: `snowSparkle ${1.5 + (i % 2) * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.35}s`,
                boxShadow: '0 0 3px rgba(255,255,255,0.7)',
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle frost edge */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: `${easedProgress * 2}px`,
          background: 'linear-gradient(to top, rgba(200,220,255,0.25), transparent)',
        }}
      />
    </div>
  );
}
