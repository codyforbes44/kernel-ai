import { cn } from '@/lib/utils';
import { PERSONALITY_COLORS, PERSONALITY_ICONS } from '@/constants/companion';
import { getEvolutionTier, AVATAR_FRAMES } from '@/constants/evolution';
import { EvolutionEffects } from './EvolutionEffects';
import { EvolutionBadge } from './EvolutionBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface EvolvedAvatarProps {
  personalityType: string;
  avatarUrl?: string | null;
  affinity: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-lg',
  md: 'h-10 w-10 text-xl',
  lg: 'h-12 w-12 text-2xl',
  xl: 'h-16 w-16 text-3xl',
};

export function EvolvedAvatar({
  personalityType,
  avatarUrl,
  affinity,
  size = 'md',
  showBadge = false,
  showTooltip = true,
  className,
}: EvolvedAvatarProps) {
  const tier = getEvolutionTier(affinity);
  const icon = PERSONALITY_ICONS[personalityType] || PERSONALITY_ICONS.mentor;
  const color = PERSONALITY_COLORS[personalityType] || PERSONALITY_COLORS.mentor;
  
  const effectSizes: Record<string, 'sm' | 'md' | 'lg'> = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
  };

  const frameClass = tier.avatarFrame ? AVATAR_FRAMES[tier.avatarFrame] : '';

  const avatarContent = (
    <div className={cn('relative', className)}>
      <EvolutionEffects tier={tier} size={effectSizes[size]}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={`${personalityType} companion`}
            className={cn(
              'rounded-full object-cover',
              sizeClasses[size],
              frameClass,
              'transition-all duration-300'
            )}
            style={{ border: `2px solid ${color}` }}
          />
        ) : (
          <div 
            className={cn(
              'rounded-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50',
              sizeClasses[size],
              frameClass,
              'transition-all duration-300'
            )}
            style={{ boxShadow: `0 0 0 2px ${color}` }}
          >
            <span>{icon}</span>
          </div>
        )}
      </EvolutionEffects>
      
      {showBadge && (
        <div className="absolute -bottom-1 -right-1 z-20">
          <EvolutionBadge affinity={affinity} showTitle={false} size="sm" />
        </div>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {avatarContent}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{tier.title}</p>
              <p className="text-xs text-muted-foreground">{tier.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return avatarContent;
}
