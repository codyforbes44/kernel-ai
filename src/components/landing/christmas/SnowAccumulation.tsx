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
 * Gentle snow accumulation effect that builds up at the bottom of the screen over time.
 * Creates an organic, uneven snow pile appearance.
 */
export function SnowAccumulation() {
  const { prefersReducedMotion, isSmallScreen } = useChristmasPerformance();
  const [progress, setProgress] = useState(0);

  // Gradually build up snow over 30 seconds
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }

    const duration = 30000; // 30 seconds to full accumulation
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

  // Generate snow drift shapes for organic appearance
  const drifts = useMemo<SnowDrift[]>(() => {
    const count = isSmallScreen ? 8 : 12;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (i / count) * 100 - 5,
      width: 15 + (i % 3) * 8,
      maxHeight: 20 + (i % 5) * 10 + Math.sin(i * 0.8) * 8,
      delay: i * 0.15,
    }));
  }, [isSmallScreen]);

  // Easing function for natural build-up
  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
  const easedProgress = easeOutQuart(progress);

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
          height: `${easedProgress * 25}px`,
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
              background: 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0) 100%)',
              borderRadius: '50% 50% 0 0',
              filter: 'blur(1px)',
              transform: 'translateZ(0)',
            }}
          />
        );
      })}

      {/* Sparkle highlights on snow */}
      {easedProgress > 0.3 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          {[...Array(isSmallScreen ? 4 : 8)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                left: `${10 + i * (isSmallScreen ? 22 : 11)}%`,
                bottom: `${4 + (i % 3) * 3}px`,
                width: '2px',
                height: '2px',
                opacity: 0.6 + (i % 2) * 0.3,
                animation: `snowSparkle ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                boxShadow: '0 0 4px 1px rgba(255,255,255,0.8)',
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle frost edge */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: `${easedProgress * 3}px`,
          background: 'linear-gradient(to top, rgba(200,220,255,0.3), transparent)',
        }}
      />
    </div>
  );
}