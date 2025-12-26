import { cn } from '@/lib/utils';
import { Trophy, Star, Heart, Sparkles, Crown } from 'lucide-react';
import type { Milestone } from '@/types/companion';
import { MESSAGE_MILESTONES, AFFINITY_MILESTONES } from '@/constants/companion';

interface MilestonesBadgesProps {
  milestones: Milestone[];
  className?: string;
  showLocked?: boolean;
}

const MILESTONE_ICONS: Record<string, React.ElementType> = {
  first_message: Star,
  messages_10: Sparkles,
  messages_50: Heart,
  messages_100: Trophy,
  messages_500: Crown,
  affinity_25: Heart,
  affinity_50: Sparkles,
  affinity_75: Trophy,
  affinity_100: Crown,
};

export function MilestonesBadges({ milestones, className, showLocked = false }: MilestonesBadgesProps) {
  const achievedIds = new Set(milestones.map(m => m.id));
  const allMilestones = [...MESSAGE_MILESTONES, ...AFFINITY_MILESTONES];

  const displayMilestones = showLocked 
    ? allMilestones 
    : allMilestones.filter(m => achievedIds.has(m.id));

  if (displayMilestones.length === 0) {
    return (
      <div className={cn('text-center py-4 text-muted-foreground text-sm', className)}>
        No milestones yet. Keep chatting to unlock achievements!
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-3', className)}>
      {displayMilestones.map((milestone) => {
        const isAchieved = achievedIds.has(milestone.id);
        const Icon = MILESTONE_ICONS[milestone.id] || Trophy;
        const achieved = milestones.find(m => m.id === milestone.id);
        
        return (
          <div
            key={milestone.id}
            className={cn(
              'flex flex-col items-center p-3 rounded-lg border transition-all',
              isAchieved 
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-muted/50 border-muted opacity-50'
            )}
          >
            <Icon className={cn(
              'h-6 w-6 mb-2',
              isAchieved ? 'text-primary' : 'text-muted-foreground'
            )} />
            <span className="text-xs font-medium text-center">{milestone.title}</span>
            {isAchieved && achieved?.achieved_at && (
              <span className="text-[10px] text-muted-foreground mt-1">
                {new Date(achieved.achieved_at).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
