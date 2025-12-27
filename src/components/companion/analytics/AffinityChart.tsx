import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AFFINITY_LEVELS, getAffinityLevel } from '@/constants/companion';
import type { CompanionRelationship } from '@/types/companion';

interface AffinityChartProps {
  relationship: CompanionRelationship;
  className?: string;
}

export function AffinityChart({ relationship, className }: AffinityChartProps) {
  const currentLevel = getAffinityLevel(relationship.affinity_level);
  const progress = relationship.affinity_level;

  // Calculate level thresholds for visualization
  const levels = useMemo(() => {
    return AFFINITY_LEVELS.map((level) => {
      const start = level.minLevel;
      const end = level.maxLevel;
      const width = end - start + 1;
      const isCurrent = progress >= start && progress <= end;
      const isPast = progress > end;
      
      return {
        ...level,
        start,
        end,
        width,
        isCurrent,
        isPast,
        position: start,
      };
    });
  }, [progress]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" />
          Affinity Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level Display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold" style={{ color: currentLevel.color }}>
              {currentLevel.name}
            </p>
            <p className="text-sm text-muted-foreground">{currentLevel.description}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{progress}</p>
            <p className="text-xs text-muted-foreground">/ 100</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
          {/* Level segments */}
          <div className="absolute inset-0 flex">
            {levels.map((level, i) => (
              <div
                key={level.name}
                className="h-full border-r border-background/50 last:border-r-0"
                style={{ 
                  width: `${level.width}%`,
                  backgroundColor: level.isPast || level.isCurrent 
                    ? `${level.color}30` 
                    : 'transparent'
                }}
              />
            ))}
          </div>

          {/* Progress fill */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ backgroundColor: currentLevel.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Current position indicator */}
          <motion.div
            className="absolute top-0 h-full w-1 bg-foreground/80 rounded-full"
            initial={{ left: 0 }}
            animate={{ left: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Level Labels */}
        <div className="flex justify-between text-xs">
          {levels.map((level) => (
            <div 
              key={level.name}
              className={cn(
                'text-center transition-colors',
                level.isCurrent ? 'font-medium' : 'text-muted-foreground'
              )}
              style={{ 
                width: `${level.width}%`,
                color: level.isCurrent ? level.color : undefined
              }}
            >
              {level.name}
            </div>
          ))}
        </div>

        {/* Next milestone hint */}
        {progress < 100 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <TrendingUp className="h-4 w-4" />
            <span>
              {100 - progress} more points to reach max affinity!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
