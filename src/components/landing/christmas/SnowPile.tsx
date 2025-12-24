import { ANIMATION_TIMING } from './constants';

export function SnowPile() {
  return (
    <div 
      className="absolute bottom-0 left-0 right-0 motion-reduce:hidden origin-bottom"
      style={{
        animation: `snowPileCycle ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
        willChange: 'transform, opacity',
        transform: 'translateZ(0)', // GPU acceleration
      }}
    >
      <svg 
        viewBox="0 0 100 12" 
        preserveAspectRatio="none" 
        className="w-full h-16"
        style={{ filter: 'drop-shadow(0 -2px 4px rgba(255, 255, 255, 0.3))' }}
      >
        <defs>
          <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="50%" stopColor="rgba(240, 248, 255, 0.9)" />
            <stop offset="100%" stopColor="rgba(220, 235, 250, 0.85)" />
          </linearGradient>
        </defs>
        <path 
          d="M0 12 L0 4 Q5 2 10 4 Q15 6 20 3 Q25 1 30 4 Q35 6 40 3 Q45 1 50 4 Q55 6 60 3 Q65 1 70 4 Q75 6 80 3 Q85 1 90 4 Q95 6 100 4 L100 12 Z" 
          fill="url(#snowGradient)"
        />
      </svg>
    </div>
  );
}
