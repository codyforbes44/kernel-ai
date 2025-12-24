import { useMemo } from 'react';
import { CHRISTMAS_LAYERS } from './constants';
import { useChristmasPerformance } from './hooks/useChristmasPerformance';

/**
 * Aurora Borealis effect with subtle green and purple waves
 * Positioned behind all other scene elements
 */
export function Aurora() {
  const { enableComplexEffects } = useChristmasPerformance();

  // Generate aurora wave layers
  const waves = useMemo(() => [
    {
      id: 0,
      gradient: 'linear-gradient(180deg, transparent 0%, hsla(160, 80%, 45%, 0.12) 30%, hsla(140, 70%, 50%, 0.08) 60%, transparent 100%)',
      animation: 'auroraWave1 12s ease-in-out infinite',
      height: '45%',
      top: '5%',
      blur: 40,
    },
    {
      id: 1,
      gradient: 'linear-gradient(180deg, transparent 0%, hsla(280, 60%, 50%, 0.08) 40%, hsla(260, 70%, 45%, 0.06) 70%, transparent 100%)',
      animation: 'auroraWave2 15s ease-in-out infinite',
      height: '40%',
      top: '10%',
      blur: 50,
    },
    {
      id: 2,
      gradient: 'linear-gradient(180deg, transparent 0%, hsla(150, 75%, 40%, 0.1) 35%, hsla(170, 80%, 45%, 0.05) 65%, transparent 100%)',
      animation: 'auroraShift 18s ease-in-out infinite',
      height: '35%',
      top: '8%',
      blur: 35,
    },
    {
      id: 3,
      gradient: 'linear-gradient(180deg, transparent 0%, hsla(290, 55%, 45%, 0.06) 45%, hsla(320, 50%, 40%, 0.04) 75%, transparent 100%)',
      animation: 'auroraWave1 20s ease-in-out infinite reverse',
      height: '30%',
      top: '12%',
      blur: 45,
    },
  ], []);

  // Vertical light curtains for more dynamic effect
  const curtains = useMemo(() => {
    if (!enableComplexEffects) return [];
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: 10 + i * 20,
      width: 8 + (i % 3) * 4,
      opacity: 0.03 + (i % 2) * 0.02,
      delay: i * 2,
      duration: 8 + i * 2,
      color: i % 2 === 0 ? 'hsla(150, 70%, 50%, 0.15)' : 'hsla(280, 60%, 50%, 0.12)',
    }));
  }, [enableComplexEffects]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden motion-reduce:hidden"
      style={{ zIndex: CHRISTMAS_LAYERS.AURORA }}
      aria-hidden="true"
    >
      {/* Main aurora wave layers */}
      {waves.map((wave) => (
        <div
          key={wave.id}
          className="absolute inset-x-0"
          style={{
            top: wave.top,
            height: wave.height,
            background: wave.gradient,
            filter: `blur(${wave.blur}px)`,
            animation: wave.animation,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          }}
        />
      ))}

      {/* Vertical light curtains for depth */}
      {curtains.map((curtain) => (
        <div
          key={`curtain-${curtain.id}`}
          className="absolute"
          style={{
            left: `${curtain.left}%`,
            top: '0',
            width: `${curtain.width}%`,
            height: '50%',
            background: `linear-gradient(180deg, ${curtain.color} 0%, transparent 100%)`,
            filter: 'blur(30px)',
            opacity: curtain.opacity,
            animation: `auroraCurtain ${curtain.duration}s ease-in-out infinite`,
            animationDelay: `${curtain.delay}s`,
          }}
        />
      ))}

      {/* Subtle shimmer overlay */}
      {enableComplexEffects && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 40% at 50% 20%, hsla(160, 70%, 50%, 0.03) 0%, transparent 50%)',
            animation: 'auroraShimmer 6s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}
