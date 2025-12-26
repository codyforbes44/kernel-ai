import { motion } from 'framer-motion';
import { memo, useMemo, useState } from 'react';

interface KernelAILogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isPaused?: boolean;
  interactive?: boolean;
}

const sizeMap = {
  xs: { fontSize: 16, particleCount: 0, glowSize: 40, showEffects: false },
  sm: { fontSize: 24, particleCount: 4, glowSize: 60, showEffects: true },
  md: { fontSize: 36, particleCount: 6, glowSize: 100, showEffects: true },
  lg: { fontSize: 48, particleCount: 8, glowSize: 140, showEffects: true },
  xl: { fontSize: 64, particleCount: 10, glowSize: 180, showEffects: true },
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
const AnimatedText = memo(({ fontSize, isPaused, isHovered }: { fontSize: number; isPaused: boolean; isHovered: boolean }) => (
  <motion.span
    className="relative font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
    style={{ 
      fontSize,
      backgroundSize: '200% 100%',
      WebkitBackgroundClip: 'text',
    }}
    animate={isPaused && !isHovered ? {} : {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    }}
    transition={{ duration: isHovered ? 2 : 6, repeat: Infinity, ease: 'linear' }}
  >
    <motion.span
      className="relative inline-block"
      style={{
        textShadow: 'none',
        filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))',
      }}
      animate={{
        filter: isHovered 
          ? 'drop-shadow(0 0 20px hsl(var(--primary) / 0.6))'
          : isPaused 
            ? 'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))'
            : [
                'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))',
                'drop-shadow(0 0 25px hsl(var(--primary) / 0.5))',
                'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))',
              ],
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{ duration: isHovered ? 0.2 : 3, repeat: isHovered ? 0 : Infinity, ease: 'easeInOut' }}
    >
      Kernel AI
    </motion.span>
  </motion.span>
));
AnimatedText.displayName = 'AnimatedText';

// Compact text for xs size with hover glow
const CompactText = memo(({ fontSize, isHovered }: { fontSize: number; isHovered: boolean }) => (
  <motion.span
    className="font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap"
    style={{ 
      fontSize,
      WebkitBackgroundClip: 'text',
    }}
    animate={{
      filter: isHovered 
        ? 'drop-shadow(0 0 12px hsl(var(--primary) / 0.5))'
        : 'drop-shadow(0 0 4px hsl(var(--primary) / 0.2))',
      scale: isHovered ? 1.02 : 1,
    }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    Kernel AI
  </motion.span>
));
CompactText.displayName = 'CompactText';

export const KernelAILogo = memo(({ 
  size = 'md', 
  className = '',
  isPaused = false,
  interactive = false,
}: KernelAILogoProps) => {
  const config = sizeMap[size];
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate orbiting particles
  const particles = useMemo(() => 
    config.showEffects 
      ? Array.from({ length: config.particleCount }, (_, i) => ({
          id: i,
          radius: config.glowSize * 0.8,
        }))
      : [],
    [config.particleCount, config.glowSize, config.showEffects]
  );

  // Compact version for xs size
  if (size === 'xs') {
    return (
      <motion.div
        className={`relative inline-flex items-center cursor-pointer ${className}`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{ padding: '4px 0' }}
      >
        <CompactText fontSize={config.fontSize} isHovered={isHovered || interactive} />
        
        {/* Subtle underline on hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/0 via-primary to-primary/0"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: isHovered ? 1 : 0, 
            opacity: isHovered ? 1 : 0 
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ 
        padding: `${config.fontSize * 0.5}px ${config.fontSize}px`,
        minHeight: config.fontSize * 2,
      }}
      onHoverStart={() => interactive && setIsHovered(true)}
      onHoverEnd={() => interactive && setIsHovered(false)}
    >
      {/* Background glow */}
      {config.showEffects && (
        <BackgroundGlow size={config.glowSize} isPaused={isPaused && !isHovered} />
      )}
      
      {/* Orbiting particles */}
      {particles.map((particle) => (
        <OrbitingParticle
          key={particle.id}
          index={particle.id}
          total={config.particleCount}
          radius={particle.radius}
          isPaused={isPaused && !isHovered}
        />
      ))}
      
      {/* Main text container */}
      <div className="relative overflow-hidden">
        <AnimatedText fontSize={config.fontSize} isPaused={isPaused} isHovered={isHovered} />
        {config.showEffects && <ShimmerOverlay isPaused={isPaused && !isHovered} />}
      </div>
      
      {/* Animated underline */}
      {config.showEffects && <AnimatedUnderline isPaused={isPaused && !isHovered} />}
    </motion.div>
  );
});

KernelAILogo.displayName = 'KernelAILogo';

export default KernelAILogo;
