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
              {/* Reindeer silhouette */}
              <svg 
                width="28" 
                height="20" 
                viewBox="0 0 28 20" 
                className="text-amber-900/90 drop-shadow-[0_0_4px_rgba(255,200,100,0.4)]"
              >
                {/* Body */}
                <ellipse cx="14" cy="12" rx="8" ry="5" fill="currentColor" />
                {/* Head */}
                <circle cx="22" cy="9" r="3.5" fill="currentColor" />
                {/* Antlers */}
                <path 
                  d="M21 6 L20 2 L18 4 M23 6 L24 2 L26 4 M20 3 L19 1 M24 3 L25 1" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  fill="none"
                />
                {/* Legs (running pose) */}
                <path 
                  d="M10 15 L8 19 M12 16 L13 19 M16 16 L15 19 M18 15 L20 19" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
                {/* Nose (Rudolph for lead) */}
                {i === 3 && (
                  <circle cx="25" cy="9" r="1.5" fill="#ef4444" className="animate-pulse" />
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
            
            {/* Sparkle trail */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-yellow-300/60"
                  style={{
                    animation: 'twinkle 0.8s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
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

export function Snowfall() {
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      driftDuration: Math.random() * 4 + 3,
    }));
  }, []);

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60 + 5,
      size: Math.random() * 3 + 2,
      twinkleDuration: Math.random() * 2 + 1.5,
      delay: Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Santa and reindeer sleigh */}
      <SantaSleigh />
      
      {/* Twinkling stars */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute motion-reduce:hidden"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.twinkleDuration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        >
          {/* 4-point star shape */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white/90 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
          </svg>
        </div>
      ))}
      
      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white/80 motion-reduce:hidden"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.duration}s linear infinite, snowDrift ${flake.driftDuration}s ease-in-out infinite`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
