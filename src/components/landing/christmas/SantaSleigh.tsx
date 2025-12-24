import { ANIMATION_TIMING, CHRISTMAS_LAYERS, PARTICLE_CONFIG, MOBILE_CONFIG } from './constants';
import { Reindeer } from './Reindeer';
import { MagicTrail, SoundParticles, ReindeerDust } from './MagicTrail';
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
function Sleigh({ simplified }: { simplified: boolean }) {
  return (
    <svg 
      width="50" 
      height="32" 
      viewBox="0 0 50 32" 
      className={simplified ? '' : 'drop-shadow-[0_0_6px_rgba(255,200,100,0.4)]'}
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
      
      {/* Decorative bells on sleigh - simplified */}
      {!simplified && (
        <>
          <g style={{ animation: 'sleighBellRing 0.35s ease-in-out infinite' }}>
            <circle cx="6" cy="28" r="2" fill="#fbbf24" />
            <circle cx="5.5" cy="27.5" r="0.6" fill="#fef3c7" />
          </g>
          <g style={{ animation: 'sleighBellRing 0.35s ease-in-out infinite', animationDelay: '0.1s' }}>
            <circle cx="12" cy="29" r="1.5" fill="#fbbf24" />
            <circle cx="11.5" cy="28.5" r="0.5" fill="#fef3c7" />
          </g>
        </>
      )}
      
      {/* Santa silhouette with waving arm */}
      <g transform="translate(18, 2)">
        <ellipse cx="8" cy="12" rx="6" ry="6" fill="#b91c1c" />
        <circle cx="8" cy="4" r="4" fill="#fcd9b6" />
        <path d="M4 4 L8 -2 L12 4 Z" fill="#b91c1c" />
        <circle cx="8" cy="-2" r="1.5" fill="white" />
        <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" />
        <circle cx="6.5" cy="3.5" r="0.4" fill="#1a1a1a" />
        <circle cx="9.5" cy="3.5" r="0.4" fill="#1a1a1a" />
        <circle cx="5" cy="5" r="0.8" fill="#fca5a5" opacity="0.6" />
        <circle cx="11" cy="5" r="0.8" fill="#fca5a5" opacity="0.6" />
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
          <circle cx="18" cy="5" r="2" fill="white" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Santa's sleigh with reindeer team.
 * Mobile-first optimized with reduced particles and effects.
 */
export function SantaSleigh() {
  const { particleScale, enableShadows, isSmallScreen, isVerySmallScreen, deviceTier } = useChristmasPerformance();
  
  // Responsive scaling
  const sleighScale = isVerySmallScreen ? 0.45 : isSmallScreen ? 0.6 : 1;
  
  // Simplified mode for mobile
  const isSimplified = deviceTier !== 'high';
  const config = isSmallScreen ? MOBILE_CONFIG : PARTICLE_CONFIG;
  
  const reindeerCount = config.REINDEER_COUNT;
  const bellCount = scaleParticleCount(config.SLEIGH_BELLS, particleScale);
  const trailCount = scaleParticleCount(config.MAGIC_TRAIL_PARTICLES, particleScale);
  const dustCount = isSimplified ? 0 : scaleParticleCount(8, particleScale);

  return (
    <div 
      className="absolute motion-reduce:hidden"
      style={{
        top: isVerySmallScreen ? '24%' : isSmallScreen ? '20%' : '12%',
        animation: `santaFly ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
        animationDelay: '3s',
        willChange: 'transform',
        transform: `translateZ(0) scale(${sleighScale})`,
        transformOrigin: 'left center',
        zIndex: CHRISTMAS_LAYERS.SANTA,
      }}
      aria-hidden="true"
    >
      {/* Subtle shadow beneath sleigh - desktop only */}
      {enableShadows && !isSimplified && (
        <div
          className="absolute"
          style={{
            bottom: '-18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '6px',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
      )}
      
      <div 
        className="relative"
        style={{ 
          animation: 'sleighBob 3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite, sleighDrift 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        <div className="flex items-center relative">
          {/* Dust particles - desktop only */}
          {dustCount > 0 && <ReindeerDust particleCount={dustCount} />}
          
          {Array.from({ length: reindeerCount }, (_, i) => (
            <Reindeer key={i} index={i} isRudolph={i === 0} />
          ))}
          
          <SleighBells count={bellCount} />
          
          <div className="relative">
            <Sleigh simplified={isSimplified} />
            
            {/* Magic trail - reduced on mobile */}
            {particleScale > 0 && trailCount > 0 && <MagicTrail particleCount={trailCount} />}
            
            {/* Sound particles - desktop only */}
            {!isSimplified && particleScale > 0 && <SoundParticles count={bellCount} />}
          </div>
        </div>
      </div>
    </div>
  );
}
