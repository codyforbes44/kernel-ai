import { useMemo } from 'react';

interface Snowflake {
  id: number;
  x: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftDuration: number;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  twinkleDuration: number;
  delay: number;
}

// Animation cycle timing (in seconds) - single source of truth
const CYCLE_DURATION = 25; // Total cycle
const ACCUMULATE_PHASE = 15; // Snow accumulates
const BLOWER_PHASE = 8; // Snowblower crosses

function SantaSleigh() {
  return (
    <div 
      className="absolute motion-reduce:hidden"
      style={{
        top: '12%',
        animation: 'santaFly 25s linear infinite',
        animationDelay: '3s',
      }}
    >
      <div 
        className="relative"
        style={{
          animation: 'sleighBob 2s ease-in-out infinite',
        }}
      >
        {/* Reindeer team - 4 reindeer */}
        <div className="flex items-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative"
              style={{
                marginRight: i < 3 ? '-4px' : '0',
                animation: `reindeerRun 0.5s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* Reindeer silhouette - facing left (direction of travel) */}
              <svg 
                width="28" 
                height="20" 
                viewBox="0 0 28 20" 
                className="text-amber-900/90 drop-shadow-[0_0_4px_rgba(255,200,100,0.4)]"
              >
                {/* Body */}
                <ellipse cx="14" cy="12" rx="8" ry="5" fill="currentColor" />
                {/* Head - on left side */}
                <circle cx="6" cy="9" r="3.5" fill="currentColor" />
                {/* Antlers - pointing left */}
                <path 
                  d="M7 6 L8 2 L10 4 M5 6 L4 2 L2 4 M8 3 L9 1 M4 3 L3 1" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  fill="none"
                />
                {/* Legs (running pose) */}
                <path 
                  d="M10 15 L8 19 M12 16 L11 19 M16 16 L17 19 M18 15 L20 19" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
                {/* Nose (Rudolph for lead) */}
                {i === 0 && (
                  <circle cx="3" cy="9" r="1.5" fill="#ef4444" className="animate-pulse" />
                )}
              </svg>
            </div>
          ))}
          
          {/* Reins */}
          <svg width="20" height="10" viewBox="0 0 20 10" className="text-amber-700/60 -ml-2 mr-1">
            <path d="M0 3 Q10 0 20 5" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M0 7 Q10 10 20 5" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
          
          {/* Sleigh */}
          <div className="relative">
            <svg 
              width="50" 
              height="32" 
              viewBox="0 0 50 32" 
              className="drop-shadow-[0_0_8px_rgba(255,200,100,0.5)]"
            >
              {/* Sleigh body */}
              <path 
                d="M5 18 Q0 18 2 24 L8 28 Q12 30 20 30 L45 30 Q50 30 48 24 L46 20 Q44 16 38 16 L10 16 Q6 16 5 18 Z" 
                fill="#b91c1c" 
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              {/* Sleigh rim */}
              <path 
                d="M8 16 Q4 14 6 12 L12 10 L40 10 Q46 10 44 14 L42 16" 
                fill="#dc2626" 
                stroke="#7f1d1d"
                strokeWidth="0.5"
              />
              {/* Runner */}
              <path 
                d="M2 28 Q0 30 4 31 L48 31 Q52 30 50 28" 
                stroke="#fbbf24" 
                strokeWidth="2" 
                fill="none"
              />
              {/* Gift bag */}
              <ellipse cx="38" cy="14" rx="6" ry="8" fill="#15803d" />
              <path d="M34 8 Q38 4 42 8" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
              
              {/* Santa silhouette */}
              <g transform="translate(18, 2)">
                {/* Body */}
                <ellipse cx="8" cy="12" rx="6" ry="6" fill="#b91c1c" />
                {/* Head */}
                <circle cx="8" cy="4" r="4" fill="#fcd9b6" />
                {/* Hat */}
                <path d="M4 4 L8 -2 L12 4 Z" fill="#b91c1c" />
                <circle cx="8" cy="-2" r="1.5" fill="white" />
                {/* Beard */}
                <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" />
                {/* Arm waving */}
                <path 
                  d="M14 10 L18 6" 
                  stroke="#b91c1c" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  style={{ animation: 'santaWave 0.8s ease-in-out infinite' }}
                />
                <circle cx="18" cy="5" r="2" fill="#fcd9b6" />
              </g>
            </svg>
            
            {/* Golden sparkle/star trail */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    right: `${i * 12}px`,
                    opacity: 1 - (i * 0.12),
                    animation: `twinkle ${0.6 + i * 0.1}s ease-in-out infinite, sparkleFloat ${1 + i * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                >
                  {/* 4-point star sparkle */}
                  <svg 
                    width={Math.max(4, 10 - i)} 
                    height={Math.max(4, 10 - i)} 
                    viewBox="0 0 24 24" 
                    className="text-yellow-300 drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]"
                  >
                    <path 
                      d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" 
                      fill="currentColor" 
                    />
                  </svg>
                </div>
              ))}
              {/* Glowing trail particles */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={`particle-${i}`}
                  className="absolute rounded-full bg-gradient-to-r from-yellow-200 to-amber-400"
                  style={{
                    right: `${20 + i * 16}px`,
                    top: `${Math.sin(i) * 6}px`,
                    width: `${Math.max(2, 6 - i)}px`,
                    height: `${Math.max(2, 6 - i)}px`,
                    opacity: 0.8 - (i * 0.15),
                    animation: `twinkle ${0.8 + i * 0.15}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                    boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SnowPile() {
  return (
    <div 
      className="absolute bottom-0 left-0 right-0 motion-reduce:hidden origin-bottom"
      style={{
        animation: `snowPileCycle ${CYCLE_DURATION}s ease-in-out infinite`,
        willChange: 'transform, opacity',
      }}
    >
      {/* Wavy snow pile with gradient */}
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

function Snowblower() {
  // Pre-generate spray particles to avoid random in render
  const sprayParticles = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      width: 4 + (i % 3) * 2,
      height: 4 + (i % 3) * 2,
      duration: 0.4 + (i % 4) * 0.15,
      left: (i % 4) * 8,
      top: (i % 3) * 15,
    })), 
  []);

  return (
    <div 
      className="absolute bottom-4 motion-reduce:hidden"
      style={{
        animation: `snowblowerCycle ${CYCLE_DURATION}s linear infinite`,
        willChange: 'transform',
        left: '-120px',
      }}
    >
      <div className="relative">
        {/* Snow spray */}
        <div 
          className="absolute -top-12 left-10"
          style={{
            animation: `snowSprayPulse 0.3s ease-in-out infinite`,
          }}
        >
          {sprayParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white/80"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                animation: `snowParticle ${particle.duration}s ease-out infinite`,
                animationDelay: `${particle.id * 0.06}s`,
                left: `${particle.left}px`,
                top: `${particle.top}px`,
              }}
            />
          ))}
        </div>
        
        {/* Snowblower machine */}
        <svg width="80" height="50" viewBox="0 0 80 50" className="drop-shadow-lg">
          {/* Main body */}
          <rect x="20" y="15" width="45" height="25" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          
          {/* Engine housing */}
          <rect x="45" y="10" width="18" height="15" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="1" />
          
          {/* Exhaust */}
          <rect x="60" y="5" width="4" height="8" fill="#374151" />
          <ellipse cx="62" cy="4" rx="3" ry="2" fill="#6b7280" />
          
          {/* Handle */}
          <path d="M55 15 L65 0 L70 0 L70 5 L60 15" fill="#4b5563" stroke="#374151" strokeWidth="1" />
          <rect x="67" y="0" width="8" height="6" rx="2" fill="#1f2937" />
          
          {/* Auger housing */}
          <path d="M5 20 Q0 20 0 30 Q0 40 5 40 L20 40 L20 20 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
          
          {/* Spinning auger blades */}
          <g style={{ transformOrigin: '12px 30px', animation: 'augerSpin 0.15s linear infinite' }}>
            <ellipse cx="12" cy="30" rx="10" ry="8" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <path d="M2 30 L22 30 M12 22 L12 38" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <path d="M5 24 L19 36 M19 24 L5 36" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          {/* Chute */}
          <path d="M8 20 L8 5 Q8 0 15 0 L25 0 Q30 0 28 8 L20 20" fill="#b91c1c" stroke="#991b1b" strokeWidth="1" />
          <ellipse cx="18" cy="0" rx="8" ry="4" fill="#dc2626" />
          
          {/* Wheels */}
          <circle cx="30" cy="42" r="8" fill="#1f2937" stroke="#111827" strokeWidth="2" />
          <circle cx="30" cy="42" r="3" fill="#374151" />
          <circle cx="55" cy="42" r="8" fill="#1f2937" stroke="#111827" strokeWidth="2" />
          <circle cx="55" cy="42" r="3" fill="#374151" />
          
          {/* Tread marks */}
          <path d="M22 42 L38 42 M47 42 L63 42" stroke="#4b5563" strokeWidth="1" strokeDasharray="2 2" />
          
          {/* Headlight */}
          <circle cx="18" cy="25" r="3" fill="#fbbf24" className="animate-pulse" />
        </svg>
      </div>
    </div>
  );
}

export function Snowfall() {
  // Reduced snowflake count for performance
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: (i * 2.86) % 100, // Deterministic spread
      size: 2 + (i % 4),
      opacity: 0.3 + (i % 5) * 0.1,
      duration: 8 + (i % 6),
      delay: (i * 0.3) % 5,
      driftDuration: 3 + (i % 4),
    }));
  }, []);

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: (i * 4) % 100,
      y: 5 + (i * 2.4) % 55,
      size: 2 + (i % 3),
      twinkleDuration: 1.5 + (i % 3) * 0.5,
      delay: (i * 0.12) % 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Santa and reindeer sleigh */}
      <SantaSleigh />
      
      {/* Twinkling stars with subtle parallax drift */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute motion-reduce:hidden"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.twinkleDuration}s ease-in-out infinite, starParallax 40s ease-in-out infinite`,
            animationDelay: `${star.delay}s, ${star.delay * 5}s`,
            willChange: 'transform, opacity',
          }}
        >
          {/* 4-point star shape */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white/90 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
          </svg>
        </div>
      ))}
      
      {/* Snowflakes with GPU acceleration hint */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white/80 motion-reduce:hidden"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfallSmooth ${flake.duration}s linear infinite, snowDrift ${flake.driftDuration}s ease-in-out infinite`,
            animationDelay: `${flake.delay}s`,
            willChange: 'transform',
          }}
        />
      ))}
      
      {/* Snow pile - pure CSS animation */}
      <SnowPile />
      
      {/* Snowblower - pure CSS animation */}
      <Snowblower />
    </div>
  );
}
