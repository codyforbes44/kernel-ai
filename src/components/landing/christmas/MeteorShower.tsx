import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CHRISTMAS_LAYERS } from './constants';
import { useChristmasPerformance } from './hooks/useChristmasPerformance';

interface Meteor {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  length: number;
  duration: number;
  delay: number;
  brightness: number;
}

/**
 * Occasional meteor/comet effects that streak across the night sky
 * Creates a magical, celestial atmosphere
 */
export function MeteorShower() {
  const { prefersReducedMotion, particleScale, isSmallScreen } = useChristmasPerformance();
  const [activeMeteors, setActiveMeteors] = useState<Meteor[]>([]);
  const meteorIdRef = useRef(0);

  // Generate a new meteor with random properties
  const createMeteor = useCallback((): Meteor => {
    const id = meteorIdRef.current++;
    
    
    // Start from upper portion of screen, varied positions
    const startX = 10 + Math.random() * 60; // 10-70% from left
    const startY = 2 + Math.random() * 25; // 2-27% from top
    
    // Angle between 25-55 degrees (diagonal downward)
    const angle = 25 + Math.random() * 30;
    
    // Varied lengths for visual interest
    const length = isSmallScreen 
      ? 60 + Math.random() * 80 
      : 100 + Math.random() * 150;
    
    // Duration varies with length
    const duration = 0.8 + Math.random() * 0.6;
    
    // Brightness variation
    const brightness = 0.6 + Math.random() * 0.4;
    
    return {
      id,
      startX,
      startY,
      angle,
      length,
      duration,
      delay: 0,
      brightness,
    };
  }, [isSmallScreen]);

  // Timer refs for proper cleanup
  const initialDelayRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Spawn meteors at random intervals
  useEffect(() => {
    if (prefersReducedMotion || particleScale === 0) return;

    const spawnMeteor = () => {
      const meteor = createMeteor();
      setActiveMeteors(prev => [...prev, meteor]);

      // Remove meteor after animation completes
      const cleanupTimeout = setTimeout(() => {
        setActiveMeteors(prev => prev.filter(m => m.id !== meteor.id));
      }, meteor.duration * 1000 + 500);
      cleanupTimeoutsRef.current.push(cleanupTimeout);
    };

    // Random chance for meteor shower (multiple meteors)
    const spawnEvent = () => {
      const isShower = Math.random() < 0.15;
      
      if (isShower) {
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const showerTimeout = setTimeout(spawnMeteor, i * (200 + Math.random() * 400));
          cleanupTimeoutsRef.current.push(showerTimeout);
        }
      } else {
        spawnMeteor();
      }
    };

    // Initial delay before first meteor
    initialDelayRef.current = setTimeout(() => {
      spawnEvent();
    }, 8000 + Math.random() * 5000);

    // Spawn meteors at random intervals (12-25 seconds)
    const scheduleNext = () => {
      const delay = 12000 + Math.random() * 13000;
      intervalRef.current = setTimeout(() => {
        spawnEvent();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
      if (intervalRef.current) clearTimeout(intervalRef.current);
      cleanupTimeoutsRef.current.forEach(t => clearTimeout(t));
      cleanupTimeoutsRef.current = [];
    };
  }, [prefersReducedMotion, particleScale, createMeteor]);

  // Static background meteors that loop continuously (subtle ambient effect)
  const ambientMeteors = useMemo(() => {
    if (particleScale === 0) return [];
    const count = isSmallScreen ? 2 : 3;
    return Array.from({ length: count }, (_, i) => ({
      id: `ambient-${i}`,
      startX: 15 + i * 30,
      startY: 5 + (i * 12) % 20,
      angle: 30 + (i * 8),
      length: isSmallScreen ? 50 : 80,
      duration: 1.5 + i * 0.3,
      delay: 5 + i * 15, // Reduced delays: 5s, 20s, 35s
      brightness: 0.3 + (i * 0.1),
    }));
  }, [particleScale, isSmallScreen]);

  if (prefersReducedMotion) return null;

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: CHRISTMAS_LAYERS.SHOOTING_STARS }}
      aria-hidden="true"
    >
      {/* Active randomly-spawned meteors */}
      {activeMeteors.map((meteor) => (
        <MeteorStreak key={meteor.id} meteor={meteor} />
      ))}

      {/* Subtle ambient meteors that loop in background */}
      {ambientMeteors.map((meteor) => (
        <MeteorStreak key={meteor.id} meteor={meteor} isAmbient />
      ))}
    </div>
  );
}

