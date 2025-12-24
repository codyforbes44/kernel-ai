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

function Snowman() {
  return (
    <div 
      className="absolute bottom-16 right-12 motion-reduce:hidden z-20"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}
    >
      {/* Snowman container */}
      <div className="relative">
        {/* Head that tracks the snowblower */}
        <div 
          className="absolute -top-[52px] left-1/2 -translate-x-1/2"
          style={{ 
            animation: `snowmanWatch ${CYCLE_DURATION}s ease-in-out infinite`,
            transformOrigin: 'center bottom',
          }}
        >
          {/* Head snowball */}
          <svg width="36" height="36" viewBox="0 0 36 36">
            <defs>
              <radialGradient id="snowballHead" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e8f0f8" />
              </radialGradient>
            </defs>
            <circle cx="18" cy="18" r="16" fill="url(#snowballHead)" stroke="#d0dce8" strokeWidth="0.5" />
            
            {/* Coal eyes */}
            <circle cx="12" cy="14" r="2.5" fill="#1a1a1a" />
            <circle cx="24" cy="14" r="2.5" fill="#1a1a1a" />
            {/* Eye shine */}
            <circle cx="11" cy="13" r="0.8" fill="#4a4a4a" />
            <circle cx="23" cy="13" r="0.8" fill="#4a4a4a" />
            
            {/* Carrot nose */}
            <polygon points="18,17 18,19 26,18" fill="#f97316" stroke="#ea580c" strokeWidth="0.3" />
            
            {/* Smile made of coal */}
            <circle cx="12" cy="24" r="1.2" fill="#1a1a1a" />
            <circle cx="15" cy="26" r="1.2" fill="#1a1a1a" />
            <circle cx="18" cy="27" r="1.2" fill="#1a1a1a" />
            <circle cx="21" cy="26" r="1.2" fill="#1a1a1a" />
            <circle cx="24" cy="24" r="1.2" fill="#1a1a1a" />
          </svg>
          
          {/* Top hat */}
          <svg 
            width="32" 
            height="24" 
            viewBox="0 0 32 24" 
            className="absolute -top-[18px] left-1/2 -translate-x-1/2"
          >
            <rect x="4" y="18" width="24" height="4" rx="1" fill="#1f2937" />
            <rect x="8" y="2" width="16" height="18" rx="1" fill="#1f2937" />
            <rect x="8" y="12" width="16" height="3" fill="#dc2626" />
          </svg>
        </div>
        
        {/* Middle snowball (torso) */}
        <svg width="50" height="45" viewBox="0 0 50 45" className="relative">
          <defs>
            <radialGradient id="snowballMiddle" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0e8f0" />
            </radialGradient>
          </defs>
          <ellipse cx="25" cy="22" rx="22" ry="20" fill="url(#snowballMiddle)" stroke="#d0dce8" strokeWidth="0.5" />
          
          {/* Coal buttons */}
          <circle cx="25" cy="12" r="2" fill="#1a1a1a" />
          <circle cx="25" cy="22" r="2" fill="#1a1a1a" />
          <circle cx="25" cy="32" r="2" fill="#1a1a1a" />
          
          {/* Scarf */}
          <path 
            d="M8 8 Q25 14 42 8" 
            stroke="#dc2626" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M40 8 L44 18 L40 18 L42 28" 
            stroke="#dc2626" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
        
        {/* Left arm (stick) - static */}
        <svg 
          width="30" 
          height="20" 
          viewBox="0 0 30 20" 
          className="absolute top-[15px] -left-[22px]"
        >
          <path 
            d="M28 10 L8 8 L4 4 M8 8 L6 14" 
            stroke="#8B4513" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
        
        {/* Right arm (stick) - waves! */}
        <svg 
          width="30" 
          height="25" 
          viewBox="0 0 30 25" 
          className="absolute top-[10px] -right-[22px]"
          style={{ 
            transformOrigin: 'left center',
            animation: `snowmanWave ${CYCLE_DURATION}s ease-in-out infinite`,
          }}
        >
          <path 
            d="M2 12 L22 10 L26 4 M22 10 L24 16" 
            stroke="#8B4513" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
        
        {/* Bottom snowball (base) */}
        <svg width="65" height="40" viewBox="0 0 65 40" className="absolute top-[32px] -left-[7px]">
          <defs>
            <radialGradient id="snowballBase" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#dce4ed" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="22" rx="30" ry="18" fill="url(#snowballBase)" stroke="#d0dce8" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}

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
  // Main arc particles - chunky snow thrown in parabolic arc
  const arcParticles = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => {
      const angle = -20 + (i / 25) * 40; // Spread from -20 to 20 degrees
      const speed = 0.8 + (i % 5) * 0.15;
      const size = i % 3 === 0 ? 'large' : i % 3 === 1 ? 'medium' : 'small';
      return {
        id: i,
        angle,
        speed,
        size,
        delay: (i * 0.04) % 0.8,
        offsetY: Math.sin(i * 0.5) * 8,
      };
    }), 
  []);

  // Fine mist particles - soft powder effect
  const mistParticles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 5 + (i % 4) * 12,
      y: -20 + (i % 3) * 8,
      size: 3 + (i % 3) * 2,
      duration: 1.2 + (i % 4) * 0.3,
      delay: i * 0.08,
    })),
  []);

  // Exhaust puff particles
  const exhaustPuffs = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      delay: i * 0.4,
      size: 4 + (i % 2) * 2,
    })),
  []);

  // Ground snow chunks - thrown up as blower passes over pile
  const groundChunks = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => {
      const isLarge = i % 4 === 0;
      const isMedium = i % 4 === 1;
      return {
        id: i,
        size: isLarge ? 6 : isMedium ? 4 : 3,
        // Spread chunks across the auger width
        startX: -5 + (i % 5) * 6,
        // Varied arc heights and distances
        arcHeight: 20 + (i % 4) * 12,
        arcDistance: 8 + (i % 3) * 6,
        duration: 0.5 + (i % 4) * 0.15,
        delay: (i * 0.06) % 0.6,
        rotation: (i % 2 === 0 ? 1 : -1) * (180 + i * 30),
      };
    }),
  []);

  const getSizePixels = (size: string) => {
    switch(size) {
      case 'large': return { w: 7, h: 7 };
      case 'medium': return { w: 5, h: 5 };
      default: return { w: 3, h: 3 };
    }
  };

  return (
    <div 
      className="absolute bottom-4 motion-reduce:hidden"
      style={{
        animation: `snowblowerCycle ${CYCLE_DURATION}s linear infinite`,
        willChange: 'transform',
        left: '-120px',
      }}
    >
      <div className="relative" style={{ animation: 'blowerVibrate 0.08s linear infinite' }}>
        
        {/* Headlight glow cone - illuminates ahead */}
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
        <div className="absolute" style={{ left: '60px', top: '-8px' }}>
          {exhaustPuffs.map((puff) => (
            <div
              key={`exhaust-${puff.id}`}
              className="absolute rounded-full"
              style={{
                width: `${puff.size}px`,
                height: `${puff.size}px`,
                background: 'radial-gradient(circle, rgba(120, 120, 120, 0.4) 0%, rgba(80, 80, 80, 0.2) 50%, transparent 100%)',
                animation: `exhaustPuff 1.6s ease-out infinite`,
                animationDelay: `${puff.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Snow mist - soft atmospheric powder */}
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
        
        {/* Main snow arc - parabolic fountain */}
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
                  boxShadow: particle.size === 'large' 
                    ? '0 0 4px rgba(255, 255, 255, 0.6)' 
                    : 'none',
                  animation: `snowArc ${particle.speed}s ease-out infinite`,
                  animationDelay: `${particle.delay}s`,
                  ['--arc-angle' as string]: `${particle.angle}deg`,
                  ['--arc-offset' as string]: `${particle.offsetY}px`,
                  transform: `rotate(${particle.angle}deg)`,
                }}
              />
            );
          })}
        </div>

        {/* Landing splash particles */}
        <div className="absolute" style={{ left: '50px', top: '25px' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`splash-${i}`}
              className="absolute rounded-full bg-white/70"
              style={{
                width: '3px',
                height: '3px',
                animation: `snowSplash 0.6s ease-out infinite`,
                animationDelay: `${i * 0.12}s`,
                left: `${i * 10}px`,
                top: `${(i % 2) * 4}px`,
              }}
            />
          ))}
        </div>

        {/* Ground snow chunks - fly up from the pile as auger passes */}
        <div className="absolute" style={{ left: '0px', top: '35px' }}>
          {groundChunks.map((chunk) => (
            <div
              key={`ground-${chunk.id}`}
              className="absolute"
              style={{
                left: `${chunk.startX}px`,
                width: `${chunk.size}px`,
                height: `${chunk.size}px`,
                background: chunk.size > 4 
                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 40%, rgba(240, 248, 255, 0.7) 100%)'
                  : 'rgba(255, 255, 255, 0.85)',
                borderRadius: chunk.size > 4 ? '30% 70% 40% 60%' : '50%',
                boxShadow: chunk.size > 4 ? '0 0 3px rgba(255, 255, 255, 0.5)' : 'none',
                animation: `groundChunkFly ${chunk.duration}s ease-out infinite`,
                animationDelay: `${chunk.delay}s`,
                ['--chunk-height' as string]: `${chunk.arcHeight}px`,
                ['--chunk-distance' as string]: `${chunk.arcDistance}px`,
                ['--chunk-rotation' as string]: `${chunk.rotation}deg`,
              }}
            />
          ))}
        </div>
        
        {/* Snowblower machine */}
        <svg width="80" height="50" viewBox="0 0 80 50" className="drop-shadow-lg relative z-10">
          <defs>
            {/* Headlight glow gradient */}
            <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            {/* Body metallic gradient */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
          
          {/* Main body */}
          <rect x="20" y="15" width="45" height="25" rx="3" fill="url(#bodyGradient)" stroke="#991b1b" strokeWidth="1" />
          
          {/* Engine housing */}
          <rect x="45" y="10" width="18" height="15" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="1" />
          
          {/* Exhaust pipe */}
          <rect x="60" y="5" width="4" height="8" fill="#374151" />
          <ellipse cx="62" cy="4" rx="3" ry="2" fill="#6b7280" />
          
          {/* Handle */}
          <path d="M55 15 L65 0 L70 0 L70 5 L60 15" fill="#4b5563" stroke="#374151" strokeWidth="1" />
          <rect x="67" y="0" width="8" height="6" rx="2" fill="#1f2937" />
          
          {/* Auger housing */}
          <path d="M5 20 Q0 20 0 30 Q0 40 5 40 L20 40 L20 20 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
          
          {/* Spinning auger blades */}
          <g style={{ transformOrigin: '12px 30px', animation: 'augerSpin 0.1s linear infinite' }}>
            <ellipse cx="12" cy="30" rx="10" ry="8" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <path d="M2 30 L22 30 M12 22 L12 38" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <path d="M5 24 L19 36 M19 24 L5 36" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          {/* Chute */}
          <path d="M8 20 L8 5 Q8 0 15 0 L25 0 Q30 0 28 8 L20 20" fill="#b91c1c" stroke="#991b1b" strokeWidth="1" />
          <ellipse cx="18" cy="0" rx="8" ry="4" fill="#dc2626" />
          
          {/* Wheels with rotation */}
          <g style={{ transformOrigin: '30px 42px', animation: 'wheelSpin 0.3s linear infinite' }}>
            <circle cx="30" cy="42" r="8" fill="#1f2937" stroke="#111827" strokeWidth="2" />
            <circle cx="30" cy="42" r="3" fill="#374151" />
            {/* Tire treads */}
            <path d="M24 38 L24 46 M30 35 L30 49 M36 38 L36 46" stroke="#4b5563" strokeWidth="1" />
          </g>
          <g style={{ transformOrigin: '55px 42px', animation: 'wheelSpin 0.3s linear infinite' }}>
            <circle cx="55" cy="42" r="8" fill="#1f2937" stroke="#111827" strokeWidth="2" />
            <circle cx="55" cy="42" r="3" fill="#374151" />
            <path d="M49 38 L49 46 M55 35 L55 49 M61 38 L61 46" stroke="#4b5563" strokeWidth="1" />
          </g>
          
          {/* Headlight with glow */}
          <circle cx="18" cy="25" r="4" fill="url(#headlightGlow)" style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))' }} />
          <circle cx="18" cy="25" r="2" fill="#fef9c3" />
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

  // Subtle shooting stars - rare and peaceful
  const shootingStars = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      startX: 10 + (i * 30), // Spread across sky
      startY: 8 + (i * 6),
      delay: 15 + i * 25, // Much more rare: 15s, 40s, 65s
      duration: 2.5 + i * 0.4, // Slower: 2.5s, 2.9s, 3.3s
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Santa and reindeer sleigh */}
      <SantaSleigh />
      
      {/* Shooting stars - subtle and peaceful */}
      {shootingStars.map((star) => (
        <div
          key={`shooting-${star.id}`}
          className="absolute motion-reduce:hidden"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            animation: `shootingStarPeaceful ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        >
          {/* Soft star head */}
          <div 
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(240,245,255,0.6) 60%, transparent 100%)',
              boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.5), 0 0 8px 2px rgba(220, 230, 255, 0.25)',
            }}
          />
          
          {/* Simple elegant tail */}
          <div 
            className="absolute top-0.5 -left-16 w-16 h-0.5 origin-right"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0.4) 100%)',
              transform: 'rotate(-35deg)',
              borderRadius: '0 2px 2px 0',
            }}
          />
          
          {/* 3 subtle trailing dots - static, no animation */}
          {[0, 1, 2].map((i) => (
            <div
              key={`trail-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${2 - i * 0.5}px`,
                height: `${2 - i * 0.5}px`,
                background: `rgba(255, 255, 255, ${0.4 - i * 0.12})`,
                left: `${-6 - i * 5}px`,
                top: `${2 + i * 3}px`,
              }}
            />
          ))}
        </div>
      ))}
      
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
      
      {/* Friendly snowman watching */}
      <Snowman />
    </div>
  );
}
