import { CHRISTMAS_LAYERS } from './constants';
import { useChristmasPerformance } from './hooks/useChristmasPerformance';

/**
 * Subtle moon glow component for peaceful night atmosphere.
 * Positioned in the upper corner with soft ambient glow.
 * Responsive: scales down on small screens.
 */
export function Moon() {
  const { isSmallScreen, isVerySmallScreen } = useChristmasPerformance();
  
  // Responsive scaling
  const scale = isVerySmallScreen ? 0.35 : isSmallScreen ? 0.55 : 1;
  const rightPosition = isVerySmallScreen ? '4%' : isSmallScreen ? '6%' : '12%';
  const topPosition = isVerySmallScreen ? '4%' : isSmallScreen ? '6%' : '8%';
  
  return (
    <div
      className="absolute motion-reduce:opacity-50"
      style={{
        top: topPosition,
        right: rightPosition,
        zIndex: CHRISTMAS_LAYERS.STARS,
        transform: `scale(${scale})`,
        transformOrigin: 'top right',
      }}
      aria-hidden="true"
    >
      {/* Outer ambient glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: '120px',
          height: '120px',
          top: '-35px',
          left: '-35px',
          background: 'radial-gradient(circle, rgba(220, 230, 255, 0.08) 0%, rgba(200, 215, 255, 0.03) 40%, transparent 70%)',
          filter: 'blur(15px)',
        }}
      />
      
      {/* Middle glow halo */}
      <div
        className="absolute rounded-full"
        style={{
          width: '80px',
          height: '80px',
          top: '-15px',
          left: '-15px',
          background: 'radial-gradient(circle, rgba(230, 240, 255, 0.12) 0%, rgba(210, 225, 255, 0.05) 50%, transparent 70%)',
          filter: 'blur(8px)',
          animation: 'moonPulse 8s ease-in-out infinite',
        }}
      />
      
      {/* Moon surface */}
      <div
        className="relative rounded-full"
        style={{
          width: '50px',
          height: '50px',
          background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 250, 0.95) 0%, rgba(230, 235, 245, 0.85) 40%, rgba(200, 210, 230, 0.75) 100%)',
          boxShadow: `
            0 0 20px rgba(220, 230, 255, 0.3),
            0 0 40px rgba(200, 215, 255, 0.15),
            inset -8px -6px 15px rgba(180, 190, 210, 0.3)
          `,
        }}
      >
        {/* Subtle crater details */}
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: '8px',
            height: '8px',
            top: '30%',
            left: '25%',
            background: 'rgba(180, 185, 200, 0.5)',
            filter: 'blur(1px)',
          }}
        />
        <div
          className="absolute rounded-full opacity-15"
          style={{
            width: '5px',
            height: '5px',
            top: '55%',
            left: '50%',
            background: 'rgba(180, 185, 200, 0.5)',
            filter: 'blur(1px)',
          }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: '12px',
            height: '12px',
            top: '20%',
            left: '55%',
            background: 'rgba(190, 195, 210, 0.4)',
            filter: 'blur(2px)',
          }}
        />
      </div>
    </div>
  );
}