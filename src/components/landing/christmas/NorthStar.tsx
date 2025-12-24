import { useMemo } from 'react';
import { CHRISTMAS_LAYERS, PARTICLE_CONFIG } from './constants';
import { useChristmasPerformance, scaleParticleCount } from './hooks/useChristmasPerformance';

/**
 * Majestic golden glowing North Star with ethereal light beam,
 * orbiting sparkles, and rotating rays.
 * Enhanced with depth positioning for 3D consistency.
 */
export function NorthStar() {
  const { 
    particleScale, 
    enableComplexEffects, 
    isSmallScreen, 
    isVerySmallScreen,
    enable3DTransforms,
    enableBlur,
    enableAtmosphericEffects,
  } = useChristmasPerformance();

  // Responsive scaling for small screens
  const containerScale = isVerySmallScreen ? 0.5 : isSmallScreen ? 0.7 : 1;
  const containerSize = isVerySmallScreen ? 100 : isSmallScreen ? 140 : 200;
  
  // Depth positioning - North Star is in mid-ground (closer than moon, further than snow)
  const translateZ = enable3DTransforms ? -250 : 0;
  const depthBlur = enableBlur ? 0.5 : 0;
  
  // Subtle atmospheric color shift (less than moon since it's closer)
  const atmosphericGold = enableAtmosphericEffects 
    ? 'hsla(48, 95%, 72%, 1)'  // Slightly cooler gold
    : 'hsla(45, 100%, 70%, 1)'; // Pure warm gold
  
  const atmosphericGoldLight = enableAtmosphericEffects
    ? 'hsla(50, 90%, 85%, 1)'
    : 'hsla(45, 100%, 85%, 1)';

  // Generate orbiting sparkle particles
  const sparkles = useMemo(() => {
    const count = scaleParticleCount(PARTICLE_CONFIG.STAR_SPARKLES, particleScale);
    const radiusScale = isSmallScreen ? 0.7 : 1;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: i * (360 / count),
      delay: i * 0.3,
      size: 2 + (i % 3),
      orbitRadius: (35 + (i % 3) * 10) * radiusScale,
    }));
  }, [particleScale, isSmallScreen]);

  // Light ray beams - reduce on small screens
  const rays = useMemo(() => {
    const baseCount = isSmallScreen ? Math.ceil(PARTICLE_CONFIG.STAR_RAYS * 0.6) : PARTICLE_CONFIG.STAR_RAYS;
    const count = scaleParticleCount(baseCount, particleScale);
    const lengthScale = isSmallScreen ? 0.6 : 1;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      rotation: i * (360 / count),
      length: (i % 2 === 0 ? 120 : 80) * lengthScale,
      width: i % 3 === 0 ? 3 : 2,
      delay: i * 0.15,
    }));
  }, [particleScale, isSmallScreen]);

  return (
    <div 
      className="absolute motion-reduce:hidden"
      style={{
        top: isVerySmallScreen ? '12%' : isSmallScreen ? '10%' : '6%',
        left: '50%',
        transform: `translateX(-50%) scale(${containerScale}) translateZ(${translateZ}px)`,
        transformOrigin: 'top center',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        zIndex: CHRISTMAS_LAYERS.NORTH_STAR,
        filter: depthBlur > 0 ? `blur(${depthBlur}px)` : undefined,
      }}
      aria-hidden="true"
    >
      {/* Downward light beam - nativity style */}
      {enableComplexEffects && (
        <div
          className="absolute"
          style={{
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '200px',
            background: `linear-gradient(180deg, ${atmosphericGoldLight.replace('1)', '0.25)')}, ${atmosphericGold.replace('1)', '0.08)')} 40%, transparent 100%)`,
            clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(8px)',
            animation: 'northStarBeam 4s ease-in-out infinite',
          }}
        />
      )}

      {/* Deep outer glow with atmospheric tint */}
      {enableAtmosphericEffects && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, hsla(200, 40%, 80%, 0.06) 0%, transparent 60%)',
            transform: 'scale(3.5)',
            animation: 'northStarPulse 6s ease-in-out infinite 1s',
          }}
        />
      )}

      {/* Outer ethereal glow haze */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${atmosphericGold.replace('1)', '0.15)')}, ${atmosphericGold.replace('1)', '0.05)')} 40%, transparent 70%)`,
          transform: 'scale(2.5)',
          animation: 'northStarPulse 4s ease-in-out infinite',
        }}
      />

      {/* Middle warm golden glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${atmosphericGold.replace('1)', '0.3)')}, hsla(40, 90%, 55%, 0.1) 35%, transparent 60%)`,
          transform: 'scale(1.8)',
          animation: 'northStarPulse 3s ease-in-out infinite 0.5s',
        }}
      />

      {/* Rotating light rays container */}
      {enableComplexEffects && (
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
                background: `linear-gradient(to top, ${atmosphericGoldLight.replace('1)', '0.6)')}, ${atmosphericGoldLight.replace('1)', '0)')} 100%)`,
                transform: `rotate(${ray.rotation}deg) translateY(-${ray.length / 2}px)`,
                transformOrigin: 'bottom center',
                animation: `northStarFlare 2s ease-in-out infinite ${ray.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Four-point star shape - elongated vertical */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 100 140"
          className="w-16 h-24"
          style={{
            filter: `drop-shadow(0 0 10px ${atmosphericGold.replace('1)', '0.9)')}) drop-shadow(0 0 25px ${atmosphericGold.replace('1)', '0.6)')}) drop-shadow(0 0 40px ${atmosphericGold.replace('1)', '0.3)')})`,
            animation: 'northStarPulse 2.5s ease-in-out infinite',
          }}
        >
          {/* Main star shape */}
          <defs>
            <radialGradient id="starCoreDepth" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsla(45, 100%, 98%, 1)" />
              <stop offset="30%" stopColor={atmosphericGoldLight} />
              <stop offset="60%" stopColor={atmosphericGold} />
              <stop offset="100%" stopColor="hsla(40, 95%, 55%, 0.8)" />
            </radialGradient>
            <linearGradient id="verticalRayDepth" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={atmosphericGoldLight.replace('1)', '0.9)')} />
              <stop offset="50%" stopColor={atmosphericGoldLight} />
              <stop offset="100%" stopColor={atmosphericGoldLight.replace('1)', '0.9)')} />
            </linearGradient>
            <linearGradient id="horizontalRayDepth" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor={atmosphericGoldLight.replace('1)', '0.5)')} />
              <stop offset="50%" stopColor={atmosphericGoldLight} />
              <stop offset="100%" stopColor={atmosphericGoldLight.replace('1)', '0.5)')} />
            </linearGradient>
          </defs>
          
          {/* Elongated vertical ray */}
          <path
            d="M50 0 L54 55 L50 70 L46 55 Z"
            fill="url(#verticalRayDepth)"
          />
          <path
            d="M50 140 L54 85 L50 70 L46 85 Z"
            fill="url(#verticalRayDepth)"
          />
          
          {/* Horizontal rays */}
          <path
            d="M0 70 L45 66 L50 70 L45 74 Z"
            fill="url(#horizontalRayDepth)"
          />
          <path
            d="M100 70 L55 66 L50 70 L55 74 Z"
            fill="url(#horizontalRayDepth)"
          />
          
          {/* Center core */}
          <circle cx="50" cy="70" r="8" fill="url(#starCoreDepth)" />
          
          {/* Inner bright core */}
          <circle cx="50" cy="70" r="4" fill="hsla(45, 100%, 98%, 1)" />
        </svg>
      </div>

      {/* Lens flare - horizontal streak */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180px',
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${atmosphericGold.replace('1)', '0.3)')} 20%, ${atmosphericGoldLight.replace('1)', '0.6)')} 50%, ${atmosphericGold.replace('1)', '0.3)')} 80%, transparent 100%)`,
          animation: 'northStarFlare 3s ease-in-out infinite',
        }}
      />

      {/* Lens flare - vertical streak (shorter) */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '2px',
          height: '100px',
          background: `linear-gradient(180deg, transparent 0%, ${atmosphericGold.replace('1)', '0.2)')} 20%, ${atmosphericGoldLight.replace('1)', '0.4)')} 50%, ${atmosphericGold.replace('1)', '0.2)')} 80%, transparent 100%)`,
          animation: 'northStarFlare 3s ease-in-out infinite 0.3s',
        }}
      />

      {/* Orbiting sparkle particles */}
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
              background: `radial-gradient(circle, hsla(45, 100%, 95%, 1) 0%, ${atmosphericGold.replace('1)', '0.5)')} 50%, transparent 100%)`,
              boxShadow: `0 0 4px ${atmosphericGold.replace('1)', '0.8)')}`,
            }}
          />
        </div>
      ))}

      {/* Twinkling secondary stars around main star - varied timing for organic feel */}
      {[
        { x: -60, y: -30, size: 3, delay: 0, duration: 2.8 },
        { x: 65, y: -25, size: 2.5, delay: 0.7, duration: 3.2 },
        { x: -45, y: 50, size: 2, delay: 1.3, duration: 2.5 },
        { x: 55, y: 45, size: 2.5, delay: 2.1, duration: 3.5 },
        { x: 0, y: -55, size: 2, delay: 2.8, duration: 2.9 },
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
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: atmosphericGold }} className="w-full h-full drop-shadow-[0_0_3px_hsla(45,100%,70%,0.8)]">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
