import { CHRISTMAS_LAYERS } from './constants';
import { useChristmasPerformance } from './hooks/useChristmasPerformance';

/**
 * Subtle moon glow component for peaceful night atmosphere.
 * Positioned in the upper corner with soft ambient glow.
 * Enhanced with depth positioning and atmospheric blue tint.
 */
export function Moon() {
  const { isSmallScreen, isVerySmallScreen, enable3DTransforms, enableBlur, enableAtmosphericEffects } = useChristmasPerformance();
  
  // Responsive scaling
  const scale = isVerySmallScreen ? 0.35 : isSmallScreen ? 0.55 : 1;
  const rightPosition = isVerySmallScreen ? '4%' : isSmallScreen ? '6%' : '12%';
  const topPosition = isVerySmallScreen ? '4%' : isSmallScreen ? '6%' : '8%';
  
  // Depth positioning - moon is far in background
  const translateZ = enable3DTransforms ? -450 : 0;
  const depthBlur = enableBlur ? 2 : 0;
  
  // Atmospheric blue tint for distant objects
  const atmosphericTint = enableAtmosphericEffects ? {
    moonSurface: 'radial-gradient(circle at 35% 35%, rgba(235, 240, 255, 0.92) 0%, rgba(210, 220, 245, 0.85) 40%, rgba(180, 195, 230, 0.75) 100%)',
    innerGlow: 'rgba(200, 215, 255, 0.12)',
    outerGlow: 'rgba(190, 210, 255, 0.08)',
    craterTint: 'rgba(160, 175, 210, 0.5)',
  } : {
    moonSurface: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 250, 0.95) 0%, rgba(230, 235, 245, 0.85) 40%, rgba(200, 210, 230, 0.75) 100%)',
    innerGlow: 'rgba(230, 240, 255, 0.12)',
    outerGlow: 'rgba(220, 230, 255, 0.08)',
    craterTint: 'rgba(180, 185, 200, 0.5)',
  };
  
  return (
    <div
      className="absolute motion-reduce:opacity-50"
      style={{
        top: topPosition,
        right: rightPosition,
        zIndex: CHRISTMAS_LAYERS.MOON,
        transform: `scale(${scale}) translateZ(${translateZ}px)`,
        transformOrigin: 'top right',
        filter: depthBlur > 0 ? `blur(${depthBlur}px)` : undefined,
      }}
      aria-hidden="true"
    >
      {/* Deep outer atmospheric haze - enhanced for depth */}
      <div
        className="absolute rounded-full"
        style={{
          width: '160px',
          height: '160px',
          top: '-55px',
          left: '-55px',
          background: `radial-gradient(circle, ${atmosphericTint.outerGlow} 0%, rgba(180, 200, 255, 0.02) 50%, transparent 75%)`,
          filter: 'blur(20px)',
          animation: 'moonPulse 12s ease-in-out infinite',
        }}
      />
      
      {/* Outer ambient glow with blue tint */}
      <div
        className="absolute rounded-full"
        style={{
          width: '120px',
          height: '120px',
          top: '-35px',
          left: '-35px',
          background: `radial-gradient(circle, rgba(200, 220, 255, 0.1) 0%, rgba(180, 200, 255, 0.04) 40%, transparent 70%)`,
          filter: 'blur(15px)',
        }}
      />
      
      {/* Middle glow halo with atmospheric color */}
      <div
        className="absolute rounded-full"
        style={{
          width: '80px',
          height: '80px',
          top: '-15px',
          left: '-15px',
          background: `radial-gradient(circle, ${atmosphericTint.innerGlow} 0%, rgba(190, 210, 255, 0.05) 50%, transparent 70%)`,
          filter: 'blur(8px)',
          animation: 'moonPulse 8s ease-in-out infinite',
        }}
      />
      
      {/* Moon surface with blue atmospheric tint */}
      <div
        className="relative rounded-full"
        style={{
          width: '50px',
          height: '50px',
          background: atmosphericTint.moonSurface,
          boxShadow: `
            0 0 25px rgba(200, 220, 255, 0.35),
            0 0 50px rgba(180, 205, 255, 0.18),
            0 0 80px rgba(170, 195, 255, 0.08),
            inset -8px -6px 15px rgba(160, 175, 210, 0.35)
          `,
        }}
      >
        {/* Subtle crater details with atmospheric tint */}
        <div
          className="absolute rounded-full opacity-25"
          style={{
            width: '8px',
            height: '8px',
            top: '30%',
            left: '25%',
            background: atmosphericTint.craterTint,
            filter: 'blur(1px)',
          }}
        />
        <div
          className="absolute rounded-full opacity-18"
          style={{
            width: '5px',
            height: '5px',
            top: '55%',
            left: '50%',
            background: atmosphericTint.craterTint,
            filter: 'blur(1px)',
          }}
        />
        <div
          className="absolute rounded-full opacity-12"
          style={{
            width: '12px',
            height: '12px',
            top: '20%',
            left: '55%',
            background: atmosphericTint.craterTint,
            filter: 'blur(2px)',
          }}
        />
        {/* Additional subtle maria (dark regions) */}
        <div
          className="absolute rounded-full opacity-8"
          style={{
            width: '15px',
            height: '10px',
            top: '40%',
            left: '30%',
            background: 'rgba(150, 165, 195, 0.3)',
            filter: 'blur(3px)',
            borderRadius: '50%',
          }}
        />
      </div>
      
      {/* Earthshine effect - subtle illumination on dark side */}
      {enableAtmosphericEffects && (
        <div
          className="absolute rounded-full"
          style={{
            width: '50px',
            height: '50px',
            top: 0,
            left: 0,
            background: 'radial-gradient(circle at 75% 70%, transparent 40%, rgba(180, 200, 230, 0.08) 70%, transparent 90%)',
          }}
        />
      )}
    </div>
  );
}
