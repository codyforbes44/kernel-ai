import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface KernelCoreAnimationProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showNodes?: boolean;
  isPaused?: boolean;
}

const sizeMap = {
  xs: { container: 100, core: 20, ring: 32, nodes: 4 },
  sm: { container: 140, core: 28, ring: 48, nodes: 5 },
  md: { container: 200, core: 36, ring: 60, nodes: 6 },
  lg: { container: 280, core: 44, ring: 80, nodes: 8 },
  xl: { container: 380, core: 56, ring: 100, nodes: 10 },
};

// Outer service nodes that receive power from the core
const serviceNodes = [
  { label: 'AI', angle: 0 },
  { label: 'DB', angle: 45 },
  { label: 'UI', angle: 90 },
  { label: 'API', angle: 135 },
  { label: 'AUTH', angle: 180 },
  { label: 'CDN', angle: 225 },
  { label: 'FN', angle: 270 },
  { label: 'LOG', angle: 315 },
];

// Core glyph component
const CoreGlyph = memo(({ size }: { size: number }) => (
  <motion.div
    className="absolute inset-0 flex items-center justify-center font-mono font-bold text-primary-foreground"
    style={{ fontSize: size * 0.4 }}
    animate={{
      textShadow: [
        '0 0 10px hsl(var(--primary) / 0.5)',
        '0 0 20px hsl(var(--primary) / 0.8)',
        '0 0 10px hsl(var(--primary) / 0.5)',
      ],
    }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    {'>_'}
  </motion.div>
));
CoreGlyph.displayName = 'CoreGlyph';

// Pulsing core center
const PulsingCore = memo(({ size, isPaused }: { size: number; isPaused: boolean }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-br from-primary to-accent"
    style={{
      width: size,
      height: size,
      left: '50%',
      top: '50%',
      marginLeft: -size / 2,
      marginTop: -size / 2,
    }}
    animate={isPaused ? {} : {
      scale: [1, 1.15, 1],
      boxShadow: [
        '0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2), inset 0 0 20px hsl(var(--primary-foreground) / 0.1)',
        '0 0 40px hsl(var(--primary) / 0.6), 0 0 80px hsl(var(--primary) / 0.3), inset 0 0 30px hsl(var(--primary-foreground) / 0.15)',
        '0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2), inset 0 0 20px hsl(var(--primary-foreground) / 0.1)',
      ],
    }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <CoreGlyph size={size} />
  </motion.div>
));
PulsingCore.displayName = 'PulsingCore';

// Energy ring that expands outward
const EnergyRing = memo(({ 
  delay, 
  maxRadius, 
  isPaused 
}: { 
  delay: number; 
  maxRadius: number; 
  isPaused: boolean;
}) => (
  <motion.div
    className="absolute rounded-full border border-primary/30"
    style={{
      left: '50%',
      top: '50%',
    }}
    initial={{ width: 0, height: 0, marginLeft: 0, marginTop: 0, opacity: 0.8 }}
    animate={isPaused ? {} : {
      width: [0, maxRadius * 2],
      height: [0, maxRadius * 2],
      marginLeft: [0, -maxRadius],
      marginTop: [0, -maxRadius],
      opacity: [0.8, 0],
      borderWidth: [2, 0.5],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay,
      ease: 'easeOut',
    }}
  />
));
EnergyRing.displayName = 'EnergyRing';

// Orbital ring
const OrbitalRing = memo(({ 
  radius, 
  rotationDuration, 
  isPaused,
  reverse = false,
}: { 
  radius: number; 
  rotationDuration: number; 
  isPaused: boolean;
  reverse?: boolean;
}) => (
  <motion.div
    className="absolute rounded-full border border-primary/20"
    style={{
      width: radius * 2,
      height: radius * 2,
      left: '50%',
      top: '50%',
      marginLeft: -radius,
      marginTop: -radius,
    }}
    animate={isPaused ? {} : { rotate: reverse ? -360 : 360 }}
    transition={{ duration: rotationDuration, repeat: Infinity, ease: 'linear' }}
  >
    {/* Orbiting particle */}
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-primary"
      style={{
        top: -4,
        left: '50%',
        marginLeft: -4,
        boxShadow: '0 0 10px hsl(var(--primary) / 0.8)',
      }}
    />
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full bg-accent"
      style={{
        bottom: -3,
        left: '50%',
        marginLeft: -3,
        boxShadow: '0 0 8px hsl(var(--accent) / 0.8)',
      }}
    />
  </motion.div>
));
OrbitalRing.displayName = 'OrbitalRing';

// Power stream connecting core to nodes
const PowerStream = memo(({ 
  angle, 
  length, 
  isPaused 
}: { 
  angle: number; 
  length: number; 
  isPaused: boolean;
}) => {
  const radians = (angle * Math.PI) / 180;
  const endX = Math.cos(radians) * length;
  const endY = Math.sin(radians) * length;
  
  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        width: length * 2 + 20,
        height: length * 2 + 20,
        marginLeft: -(length + 10),
        marginTop: -(length + 10),
        overflow: 'visible',
      }}
    >
      <defs>
        <linearGradient id={`stream-gradient-${angle}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <motion.line
        x1={length + 10}
        y1={length + 10}
        x2={length + 10 + endX * 0.6}
        y2={length + 10 + endY * 0.6}
        stroke={`url(#stream-gradient-${angle})`}
        strokeWidth="1"
        strokeDasharray="4 4"
        animate={isPaused ? {} : { strokeDashoffset: [0, -16] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  );
});
PowerStream.displayName = 'PowerStream';

// Service node that receives power
const ServiceNode = memo(({ 
  angle, 
  radius, 
  label, 
  isPaused,
  index,
}: { 
  angle: number; 
  radius: number; 
  label: string; 
  isPaused: boolean;
  index: number;
}) => {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * radius;
  const y = Math.sin(radians) * radius;
  
  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{
        left: '50%',
        top: '50%',
        marginLeft: x - 16,
        marginTop: y - 16,
        width: 32,
        height: 32,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={isPaused ? { opacity: 1, scale: 1 } : {
        opacity: [0.6, 1, 0.6],
        scale: [0.95, 1.05, 0.95],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: index * 0.2,
        ease: 'easeInOut',
      }}
    >
      <div 
        className="w-full h-full rounded-lg bg-secondary/80 border border-primary/30 flex items-center justify-center backdrop-blur-sm"
        style={{
          boxShadow: '0 0 10px hsl(var(--primary) / 0.2)',
        }}
      >
        <span className="text-[10px] font-mono font-medium text-primary">
          {label}
        </span>
      </div>
    </motion.div>
  );
});
ServiceNode.displayName = 'ServiceNode';

// Data particles flowing from core
const DataParticle = memo(({ 
  angle, 
  maxRadius, 
  delay, 
  isPaused 
}: { 
  angle: number; 
  maxRadius: number; 
  delay: number; 
  isPaused: boolean;
}) => {
  const radians = (angle * Math.PI) / 180;
  
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-primary"
      style={{
        left: '50%',
        top: '50%',
        boxShadow: '0 0 6px hsl(var(--primary))',
      }}
      animate={isPaused ? {} : {
        x: [0, Math.cos(radians) * maxRadius * 0.8],
        y: [0, Math.sin(radians) * maxRadius * 0.8],
        opacity: [1, 0],
        scale: [1, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
    />
  );
});
DataParticle.displayName = 'DataParticle';

export const KernelCoreAnimation = memo(({ 
  size = 'md', 
  className = '',
  showNodes = true,
  isPaused = false,
}: KernelCoreAnimationProps) => {
  const config = sizeMap[size];
  
  // Generate energy rings
  const energyRings = useMemo(() => 
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      delay: i * 1,
      maxRadius: config.ring * (1.5 + i * 0.4),
    })),
    [config.ring]
  );
  
  // Generate data particles
  const particles = useMemo(() => 
    Array.from({ length: config.nodes }, (_, i) => ({
      id: i,
      angle: (360 / config.nodes) * i,
      delay: i * 0.15,
    })),
    [config.nodes]
  );
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: config.container, 
        height: config.container,
      }}
    >
      {/* Background glow */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
        }}
      />
      
      {/* Energy rings expanding outward */}
      {energyRings.map((ring) => (
        <EnergyRing 
          key={ring.id} 
          delay={ring.delay} 
          maxRadius={ring.maxRadius}
          isPaused={isPaused}
        />
      ))}
      
      {/* Power streams to nodes */}
      {showNodes && serviceNodes.slice(0, config.nodes > 8 ? 8 : config.nodes).map((node) => (
        <PowerStream 
          key={node.angle} 
          angle={node.angle} 
          length={config.container / 2 - 20}
          isPaused={isPaused}
        />
      ))}
      
      {/* Orbital rings */}
      <OrbitalRing 
        radius={config.ring * 0.9} 
        rotationDuration={12}
        isPaused={isPaused}
      />
      <OrbitalRing 
        radius={config.ring * 1.3} 
        rotationDuration={20}
        isPaused={isPaused}
        reverse
      />
      
      {/* Data particles flowing outward */}
      {particles.map((particle) => (
        <DataParticle
          key={particle.id}
          angle={particle.angle}
          maxRadius={config.container / 2}
          delay={particle.delay}
          isPaused={isPaused}
        />
      ))}
      
      {/* Service nodes around the perimeter */}
      {showNodes && serviceNodes.slice(0, config.nodes > 8 ? 8 : config.nodes).map((node, index) => (
        <ServiceNode
          key={node.label}
          angle={node.angle}
          radius={config.container / 2 - 24}
          label={node.label}
          isPaused={isPaused}
          index={index}
        />
      ))}
      
      {/* Central pulsing core */}
      <PulsingCore size={config.core} isPaused={isPaused} />
    </div>
  );
});

KernelCoreAnimation.displayName = 'KernelCoreAnimation';

export default KernelCoreAnimation;
