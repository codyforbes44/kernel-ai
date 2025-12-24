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
 * Occasional meteor/comet effects that streak across the night sky.
 * Mobile-first optimized with fewer meteors and simplified effects.
 */
export function MeteorShower() {
  const { prefersReducedMotion, particleScale, isSmallScreen, isVerySmallScreen, deviceTier } = useChristmasPerformance();
  const [activeMeteors, setActiveMeteors] = useState<Meteor[]>([]);
  const meteorIdRef = useRef(0);

  // Simplified mode
  const isSimplified = deviceTier !== 'high';

  const createMeteor = useCallback((): Meteor => {
    const id = meteorIdRef.current++;
    const startX = 10 + Math.random() * 60;
    const startY = 2 + Math.random() * 25;
    const angle = 25 + Math.random() * 30;
    const length = isSmallScreen ? 50 + Math.random() * 60 : 80 + Math.random() * 100;
    const duration = 0.7 + Math.random() * 0.5;
    const brightness = 0.5 + Math.random() * 0.4;
    
    return { id, startX, startY, angle, length, duration, delay: 0, brightness };
  }, [isSmallScreen]);

  const initialDelayRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (prefersReducedMotion || particleScale === 0) return;

    const spawnMeteor = () => {
      const meteor = createMeteor();
      setActiveMeteors(prev => [...prev, meteor]);

      const cleanupTimeout = setTimeout(() => {
        setActiveMeteors(prev => prev.filter(m => m.id !== meteor.id));
      }, meteor.duration * 1000 + 500);
      cleanupTimeoutsRef.current.push(cleanupTimeout);
    };

    const spawnEvent = () => {
      // No showers on mobile - just single meteors
      if (isSimplified) {
        spawnMeteor();
        return;
      }
      
      const isShower = Math.random() < 0.12;
      if (isShower) {
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          const showerTimeout = setTimeout(spawnMeteor, i * (250 + Math.random() * 350));
          cleanupTimeoutsRef.current.push(showerTimeout);
        }
      } else {
        spawnMeteor();
      }
    };

    // Longer delays on mobile to reduce activity
    const baseDelay = isSimplified ? 15000 : 12000;
    const randomDelay = isSimplified ? 18000 : 13000;

    initialDelayRef.current = setTimeout(() => {
      spawnEvent();
    }, 10000 + Math.random() * 5000);

    const scheduleNext = () => {
      const delay = baseDelay + Math.random() * randomDelay;
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
  }, [prefersReducedMotion, particleScale, createMeteor, isSimplified]);

  // Ambient meteors - fewer on mobile
  const ambientMeteors = useMemo(() => {
    if (particleScale === 0) return [];
    const count = isVerySmallScreen ? 1 : isSmallScreen ? 2 : 3;
    return Array.from({ length: count }, (_, i) => ({
      id: `ambient-${i}`,
      startX: 15 + i * 30,
      startY: 5 + (i * 12) % 20,
      angle: 30 + (i * 8),
      length: isSmallScreen ? 40 : 70,
      duration: 1.3 + i * 0.3,
      delay: 8 + i * 18,
      brightness: 0.25 + (i * 0.08),
    }));
  }, [particleScale, isSmallScreen, isVerySmallScreen]);

  if (prefersReducedMotion) return null;

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: CHRISTMAS_LAYERS.SHOOTING_STARS }}
      aria-hidden="true"
    >
      {activeMeteors.map((meteor) => (
        <MeteorStreak key={meteor.id} meteor={meteor} simplified={isSimplified} />
      ))}

      {ambientMeteors.map((meteor) => (
        <MeteorStreak key={meteor.id} meteor={meteor} isAmbient simplified={isSimplified} />
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
  simplified?: boolean;
}

/**
 * Individual meteor streak - simplified on mobile
 */
function MeteorStreak({ meteor, isAmbient = false, simplified = false }: MeteorStreakProps) {
  const tailLength = meteor.length * 0.8;
  
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
      {/* Meteor head */}
      <div
        className="absolute rounded-full"
        style={{
          width: simplified ? '3px' : '4px',
          height: simplified ? '3px' : '4px',
          background: `radial-gradient(circle, 
            rgba(255,255,255,${meteor.brightness}) 0%, 
            rgba(200,220,255,${meteor.brightness * 0.7}) 50%, 
            transparent 100%)`,
          boxShadow: simplified 
            ? `0 0 4px rgba(255,255,255,${meteor.brightness * 0.7})`
            : `0 0 6px 2px rgba(255,255,255,${meteor.brightness * 0.8}), 0 0 12px 4px rgba(200,220,255,${meteor.brightness * 0.4})`,
        }}
      />

      {/* Main tail */}
      <div
        className="absolute"
        style={{
          left: '2px',
          top: '1px',
          width: `${tailLength}px`,
          height: simplified ? '1.5px' : '2px',
          background: `linear-gradient(90deg, 
            rgba(255,255,255,${meteor.brightness * 0.8}) 0%, 
            rgba(200,220,255,${meteor.brightness * 0.5}) 20%,
            rgba(150,180,255,${meteor.brightness * 0.2}) 50%,
            transparent 100%)`,
          transformOrigin: 'left center',
          borderRadius: '0 1px 1px 0',
        }}
      />

      {/* Sparkle particles - desktop only */}
      {!simplified && [0.2, 0.45, 0.7].map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${4 + tailLength * pos}px`,
            top: `${1 + (i % 2 === 0 ? -1 : 1.5)}px`,
            width: '1px',
            height: '1px',
            background: `rgba(255,255,255,${meteor.brightness * (0.5 - i * 0.1)})`,
            boxShadow: `0 0 2px rgba(200,220,255,${meteor.brightness * 0.3})`,
          }}
        />
      ))}
    </div>
  );
}
