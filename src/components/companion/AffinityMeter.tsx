import { memo } from 'react';
import { Progress } from '@/components/ui/progress';
import { getAffinityLevel } from '@/types/companion';
import { cn } from '@/lib/utils';

interface AffinityMeterProps {
  level: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AffinityMeter = memo(function AffinityMeter({ 
  level, 
  showLabel = true, 
  size = 'md', 
  className 
}: AffinityMeterProps) {
  const affinityLevel = getAffinityLevel(level);
  
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

  return (
    <div 
      className={cn('space-y-1', className)}
      role="meter"
      aria-label={`Affinity level: ${affinityLevel.name}`}
      aria-valuenow={level}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="font-medium" style={{ color: affinityLevel.color }}>
            {affinityLevel.name}
          </span>
          <span className="text-muted-foreground">{level}/100</span>
        </div>
      )}
      <Progress value={level} className={heights[size]} aria-hidden="true" />
      {showLabel && (
        <p className="text-xs text-muted-foreground">{affinityLevel.description}</p>
      )}
    </div>
  );
});
