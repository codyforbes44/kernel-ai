import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface KernelAILogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isPaused?: boolean;
}

const sizeMap = {
  sm: { fontSize: 24, particleCount: 4, glowSize: 60 },
  md: { fontSize: 36, particleCount: 6, glowSize: 100 },
  lg: { fontSize: 48, particleCount: 8, glowSize: 140 },
  xl: { fontSize: 64, particleCount: 10, glowSize: 180 },
};

// Background glow aura
const BackgroundGlow = memo(({ size, isPaused }: { size: number; isPaused: boolean }) => (
  <motion.div
    className="absolute inset-0 -z-10 pointer-events-none"
    style={{
      background: `radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
      filter: 'blur(20px)',
    }}
    animate={isPaused ? {} : {
      opacity: [0.4, 0.7, 0.4],
      scale: [0.98, 1.02, 0.98],
    }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
  />
));
BackgroundGlow.displayName = 'BackgroundGlow';

// Shimmer overlay that sweeps across text
const ShimmerOverlay = memo(({ isPaused }: { isPaused: boolean }) => (
  <motion.div
    className="absolute inset-0 pointer-events-none overflow-hidden"
    style={{
      background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary-foreground) / 0.15) 50%, transparent 100%)',
      width: '50%',
    }}
    animate={isPaused ? {} : { x: ['-100%', '300%'] }}
    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
  />
));
ShimmerOverlay.displayName = 'ShimmerOverlay';

// Orbiting particle around text
const OrbitingParticle = memo(({ 
  index, 
  total, 
  radius, 
  isPaused 
}: { 
  index: number; 
  total: number; 
  radius: number; 
  isPaused: boolean;
}) => {
  const startAngle = (360 / total) * index;
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
      }}
      animate={isPaused ? {} : { rotate: [startAngle, startAngle + 360] }}
      transition={{ duration: 8 + index * 0.5, repeat: Infinity, ease: 'linear' }}
    >
      <motion.div
        className="rounded-full bg-primary"
        style={{
          width: 4,
          height: 4,
          marginLeft: radius,
          marginTop: -2,
          boxShadow: '0 0 8px hsl(var(--primary) / 0.8)',
        }}
        animate={isPaused ? {} : {
          opacity: [0.5, 1, 0.5],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
      />
    </motion.div>
  );
});
OrbitingParticle.displayName = 'OrbitingParticle';

// Animated underline accent
const AnimatedUnderline = memo(({ isPaused }: { isPaused: boolean }) => (
  <motion.div
    className="absolute bottom-0 left-1/2 h-[2px] rounded-full"
    style={{
      background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)), transparent)',
      transformOrigin: 'center',
    }}
    initial={{ width: 0, x: '-50%' }}
    animate={isPaused ? { width: '80%', x: '-50%' } : {
      width: ['60%', '90%', '60%'],
      x: '-50%',
      opacity: [0.6, 1, 0.6],
    }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
  />
));
AnimatedUnderline.displayName = 'AnimatedUnderline';

// Main animated text
const AnimatedText = memo(({ fontSize, isPaused }: { fontSize: number; isPaused: boolean }) => (
  <motion.span
    className="relative font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
    style={{ 
      fontSize,
      backgroundSize: '200% 100%',
      WebkitBackgroundClip: 'text',
    }}
    animate={isPaused ? {} : {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    }}
    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
  >
    <motion.span
      className="relative inline-block"
      style={{
        textShadow: 'none',
        filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))',
      }}
      animate={isPaused ? {} : {
        filter: [
          'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))',
          'drop-shadow(0 0 25px hsl(var(--primary) / 0.5))',
          'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))',
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      Kernel AI
    </motion.span>
  </motion.span>
));
AnimatedText.displayName = 'AnimatedText';

export const KernelAILogo = memo(({ 
  size = 'md', 
  className = '',
  isPaused = false,
}: KernelAILogoProps) => {
  const config = sizeMap[size];
  
  // Generate orbiting particles
  const particles = useMemo(() => 
    Array.from({ length: config.particleCount }, (_, i) => ({
      id: i,
      radius: config.glowSize * 0.8,
    })),
    [config.particleCount, config.glowSize]
  );
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ 
        padding: `${config.fontSize * 0.5}px ${config.fontSize}px`,
        minHeight: config.fontSize * 2,
      }}
    >
      {/* Background glow */}
      <BackgroundGlow size={config.glowSize} isPaused={isPaused} />
      
      {/* Orbiting particles */}
      {particles.map((particle) => (
        <OrbitingParticle
          key={particle.id}
          index={particle.id}
          total={config.particleCount}
          radius={particle.radius}
          isPaused={isPaused}
        />
      ))}
      
      {/* Main text container */}
      <div className="relative overflow-hidden">
        <AnimatedText fontSize={config.fontSize} isPaused={isPaused} />
        <ShimmerOverlay isPaused={isPaused} />
      </div>
      
      {/* Animated underline */}
      <AnimatedUnderline isPaused={isPaused} />
    </div>
  );
});

KernelAILogo.displayName = 'KernelAILogo';

export default KernelAILogo;
