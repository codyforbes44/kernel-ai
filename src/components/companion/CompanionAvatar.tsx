import { cn } from '@/lib/utils';
import { PERSONALITY_ICONS, PERSONALITY_COLORS } from '@/constants/companion';

interface CompanionAvatarProps {
  personalityType: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-lg',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-20 w-20 text-4xl',
};

export function CompanionAvatar({ personalityType, avatarUrl, size = 'md', className }: CompanionAvatarProps) {
  const icon = PERSONALITY_ICONS[personalityType] || PERSONALITY_ICONS.mentor;
  
  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={`${personalityType} companion`}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }
  
  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center bg-muted',
        sizeClasses[size],
        className
      )}
      style={{ 
        boxShadow: `0 0 0 2px ${PERSONALITY_COLORS[personalityType] || PERSONALITY_COLORS.mentor}` 
      }}
    >
      <span>{icon}</span>
    </div>
  );
}
