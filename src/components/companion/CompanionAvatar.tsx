import { cn } from '@/lib/utils';
import { PERSONALITY_ICONS, PERSONALITY_COLORS } from '@/constants/companion';
import { motion } from 'framer-motion';

interface CompanionAvatarProps {
  personalityType: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
  isActive?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-lg',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-20 w-20 text-4xl',
  xl: 'h-28 w-28 text-5xl',
};

const glowSizes = {
  sm: 'shadow-[0_0_10px_2px]',
  md: 'shadow-[0_0_15px_3px]',
  lg: 'shadow-[0_0_20px_4px]',
  xl: 'shadow-[0_0_25px_5px]',
};

export function CompanionAvatar({ 
  personalityType, 
  avatarUrl, 
  size = 'md', 
  className,
  showGlow = false,
  isActive = false 
}: CompanionAvatarProps) {
  const icon = PERSONALITY_ICONS[personalityType] || PERSONALITY_ICONS.mentor;
  const color = PERSONALITY_COLORS[personalityType] || PERSONALITY_COLORS.mentor;
  
  const avatarContent = avatarUrl ? (
    <img 
      src={avatarUrl} 
      alt={`${personalityType} companion`}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        showGlow && glowSizes[size],
        className
      )}
      style={{ 
        boxShadow: showGlow ? `0 0 20px 4px ${color}` : undefined,
        border: `2px solid ${color}`
      }}
    />
  ) : (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50',
        sizeClasses[size],
        showGlow && glowSizes[size],
        className
      )}
      style={{ 
        boxShadow: showGlow ? `0 0 20px 4px ${color}` : `0 0 0 2px ${color}`,
      }}
    >
      <span>{icon}</span>
    </div>
  );

  if (isActive) {
    return (
      <motion.div
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {avatarContent}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${color}` }}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ 
            opacity: [0.5, 0, 0.5],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.div>
    );
  }
  
  return avatarContent;
}