interface MeteorStreakProps {
  meteor: Meteor | {
    id: string;
    startX: number;
    startY: number;
    angle: number;
    length: number;
    duration: number;
    delay: number;
    brightness: number;
  };
  isAmbient?: boolean;
}

/**
 * Individual meteor streak with glowing head and fading tail
 */
function MeteorStreak({ meteor, isAmbient = false }: MeteorStreakProps) {
  const tailLength = meteor.length * 0.85;
  
  return (
    <div
      className="absolute"
      style={{
        '--angle': `${meteor.angle}deg`,
        left: `${meteor.startX}%`,
        top: `${meteor.startY}%`,
        animation: isAmbient 
          ? `meteorStreak ${meteor.duration}s ease-out infinite`
          : `meteorStreak ${meteor.duration}s ease-out forwards`,
        animationDelay: `${meteor.delay}s`,
        opacity: 0,
      } as React.CSSProperties}
    >
      {/* Meteor head - bright glowing point */}
      <div
        className="absolute rounded-full"
        style={{
          width: '4px',
          height: '4px',
          background: `radial-gradient(circle, 
            rgba(255,255,255,${meteor.brightness}) 0%, 
            rgba(200,220,255,${meteor.brightness * 0.8}) 40%, 
            rgba(150,180,255,${meteor.brightness * 0.4}) 70%, 
            transparent 100%)`,
          boxShadow: `
            0 0 6px 2px rgba(255,255,255,${meteor.brightness * 0.8}),
            0 0 12px 4px rgba(200,220,255,${meteor.brightness * 0.5}),
            0 0 20px 6px rgba(150,180,255,${meteor.brightness * 0.3})
          `,
        }}
      />

      {/* Main tail - gradient streak */}
      <div
        className="absolute"
        style={{
          left: '2px',
          top: '1px',
          width: `${tailLength}px`,
          height: '2px',
          background: `linear-gradient(90deg, 
            rgba(255,255,255,${meteor.brightness * 0.9}) 0%, 
            rgba(200,220,255,${meteor.brightness * 0.6}) 15%,
            rgba(150,180,255,${meteor.brightness * 0.3}) 40%,
            rgba(100,140,200,${meteor.brightness * 0.1}) 70%,
            transparent 100%)`,
          transformOrigin: 'left center',
          borderRadius: '0 1px 1px 0',
        }}
      />

      {/* Secondary thinner tail for depth */}
      <div
        className="absolute"
        style={{
          left: '2px',
          top: '1.5px',
          width: `${tailLength * 1.2}px`,
          height: '1px',
          background: `linear-gradient(90deg, 
            rgba(200,220,255,${meteor.brightness * 0.5}) 0%, 
            rgba(150,180,255,${meteor.brightness * 0.2}) 30%,
            transparent 100%)`,
          transformOrigin: 'left center',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Sparkle particles along the tail */}
      {[0.15, 0.35, 0.55, 0.75].map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${4 + tailLength * pos}px`,
            top: `${1 + (i % 2 === 0 ? -1 : 2)}px`,
            width: '1.5px',
            height: '1.5px',
            background: `rgba(255,255,255,${meteor.brightness * (0.6 - i * 0.12)})`,
            boxShadow: `0 0 2px rgba(200,220,255,${meteor.brightness * 0.4})`,
            animation: `meteorSparkle 0.3s ease-out ${i * 0.08}s infinite`,
          }}
        />
      ))}
    </div>
  );
}