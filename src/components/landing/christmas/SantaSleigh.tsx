import { ANIMATION_TIMING, CHRISTMAS_LAYERS, PARTICLE_CONFIG } from './constants';
import { Reindeer } from './Reindeer';
import { MagicTrail, SoundParticles } from './MagicTrail';
import { useChristmasPerformance, scaleParticleCount } from './hooks/useChristmasPerformance';

/**
 * Sleigh bells component with ringing animation
 */
function SleighBells({ count }: { count: number }) {
  return (
    <div className="relative -ml-2 mr-1" aria-hidden="true">
      <svg width="24" height="14" viewBox="0 0 24 14" className="text-amber-700/60">
        <path d="M0 4 Q12 0 24 6" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M0 8 Q12 12 24 6" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
      
      {/* Sleigh bells on the reins */}
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${4 + i * 8}px`,
            top: `${i % 2 === 0 ? 2 : 8}px`,
            animation: 'sleighBellRing 0.4s ease-in-out infinite',
            animationDelay: `${i * 0.13}s`,
          }}
        >
          <svg width="6" height="6" viewBox="0 0 6 6">
            <circle cx="3" cy="3" r="2.5" fill="#fbbf24" stroke="#d97706" strokeWidth="0.3" />
            <circle cx="2.5" cy="2.5" r="0.8" fill="#fef3c7" />
            <line x1="3" y1="5" x2="3" y2="6" stroke="#d97706" strokeWidth="0.3" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/**
 * The sleigh with Santa, gift sack, and decorative bells
 */
function Sleigh({ enableShadows }: { enableShadows: boolean }) {
  return (
    <svg 
      width="50" 
      height="32" 
      viewBox="0 0 50 32" 
      className={enableShadows ? 'drop-shadow-[0_0_8px_rgba(255,200,100,0.5)]' : ''}
      aria-hidden="true"
    >
      {/* Sleigh body */}
      <path 
        d="M5 18 Q0 18 2 24 L8 28 Q12 30 20 30 L45 30 Q50 30 48 24 L46 20 Q44 16 38 16 L10 16 Q6 16 5 18 Z" 
        fill="#b91c1c" 
        stroke="#7f1d1d"
        strokeWidth="1"
      />
      <path 
        d="M8 16 Q4 14 6 12 L12 10 L40 10 Q46 10 44 14 L42 16" 
        fill="#dc2626" 
        stroke="#7f1d1d"
        strokeWidth="0.5"
      />
      {/* Gold runner */}
      <path 
        d="M2 28 Q0 30 4 31 L48 31 Q52 30 50 28" 
        stroke="#fbbf24" 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Gift sack */}
      <ellipse cx="38" cy="14" rx="6" ry="8" fill="#15803d" />
      <path d="M34 8 Q38 4 42 8" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
      
      {/* Decorative bells on sleigh */}
      <g style={{ animation: 'sleighBellRing 0.35s ease-in-out infinite' }}>
        <circle cx="6" cy="28" r="2" fill="#fbbf24" />
        <circle cx="5.5" cy="27.5" r="0.6" fill="#fef3c7" />
      </g>
      <g style={{ animation: 'sleighBellRing 0.35s ease-in-out infinite', animationDelay: '0.1s' }}>
        <circle cx="12" cy="29" r="1.5" fill="#fbbf24" />
        <circle cx="11.5" cy="28.5" r="0.5" fill="#fef3c7" />
      </g>
      
      {/* Santa silhouette with waving arm */}
      <g transform="translate(18, 2)">
        {/* Body */}
        <ellipse cx="8" cy="12" rx="6" ry="6" fill="#b91c1c" />
        {/* Face */}
        <circle cx="8" cy="4" r="4" fill="#fcd9b6" />
        {/* Hat */}
        <path d="M4 4 L8 -2 L12 4 Z" fill="#b91c1c" />
        <circle cx="8" cy="-2" r="1.5" fill="white" />
        {/* Beard */}
        <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" />
        {/* Eyes */}
        <circle cx="6.5" cy="3.5" r="0.4" fill="#1a1a1a" />
        <circle cx="9.5" cy="3.5" r="0.4" fill="#1a1a1a" />
        {/* Rosy cheeks */}
        <circle cx="5" cy="5" r="0.8" fill="#fca5a5" opacity="0.6" />
        <circle cx="11" cy="5" r="0.8" fill="#fca5a5" opacity="0.6" />
        {/* Waving arm */}
        <g style={{ 
          transformOrigin: '14px 10px',
          animation: 'santaWave 0.8s ease-in-out infinite',
        }}>
          <path 
            d="M14 10 L18 6" 
            stroke="#b91c1c" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          {/* Mitten */}
          <circle cx="18" cy="5" r="2" fill="white" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Santa's sleigh with reindeer team, magical sparkle trail, and sound effects.
 * Uses extracted sub-components for better maintainability.
 */
export function SantaSleigh() {
  const { particleScale, enableShadows, isSmallScreen, isVerySmallScreen } = useChristmasPerformance();
  
  // Responsive scaling for mobile
  const sleighScale = isVerySmallScreen ? 0.5 : isSmallScreen ? 0.65 : 1;
  
  const reindeerCount = PARTICLE_CONFIG.REINDEER_COUNT;
  const bellCount = scaleParticleCount(PARTICLE_CONFIG.SLEIGH_BELLS, particleScale);
  const trailCount = scaleParticleCount(PARTICLE_CONFIG.MAGIC_TRAIL_PARTICLES, particleScale);

  return (
    <div 
      className="absolute motion-reduce:hidden"
      style={{
        top: isVerySmallScreen ? '22%' : isSmallScreen ? '18%' : '12%',
        animation: `santaFly ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
        animationDelay: '3s',
        willChange: 'transform',
        transform: `translateZ(0) scale(${sleighScale})`,
        transformOrigin: 'left center',
        zIndex: CHRISTMAS_LAYERS.SANTA,
      }}
      aria-hidden="true"
    >
      {/* Subtle shadow beneath sleigh */}
      {enableShadows && (
        <div
          className="absolute"
          style={{
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '8px',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)',
            filter: 'blur(3px)',
          }}
        />
      )}
      
      <div 
        className="relative"
        style={{ animation: 'sleighBob 2s ease-in-out infinite' }}
      >
        {/* Reindeer team */}
        <div className="flex items-center">
          {Array.from({ length: reindeerCount }, (_, i) => (
            <Reindeer key={i} index={i} isRudolph={i === 0} />
          ))}
          
          {/* Reins with bells */}
          <SleighBells count={bellCount} />
          
          {/* Sleigh with Santa */}
          <div className="relative">
            <Sleigh enableShadows={enableShadows} />
            
            {/* Magical sparkle trail */}
            {particleScale > 0 && <MagicTrail particleCount={trailCount} />}
            
            {/* Bell sound effect particles */}
            {particleScale > 0 && <SoundParticles count={bellCount} />}
          </div>
        </div>
      </div>
    </div>
  );
}
