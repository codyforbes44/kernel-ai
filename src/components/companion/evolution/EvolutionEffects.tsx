import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { EvolutionTier } from '@/constants/evolution';

interface EvolutionEffectsProps {
  tier: EvolutionTier;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function EvolutionEffects({ tier, size = 'md', children }: EvolutionEffectsProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const renderParticles = () => {
    if (tier.particleEffect === 'none') return null;

    if (tier.particleEffect === 'sparkle') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400 rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 30],
                y: [0, (Math.random() - 0.5) * 30],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
            />
          ))}
        </div>
      );
    }

    if (tier.particleEffect === 'glow') {
      return (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ backgroundColor: tier.glowColor }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      );
    }

    if (tier.particleEffect === 'aura') {
      return (
        <>
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ 
              background: `radial-gradient(circle, ${tier.glowColor} 0%, transparent 70%)` 
            }}
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ 
              background: `radial-gradient(circle, ${tier.glowColor} 0%, transparent 50%)` 
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1.1, 1.25, 1.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        </>
      );
    }

    if (tier.particleEffect === 'cosmic') {
      return (
        <>
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ 
              background: `radial-gradient(circle, rgba(185, 242, 255, 0.4) 0%, transparent 60%)` 
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                x: [0, Math.cos((i / 6) * Math.PI * 2) * 25],
                y: [0, Math.sin((i / 6) * Math.PI * 2) * 25],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
              initial={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </>
      );
    }

    return null;
  };

  return (
    <div className={cn('relative', sizeClasses[size])}>
      {renderParticles()}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
