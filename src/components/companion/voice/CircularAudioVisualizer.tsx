import { motion } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CircularAudioVisualizerProps {
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { outer: 64, inner: 48, icon: 16, rings: 2 },
  md: { outer: 96, inner: 64, icon: 24, rings: 3 },
  lg: { outer: 128, inner: 80, icon: 32, rings: 4 },
};

export function CircularAudioVisualizer({
  audioLevel,
  isListening,
  isSpeaking,
  size = 'md',
  className,
}: CircularAudioVisualizerProps) {
  const config = sizeConfig[size];
  const isActive = isListening || isSpeaking;
  
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: config.outer, height: config.outer }}
    >
      {/* Animated rings */}
      {Array.from({ length: config.rings }).map((_, i) => {
        const ringScale = 1 + (i * 0.15) + (audioLevel * 0.3 * (i + 1));
        const opacity = isActive ? (0.3 - i * 0.08) * (0.5 + audioLevel * 0.5) : 0.1;
        
        return (
          <motion.div
            key={i}
            className={cn(
              "absolute rounded-full border-2",
              isSpeaking ? "border-primary" : "border-primary/60"
            )}
            style={{
              width: config.inner,
              height: config.inner,
            }}
            animate={{
              scale: ringScale,
              opacity: opacity,
            }}
            transition={{
              duration: 0.15,
              ease: 'easeOut',
            }}
          />
        );
      })}
      
      {/* Main circle */}
      <motion.div
        className={cn(
          "absolute rounded-full flex items-center justify-center",
          isActive ? "bg-primary/20" : "bg-muted"
        )}
        style={{
          width: config.inner,
          height: config.inner,
        }}
        animate={{
          scale: 1 + audioLevel * 0.1,
        }}
        transition={{
          duration: 0.1,
        }}
      >
        {isSpeaking ? (
          <Volume2 
            className="text-primary" 
            style={{ width: config.icon, height: config.icon }}
          />
        ) : (
          <Mic 
            className={cn(
              isListening ? "text-primary" : "text-muted-foreground"
            )}
            style={{ width: config.icon, height: config.icon }}
          />
        )}
      </motion.div>
      
      {/* Audio level indicator ring */}
      {isActive && (
        <svg
          className="absolute inset-0"
          style={{ width: config.outer, height: config.outer }}
        >
          <motion.circle
            cx={config.outer / 2}
            cy={config.outer / 2}
            r={(config.outer - 4) / 2}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: audioLevel }}
            transition={{ duration: 0.1 }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
            }}
          />
        </svg>
      )}
    </div>
  );
}