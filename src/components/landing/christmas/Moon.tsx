import { CHRISTMAS_LAYERS } from './constants';
import { useChristmasPerformance } from './hooks/useChristmasPerformance';

/**
 * Subtle moon glow component for peaceful night atmosphere.
 * Mobile-first optimized with reduced glow layers on smaller devices.
 */
export function Moon() {
  const { 
    isSmallScreen, 
    isVerySmallScreen, 
    enable3DTransforms, 
    enableComplexEffects,
    deviceTier,
  } = useChristmasPerformance();
  
  // Responsive scaling
  const scale = isVerySmallScreen ? 0.4 : isSmallScreen ? 0.6 : 1;
  const rightPosition = isVerySmallScreen ? '5%' : isSmallScreen ? '8%' : '12%';
  const topPosition = isVerySmallScreen ? '5%' : isSmallScreen ? '6%' : '8%';
  
  // Depth positioning - simplified on mobile
  const translateZ = enable3DTransforms ? -450 : 0;
  
  // Simplified glow on mobile
  const isSimplified = deviceTier !== 'high';
  
  return (
    <div
      className="absolute motion-reduce:opacity-50"
      style={{
        top: topPosition,
        right: rightPosition,
        zIndex: CHRISTMAS_LAYERS.MOON,
        transform: `scale(${scale}) translateZ(${translateZ}px)`,
        transformOrigin: 'top right',
      }}
      aria-hidden="true"
    >
      {/* Outer glow - only on desktop */}
      {enableComplexEffects && !isSimplified && (
        <div
          className="absolute rounded-full"
          style={{
            width: '120px',
            height: '120px',
            top: '-35px',
            left: '-35px',
            background: 'radial-gradient(circle, rgba(220, 230, 255, 0.08) 0%, rgba(200, 215, 255, 0.03) 50%, transparent 70%)',
            filter: 'blur(12px)',
          }}
        />
      )}
      
      {/* Inner glow halo */}
      <div
        className="absolute rounded-full"
        style={{
          width: isSimplified ? '60px' : '80px',
          height: isSimplified ? '60px' : '80px',
          top: isSimplified ? '-5px' : '-15px',
          left: isSimplified ? '-5px' : '-15px',
          background: 'radial-gradient(circle, rgba(230, 240, 255, 0.1) 0%, rgba(210, 225, 255, 0.04) 60%, transparent 80%)',
          filter: isSimplified ? 'blur(4px)' : 'blur(6px)',
          animation: isSimplified ? undefined : 'moonPulse 8s ease-in-out infinite',
        }}
      />
      
      {/* Moon surface */}
      <div
        className="relative rounded-full"
        style={{
          width: '50px',
          height: '50px',
          background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 250, 0.95) 0%, rgba(230, 235, 245, 0.85) 40%, rgba(200, 210, 230, 0.75) 100%)',
          boxShadow: isSimplified 
            ? '0 0 15px rgba(220, 235, 255, 0.3), inset -6px -4px 12px rgba(180, 190, 210, 0.3)'
            : '0 0 20px rgba(220, 235, 255, 0.35), 0 0 40px rgba(200, 220, 255, 0.15), inset -8px -6px 15px rgba(180, 190, 210, 0.35)',
        }}
      >
        {/* Crater details - simplified on mobile */}
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: '8px',
            height: '8px',
            top: '30%',
            left: '25%',
            background: 'rgba(180, 185, 200, 0.5)',
          }}
        />
        {!isSimplified && (
          <>
            <div
              className="absolute rounded-full opacity-15"
              style={{
                width: '5px',
                height: '5px',
                top: '55%',
                left: '50%',
                background: 'rgba(180, 185, 200, 0.5)',
              }}
            />
            <div
              className="absolute rounded-full opacity-10"
              style={{
                width: '12px',
                height: '12px',
                top: '20%',
                left: '55%',
                background: 'rgba(180, 185, 200, 0.4)',
                filter: 'blur(1px)',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
