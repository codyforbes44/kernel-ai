import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ChevronRight, Sparkles } from 'lucide-react';
import { 
  getEvolutionTier, 
  getNextEvolutionTier, 
  getEvolutionProgress,
  EVOLUTION_TIERS 
} from '@/constants/evolution';
import { EvolutionBadge } from './EvolutionBadge';

interface EvolutionProgressProps {
  affinity: number;
  showAllTiers?: boolean;
  className?: string;
}

export function EvolutionProgress({ 
  affinity, 
  showAllTiers = false,
  className 
}: EvolutionProgressProps) {
  const currentTier = getEvolutionTier(affinity);
  const nextTier = getNextEvolutionTier(affinity);
  const progress = getEvolutionProgress(affinity);

  if (showAllTiers) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Evolution Journey</h4>
          <span className="text-xs text-muted-foreground">
            Affinity: {affinity}
          </span>
        </div>
        
        <div className="space-y-3">
          {EVOLUTION_TIERS.map((tier, index) => {
            const isCurrentTier = tier.id === currentTier.id;
            const isCompleted = affinity >= tier.maxAffinity && tier.maxAffinity !== Infinity;
            const isLocked = affinity < tier.minAffinity;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  isCurrentTier && 'border-primary bg-primary/5',
                  isCompleted && 'border-green-500/50 bg-green-500/5',
                  isLocked && 'opacity-50 border-muted'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <Sparkles className="h-4 w-4 text-green-500" />
                    )}
                    <span className={cn(
                      'font-medium text-sm',
                      isCurrentTier && 'text-primary',
                      isCompleted && 'text-green-600'
                    )}>
                      {tier.name}
                    </span>
                    {isCurrentTier && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {tier.minAffinity}+ affinity
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tier.description}
                </p>
                {isCurrentTier && nextTier && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Progress to {nextTier.name}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <EvolutionBadge affinity={affinity} size="sm" />
        {nextTier && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {nextTier.name} ({nextTier.minAffinity - affinity} more)
            </span>
          </>
        )}
      </div>
      
      {nextTier && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {progress}% to next evolution
          </p>
        </div>
      )}
    </div>
  );
}
