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

interface ReindeerDustProps {
  particleCount?: number;
}

/**
 * Magical dust particles kicked up by reindeer hooves
 * Creates a dreamy, ethereal trail effect
 */
export function ReindeerDust({ particleCount = 12 }: ReindeerDustProps) {
  const dustParticles = useMemo(() => 
    Array.from({ length: particleCount }, (_, i) => {
      const row = Math.floor(i / 4); // 3 rows of particles
      const col = i % 4;
      return {
        id: i,
        // Vary sizes for depth - smaller particles drift further
        size: 2 + (i % 3) * 1.5,
        // Stagger horizontally across the reindeer width
        offsetX: -20 - col * 25 - (row * 8),
        // Vertical position varies per row
        offsetY: 8 + row * 6 + ((i * 3) % 5),
        // Opacity varies for depth
        opacity: 0.25 + ((i * 7) % 10) * 0.04,
        // Stagger animation timing
        duration: 1.8 + (i % 5) * 0.4,
        delay: (i * 0.15) % 1.2,
        // Drift direction and distance
        driftX: 15 + (i % 4) * 8,
        driftY: -8 - (i % 3) * 4,
      };
    }),
  [particleCount]);

  const sparkleParticles = useMemo(() =>
    Array.from({ length: Math.ceil(particleCount / 3) }, (_, i) => ({
      id: i,
      size: 3 + (i % 2) * 2,
      offsetX: -30 - i * 35,
      offsetY: 4 + (i % 3) * 8,
      opacity: 0.5 + (i % 3) * 0.15,
      duration: 1.2 + (i % 3) * 0.3,
      delay: i * 0.25,
    })),
  [particleCount]);

  return (
    <div className="absolute left-0 top-1/2 pointer-events-none" aria-hidden="true">
      {/* Soft glowing dust particles */}
      {dustParticles.map((particle) => (
        <div
          key={`dust-${particle.id}`}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.offsetX}px`,
            top: `${particle.offsetY}px`,
            background: `radial-gradient(circle, rgba(255,250,240,${particle.opacity}) 0%, rgba(255,230,200,${particle.opacity * 0.5}) 60%, transparent 100%)`,
            boxShadow: `0 0 ${particle.size}px rgba(255,215,150,${particle.opacity * 0.6})`,
            animation: `reindeerDust ${particle.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
            animationDelay: `${particle.delay}s`,
            ['--dust-drift-x' as string]: `${particle.driftX}px`,
            ['--dust-drift-y' as string]: `${particle.driftY}px`,
          }}
        />
      ))}
      
      {/* Tiny golden sparkles mixed in */}
      {sparkleParticles.map((sparkle) => (
        <div
          key={`sparkle-${sparkle.id}`}
          className="absolute"
          style={{
            left: `${sparkle.offsetX}px`,
            top: `${sparkle.offsetY}px`,
            opacity: sparkle.opacity,
            animation: `dustSparkle ${sparkle.duration}s ease-in-out infinite`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <svg 
            width={sparkle.size} 
            height={sparkle.size} 
            viewBox="0 0 24 24" 
            className="text-amber-200/70 drop-shadow-[0_0_3px_rgba(255,200,100,0.6)]"
          >
            <path 
              d="M12 0L13 10L24 12L13 14L12 24L11 14L0 12L11 10L12 0Z" 
              fill="currentColor" 
            />
          </svg>
        </div>
      ))}
      
      {/* Soft trailing glow cloud */}
      <div 
        className="absolute"
        style={{
          left: '-60px',
          top: '0px',
          width: '80px',
          height: '30px',
          background: 'radial-gradient(ellipse at center, rgba(255,240,200,0.12) 0%, rgba(255,220,150,0.05) 50%, transparent 80%)',
          filter: 'blur(4px)',
          animation: 'dustCloud 2.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}
