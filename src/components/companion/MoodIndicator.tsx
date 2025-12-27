import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MoodIndicatorProps {
  mood: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const MOOD_CONFIG: Record<string, { color: string; emoji: string; label: string }> = {
  happy: { color: 'bg-green-500', emoji: '😊', label: 'Happy' },
  curious: { color: 'bg-blue-500', emoji: '🤔', label: 'Curious' },
  empathetic: { color: 'bg-purple-500', emoji: '💜', label: 'Understanding' },
  excited: { color: 'bg-yellow-500', emoji: '🎉', label: 'Excited' },
  inquisitive: { color: 'bg-cyan-500', emoji: '🧐', label: 'Inquisitive' },
  playful: { color: 'bg-pink-500', emoji: '😄', label: 'Playful' },
  thoughtful: { color: 'bg-indigo-500', emoji: '💭', label: 'Thoughtful' },
  focused: { color: 'bg-slate-500', emoji: '🎯', label: 'Focused' },
  warm: { color: 'bg-orange-500', emoji: '🤗', label: 'Warm' },
  supportive: { color: 'bg-teal-500', emoji: '💚', label: 'Supportive' },
  neutral: { color: 'bg-gray-400', emoji: '😌', label: 'Calm' },
};

const sizeConfig = {
  sm: { dot: 'h-2 w-2', text: 'text-xs', emoji: 'text-sm' },
  md: { dot: 'h-3 w-3', text: 'text-sm', emoji: 'text-base' },
  lg: { dot: 'h-4 w-4', text: 'text-base', emoji: 'text-lg' },
};

export function MoodIndicator({ mood, size = 'md', showLabel = true, className }: MoodIndicatorProps) {
  const config = MOOD_CONFIG[mood] || MOOD_CONFIG.neutral;
  const sizes = sizeConfig[size];
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={mood}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className={cn('flex items-center gap-1.5', className)}
      >
        {/* Animated emoji */}
        <motion.span
          className={sizes.emoji}
          animate={{ 
            y: [0, -2, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {config.emoji}
        </motion.span>
        
        {/* Pulsing dot */}
        <motion.div 
          className={cn(
            'rounded-full',
            config.color,
            sizes.dot
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Label */}
        {showLabel && (
          <span className={cn('text-muted-foreground', sizes.text)}>
            {config.label}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
