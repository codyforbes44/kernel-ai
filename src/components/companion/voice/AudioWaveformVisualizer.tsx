import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AudioWaveformVisualizerProps {
  audioLevel: number;
  isActive: boolean;
  variant?: 'bars' | 'wave';
  className?: string;
  barCount?: number;
}

export function AudioWaveformVisualizer({
  audioLevel,
  isActive,
  variant = 'bars',
  className,
  barCount = 16,
}: AudioWaveformVisualizerProps) {
  if (variant === 'wave') {
    return (
      <div className={cn("flex items-center justify-center gap-0.5 h-12", className)}>
        {Array.from({ length: barCount }).map((_, i) => {
          const offset = Math.sin((i / barCount) * Math.PI * 2);
          const height = isActive 
            ? 8 + audioLevel * 32 * (0.5 + 0.5 * Math.abs(offset))
            : 4;
          
          return (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full"
              animate={{
                height: height,
                opacity: isActive ? 0.6 + audioLevel * 0.4 : 0.3,
              }}
              transition={{
                duration: 0.1,
                ease: 'easeOut',
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex items-end justify-center gap-1 h-12", className)}>
      {Array.from({ length: barCount }).map((_, i) => {
        // Create a more dynamic pattern
        const baseHeight = 4;
        const maxAdditional = 28;
        const phase = (i / barCount) * Math.PI;
        const variation = Math.sin(phase) * 0.5 + 0.5;
        const targetHeight = isActive 
          ? baseHeight + audioLevel * maxAdditional * variation
          : baseHeight;
        
        return (
          <motion.div
            key={i}
            className={cn(
              "w-1 rounded-full transition-colors",
              isActive ? "bg-primary" : "bg-muted-foreground/30"
            )}
            animate={{
              height: targetHeight,
            }}
            transition={{
              duration: 0.05,
              ease: 'linear',
            }}
          />
        );
      })}
    </div>
  );
}