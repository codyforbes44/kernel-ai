import { useMemo } from 'react';
import { CHRISTMAS_LAYERS, PARTICLE_CONFIG, MOBILE_CONFIG } from './constants';
import { useChristmasPerformance, scaleParticleCount } from './hooks/useChristmasPerformance';

/**
 * Majestic golden glowing North Star.
 * Mobile-first optimized with simplified effects on smaller devices.
 */
export function NorthStar() {
  const { 
    particleScale, 
    enableComplexEffects, 
    isSmallScreen, 
    isVerySmallScreen,
    enable3DTransforms,
    deviceTier,
  } = useChristmasPerformance();

  // Responsive scaling
  const containerScale = isVerySmallScreen ? 0.45 : isSmallScreen ? 0.65 : 1;
  const containerSize = isVerySmallScreen ? 80 : isSmallScreen ? 120 : 180;
  
  // Depth positioning
  const translateZ = enable3DTransforms ? -250 : 0;
  
  // Simplified mode for mobile/low-end
  const isSimplified = deviceTier !== 'high';
  const config = isSmallScreen ? MOBILE_CONFIG : PARTICLE_CONFIG;

  // Generate orbiting sparkle particles - fewer on mobile
  const sparkles = useMemo(() => {
    if (isSimplified) return []; // No sparkles on mobile
    const count = scaleParticleCount(config.STAR_SPARKLES, particleScale);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: i * (360 / count),
      delay: i * 0.4,
      size: 2 + (i % 2),
      orbitRadius: 30 + (i % 2) * 8,
    }));
  }, [particleScale, isSimplified, config.STAR_SPARKLES]);

  // Light ray beams - disabled on mobile
  const rays = useMemo(() => {
    if (isSimplified) return [];
    const count = scaleParticleCount(config.STAR_RAYS, particleScale);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      rotation: i * (360 / count),
      length: i % 2 === 0 ? 100 : 70,
      width: 2,
      delay: i * 0.15,
    }));
  }, [particleScale, isSimplified, config.STAR_RAYS]);

  return (
    <div 
      className="absolute motion-reduce:hidden"
      style={{
        top: isVerySmallScreen ? '14%' : isSmallScreen ? '12%' : '6%',
        left: '50%',
        transform: `translateX(-50%) scale(${containerScale}) translateZ(${translateZ}px)`,
        transformOrigin: 'top center',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        zIndex: CHRISTMAS_LAYERS.NORTH_STAR,
      }}
      aria-hidden="true"
    >
      {/* Downward light beam - desktop only */}
      {enableComplexEffects && !isSimplified && (
        <div
          className="absolute"
          style={{
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '50px',
            height: '150px',
            background: 'linear-gradient(180deg, hsla(45, 100%, 85%, 0.2), hsla(45, 100%, 70%, 0.06) 40%, transparent 100%)',
            clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(6px)',
            animation: 'northStarBeam 4s ease-in-out infinite',
          }}
        />
      )}

      {/* Outer glow - simplified on mobile */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, hsla(45, 100%, 70%, 0.12), hsla(45, 100%, 70%, 0.04) 40%, transparent 70%)',
          transform: isSimplified ? 'scale(2)' : 'scale(2.2)',
          animation: isSimplified ? undefined : 'northStarPulse 4s ease-in-out infinite',
        }}
      />

      {/* Middle glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, hsla(45, 100%, 70%, 0.25), hsla(40, 90%, 55%, 0.08) 40%, transparent 60%)',
          transform: 'scale(1.6)',
          animation: isSimplified ? undefined : 'northStarPulse 3s ease-in-out infinite 0.5s',
        }}
      />

      {/* Rotating light rays - desktop only */}
      {rays.length > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: 'northStarRays 25s linear infinite',
          }}
        >
          {rays.map((ray) => (
            <div
              key={ray.id}
              className="absolute"
              style={{
                width: `${ray.width}px`,
                height: `${ray.length}px`,
                background: 'linear-gradient(to top, hsla(45, 100%, 85%, 0.5), transparent 100%)',
                transform: `rotate(${ray.rotation}deg) translateY(-${ray.length / 2}px)`,
                transformOrigin: 'bottom center',
                animation: `northStarFlare 2s ease-in-out infinite ${ray.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Four-point star shape */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 100 140"
          className={isSimplified ? 'w-10 h-14' : 'w-14 h-20'}
          style={{
            filter: isSimplified 
              ? 'drop-shadow(0 0 8px hsla(45, 100%, 70%, 0.8))'
              : 'drop-shadow(0 0 10px hsla(45, 100%, 70%, 0.9)) drop-shadow(0 0 20px hsla(45, 100%, 70%, 0.5))',
            animation: isSimplified ? undefined : 'northStarPulse 2.5s ease-in-out infinite',
          }}
        >
          <defs>
            <radialGradient id="starCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsla(45, 100%, 98%, 1)" />
              <stop offset="30%" stopColor="hsla(45, 100%, 85%, 1)" />
              <stop offset="60%" stopColor="hsla(45, 100%, 70%, 1)" />
              <stop offset="100%" stopColor="hsla(40, 95%, 55%, 0.8)" />
            </radialGradient>
            <linearGradient id="verticalRay" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="hsla(45, 100%, 85%, 0.8)" />
              <stop offset="50%" stopColor="hsla(45, 100%, 85%, 1)" />
              <stop offset="100%" stopColor="hsla(45, 100%, 85%, 0.8)" />
            </linearGradient>
            <linearGradient id="horizontalRay" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="hsla(45, 100%, 85%, 0.4)" />
              <stop offset="50%" stopColor="hsla(45, 100%, 85%, 1)" />
              <stop offset="100%" stopColor="hsla(45, 100%, 85%, 0.4)" />
            </linearGradient>
          </defs>
          
          {/* Elongated vertical rays */}
          <path d="M50 0 L54 55 L50 70 L46 55 Z" fill="url(#verticalRay)" />
          <path d="M50 140 L54 85 L50 70 L46 85 Z" fill="url(#verticalRay)" />
          
          {/* Horizontal rays */}
          <path d="M0 70 L45 66 L50 70 L45 74 Z" fill="url(#horizontalRay)" />
          <path d="M100 70 L55 66 L50 70 L55 74 Z" fill="url(#horizontalRay)" />
          
          {/* Center core */}
          <circle cx="50" cy="70" r="7" fill="url(#starCore)" />
          <circle cx="50" cy="70" r="3" fill="hsla(45, 100%, 98%, 1)" />
        </svg>
      </div>

      {/* Lens flare - simplified on mobile */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isSimplified ? '120px' : '160px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, hsla(45, 100%, 70%, 0.25) 20%, hsla(45, 100%, 85%, 0.5) 50%, hsla(45, 100%, 70%, 0.25) 80%, transparent 100%)',
          animation: isSimplified ? undefined : 'northStarFlare 3s ease-in-out infinite',
        }}
      />

      {/* Orbiting sparkle particles - desktop only */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            transform: `translate(-50%, -50%) rotate(${sparkle.angle}deg) translateY(-${sparkle.orbitRadius}px)`,
            animation: `northStarSparkle 4s ease-in-out infinite ${sparkle.delay}s`,
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, hsla(45, 100%, 95%, 1) 0%, hsla(45, 100%, 70%, 0.4) 50%, transparent 100%)',
              boxShadow: '0 0 3px hsla(45, 100%, 70%, 0.7)',
            }}
          />
        </div>
      ))}

      {/* Secondary stars - fewer on mobile */}
      {!isVerySmallScreen && [
        { x: -50, y: -25, size: 2.5, delay: 0, duration: 2.8 },
        { x: 55, y: -20, size: 2, delay: 0.7, duration: 3.2 },
        { x: -40, y: 40, size: 1.8, delay: 1.3, duration: 2.5 },
      ].map((star, i) => (
        <div
          key={`secondary-${i}`}
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `${star.size}px`,
            height: `${star.size}px`,
            transform: `translate(calc(-50% + ${star.x}px), calc(-50% + ${star.y}px))`,
            animation: `twinkle ${star.duration}s cubic-bezier(0.4, 0, 0.6, 1) infinite ${star.delay}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="hsla(45, 100%, 70%, 1)" className="w-full h-full drop-shadow-[0_0_2px_hsla(45,100%,70%,0.7)]">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
