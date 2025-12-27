import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Star, Crown, Gem, Zap, Heart } from 'lucide-react';
import { getEvolutionTier, type EvolutionTier } from '@/constants/evolution';

interface EvolutionBadgeProps {
  affinity: number;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TIER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  newcomer: Heart,
  familiar: Sparkles,
  companion: Star,
  confidant: Zap,
  soulmate: Crown,
  eternal: Gem,
};

export function EvolutionBadge({ 
  affinity, 
  showTitle = true, 
  size = 'md',
  className 
}: EvolutionBadgeProps) {
  const tier = getEvolutionTier(affinity);
  const Icon = TIER_ICONS[tier.id] || Heart;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        tier.badgeColor,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showTitle && <span>{tier.title}</span>}
    </motion.div>
  );
}
