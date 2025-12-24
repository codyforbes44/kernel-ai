import { useMemo } from 'react';
import { ANIMATION_TIMING } from './constants';
import { useChristmasPerformance } from './hooks/useChristmasPerformance';

interface BlownParticle {
  id: number;
  x: number;
  size: number;
  driftX: number;
  driftY: number;
  delay: number;
  duration: number;
}

export function SnowPile() {
  const { particleScale } = useChristmasPerformance();
  
  // Generate blown snow particles that disperse when wind gusts happen
  const blownParticles = useMemo<BlownParticle[]>(() => {
    const count = Math.floor(12 * particleScale);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 5 + (i / count) * 90, // Spread across the pile
      size: 3 + Math.random() * 4,
      driftX: 30 + Math.random() * 60, // Drift right
      driftY: -15 - Math.random() * 25, // Drift up
      delay: (i / count) * 0.3, // Stagger the particles
      duration: 1.5 + Math.random() * 1,
    }));
  }, [particleScale]);

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 motion-reduce:hidden origin-bottom"
      style={{
        animation: `snowPileNatural ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
      }}
    >
      {/* Blown snow particles - appear during wind dispersal phase */}
      {blownParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white/80"
          style={{
            left: `${particle.x}%`,
            bottom: '8px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `snowBlownParticle ${particle.duration}s ease-out infinite`,
            animationDelay: `${(ANIMATION_TIMING.CYCLE_DURATION * 0.70) + particle.delay}s`,
            '--drift-x': `${particle.driftX}px`,
            '--drift-y': `${particle.driftY}px`,
          } as React.CSSProperties}
        />
      ))}
      
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
