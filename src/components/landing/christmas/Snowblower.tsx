import { useMemo } from 'react';
import { ANIMATION_TIMING, CHRISTMAS_LAYERS, PARTICLE_CONFIG } from './constants';
import { useChristmasPerformance, scaleParticleCount } from './hooks/useChristmasPerformance';

/**
 * Animated snowblower that clears the snow pile.
 * Features arc particles, mist, exhaust, and ground chunks.
 */
export function Snowblower() {
  const { particleScale, enableComplexEffects, enableShadows, isSmallScreen, isVerySmallScreen } = useChristmasPerformance();

  // Responsive scaling for mobile
  const blowerScale = isVerySmallScreen ? 0.6 : isSmallScreen ? 0.75 : 1;

  // Optimized arc particles with direction variance
  const arcParticles = useMemo(() => {
    const count = scaleParticleCount(PARTICLE_CONFIG.ARC_PARTICLES, particleScale);
    return Array.from({ length: count }, (_, i) => {
      const baseAngle = -20 + (i / count) * 40;
      const variance = (Math.random() - 0.5) * 10; // Add spray variance
      return {
        id: i,
        angle: baseAngle + variance,
        speed: 0.8 + (i % 4) * 0.18,
        size: i % 3 === 0 ? 'large' : i % 3 === 1 ? 'medium' : 'small',
        delay: (i * 0.05) % 0.8,
        offsetY: Math.sin(i * 0.6) * 10,
      };
    });
  }, [particleScale]);

  // Optimized mist particles
  const mistParticles = useMemo(() => {
    const count = scaleParticleCount(PARTICLE_CONFIG.MIST_PARTICLES, particleScale);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 8 + (i % 3) * 18,
      y: -22 + (i % 2) * 10,
      size: 4 + (i % 3) * 3,
      duration: 1.3 + (i % 3) * 0.4,
      delay: i * 0.12,
    }));
  }, [particleScale]);

  // Exhaust puffs
  const exhaustPuffs = useMemo(() => {
    const count = scaleParticleCount(PARTICLE_CONFIG.EXHAUST_PUFFS, particleScale);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: i * 0.4,
      size: 4 + (i % 2) * 2,
    }));
  }, [particleScale]);

  // Optimized ground chunks
  const groundChunks = useMemo(() => {
    const count = scaleParticleCount(PARTICLE_CONFIG.GROUND_CHUNKS, particleScale);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: i % 3 === 0 ? 7 : i % 3 === 1 ? 5 : 3,
      startX: -4 + (i % 4) * 8,
      arcHeight: 22 + (i % 3) * 15,
      arcDistance: 10 + (i % 3) * 8,
      duration: 0.55 + (i % 3) * 0.18,
      delay: (i * 0.08) % 0.5,
      rotation: (i % 2 === 0 ? 1 : -1) * (200 + i * 40),
    }));
  }, [particleScale]);

  const getSizePixels = (size: string) => {
    switch(size) {
      case 'large': return { w: 8, h: 8 };
      case 'medium': return { w: 5, h: 5 };
      default: return { w: 3, h: 3 };
    }
  };

  return (
    <div 
      className="absolute motion-reduce:hidden"
      style={{
        bottom: isSmallScreen ? '8px' : '16px',
        animation: `snowblowerCycle ${ANIMATION_TIMING.CYCLE_DURATION}s linear infinite`,
        willChange: 'transform',
        left: '-120px',
        transform: `translateZ(0) scale(${blowerScale})`,
        transformOrigin: 'bottom left',
        zIndex: CHRISTMAS_LAYERS.SNOWBLOWER,
      }}
      aria-hidden="true"
    >
      <div className="relative" style={{ animation: 'blowerVibrate 0.08s linear infinite' }}>
        
        {/* Ground vibration effect */}
        {enableComplexEffects && (
          <div
            className="absolute"
            style={{
              bottom: '-5px',
              left: '10px',
              width: '60px',
              height: '10px',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%)',
              animation: 'blowerVibrate 0.1s linear infinite',
              filter: 'blur(2px)',
            }}
          />
        )}

        {/* Headlight glow cone */}
        <div 
          className="absolute"
          style={{
            left: '-30px',
            top: '15px',
            width: '60px',
            height: '40px',
            background: 'radial-gradient(ellipse at right, rgba(255, 240, 180, 0.15) 0%, rgba(255, 220, 100, 0.08) 40%, transparent 70%)',
            transform: 'rotate(-5deg)',
            filter: 'blur(4px)',
          }}
        />

        {/* Exhaust puffs */}
        {particleScale > 0 && (
          <div className="absolute" style={{ left: '60px', top: '-8px' }}>
            {exhaustPuffs.map((puff) => (
              <div
                key={`exhaust-${puff.id}`}
                className="absolute rounded-full"
                style={{
                  width: `${puff.size}px`,
                  height: `${puff.size}px`,
                  background: 'radial-gradient(circle, rgba(120, 120, 120, 0.4) 0%, rgba(80, 80, 80, 0.2) 50%, transparent 100%)',
                  animation: 'exhaustPuff 1.6s ease-out infinite',
                  animationDelay: `${puff.delay}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Snow mist - atmospheric powder */}
        {particleScale > 0 && (
          <div className="absolute" style={{ left: '8px', top: '-25px' }}>
            {mistParticles.map((mist) => (
              <div
                key={`mist-${mist.id}`}
                className="absolute rounded-full"
                style={{
                  left: `${mist.x}px`,
                  top: `${mist.y}px`,
                  width: `${mist.size}px`,
                  height: `${mist.size}px`,
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(240, 248, 255, 0.3) 50%, transparent 100%)',
                  filter: 'blur(2px)',
                  animation: `snowMist ${mist.duration}s ease-out infinite`,
                  animationDelay: `${mist.delay}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Main snow arc with spray variance */}
        {particleScale > 0 && (
          <div className="absolute" style={{ left: '18px', top: '-5px' }}>
            {arcParticles.map((particle) => {
              const dims = getSizePixels(particle.size);
              const colorVariant = particle.id % 3 === 0 
                ? 'rgba(255, 255, 255, 0.95)' 
                : particle.id % 3 === 1 
                  ? 'rgba(240, 248, 255, 0.9)' 
                  : 'rgba(250, 252, 255, 0.85)';
              
              return (
                <div
                  key={`arc-${particle.id}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${dims.w}px`,
                    height: `${dims.h}px`,
                    background: colorVariant,
                    boxShadow: particle.size === 'large' && enableShadows
                      ? '0 0 4px rgba(255, 255, 255, 0.6)' 
                      : 'none',
                    animation: `snowArc ${particle.speed}s ease-out infinite`,
                    animationDelay: `${particle.delay}s`,
                    transform: `rotate(${particle.angle}deg)`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Landing splash */}
        {particleScale > 0 && (
          <div className="absolute" style={{ left: '50px', top: '25px' }}>
            {Array.from({ length: scaleParticleCount(4, particleScale) }, (_, i) => (
              <div
                key={`splash-${i}`}
                className="absolute rounded-full bg-white/70"
                style={{
                  width: '3px',
                  height: '3px',
                  animation: 'snowSplash 0.6s ease-out infinite',
                  animationDelay: `${i * 0.15}s`,
                  left: `${i * 12}px`,
                  top: `${(i % 2) * 4}px`,
                }}
              />
            ))}
          </div>
        )}

        {/* Ground chunks container */}
        {particleScale > 0 && (
          <div className="absolute overflow-hidden" style={{ left: '-10px', top: '20px', width: '50px', height: '40px' }}>
            {groundChunks.map((chunk) => (
              <div
                key={`ground-${chunk.id}`}
                className="absolute"
                style={{
                  left: `${chunk.startX + 10}px`,
                  bottom: '5px',
                  width: `${chunk.size}px`,
                  height: `${chunk.size}px`,
                  background: chunk.size > 4 
                    ? 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 40%, rgba(240, 248, 255, 0.7) 100%)'
                    : 'rgba(255, 255, 255, 0.85)',
                  borderRadius: chunk.size > 4 ? '30% 70% 40% 60%' : '50%',
                  boxShadow: chunk.size > 4 && enableShadows ? '0 0 3px rgba(255, 255, 255, 0.5)' : 'none',
                  animation: `groundChunkFly ${chunk.duration}s ease-out infinite`,
                  animationDelay: `${chunk.delay}s`,
                  ['--chunk-height' as string]: `${chunk.arcHeight}px`,
                  ['--chunk-distance' as string]: `${chunk.arcDistance}px`,
                  ['--chunk-rotation' as string]: `${chunk.rotation}deg`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Snowblower machine */}
        <svg 
          width="80" 
          height="50" 
          viewBox="0 0 80 50" 
          className={enableShadows ? 'drop-shadow-lg' : ''} 
          style={{ position: 'relative', zIndex: 10 }}
        >
          <defs>
            <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
          
          <rect x="20" y="15" width="45" height="25" rx="3" fill="url(#bodyGradient)" stroke="#991b1b" strokeWidth="1" />
          <rect x="45" y="10" width="18" height="15" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="1" />
          <rect x="60" y="5" width="4" height="8" fill="#374151" />
          <ellipse cx="62" cy="4" rx="3" ry="2" fill="#6b7280" />
          <path d="M55 15 L65 0 L70 0 L70 5 L60 15" fill="#4b5563" stroke="#374151" strokeWidth="1" />
          <rect x="67" y="0" width="8" height="6" rx="2" fill="#1f2937" />
          <path d="M5 20 Q0 20 0 30 Q0 40 5 40 L20 40 L20 20 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
          
          {/* Spinning auger */}
          <g style={{ transformOrigin: '12px 30px', animation: 'augerSpin 0.1s linear infinite' }}>
            <ellipse cx="12" cy="30" rx="10" ry="8" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <path d="M2 30 L22 30 M12 22 L12 38" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <path d="M5 24 L19 36 M19 24 L5 36" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          <path d="M8 20 L8 5 Q8 0 15 0 L25 0 Q30 0 28 8 L20 20" fill="#b91c1c" stroke="#991b1b" strokeWidth="1" />
          <ellipse cx="18" cy="0" rx="8" ry="4" fill="#dc2626" />
          
          {/* Wheels */}
          <g style={{ transformOrigin: '30px 42px', animation: 'wheelSpin 0.3s linear infinite' }}>
            <circle cx="30" cy="42" r="8" fill="#1f2937" stroke="#111827" strokeWidth="2" />
            <circle cx="30" cy="42" r="3" fill="#374151" />
            <path d="M24 38 L24 46 M30 35 L30 49 M36 38 L36 46" stroke="#4b5563" strokeWidth="1" />
          </g>
          <g style={{ transformOrigin: '55px 42px', animation: 'wheelSpin 0.3s linear infinite' }}>
            <circle cx="55" cy="42" r="8" fill="#1f2937" stroke="#111827" strokeWidth="2" />
            <circle cx="55" cy="42" r="3" fill="#374151" />
            <path d="M49 38 L49 46 M55 35 L55 49 M61 38 L61 46" stroke="#4b5563" strokeWidth="1" />
          </g>
          
          {/* Headlight with subtle flicker */}
          <g style={{ animation: 'headlightFlicker 2s ease-in-out infinite' }}>
            <circle cx="18" cy="25" r="4" fill="url(#headlightGlow)" />
            <circle cx="18" cy="25" r="2" fill="#fef9c3" />
          </g>
        </svg>
      </div>
    </div>
  );
}
