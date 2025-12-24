import { useMemo } from 'react';

interface MagicTrailProps {
  particleCount?: number;
}

/**
 * Magical sparkle trail that follows behind the sleigh
 */
export function MagicTrail({ particleCount = 6 }: MagicTrailProps) {
  const particles = useMemo(() => 
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.max(4, 10 - i),
      offsetY: Math.sin(i * 0.8) * 4,
      opacity: 1 - (i * 0.15),
      duration: 0.6 + i * 0.1,
      delay: i * 0.12,
    })),
  [particleCount]);

  return (
    <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center gap-2" aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            right: `${particle.id * 14}px`,
            top: `${particle.offsetY}px`,
            opacity: particle.opacity,
            animation: `magicSparkle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          <svg 
            width={particle.size} 
            height={particle.size} 
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
    </div>
  );
}

interface SoundParticlesProps {
  count?: number;
}

/**
 * Bell sound effect particles (musical notes floating up)
 */
export function SoundParticles({ count = 3 }: SoundParticlesProps) {
  return (
    <div className="absolute -bottom-2 left-4 pointer-events-none" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute text-yellow-400/60 text-xs font-bold"
          style={{
            animation: 'bellSoundWave 1.5s ease-out infinite',
            animationDelay: `${i * 0.5}s`,
            left: `${i * 8}px`,
          }}
        >
          ♪
        </div>
      ))}
    </div>
  );
}
