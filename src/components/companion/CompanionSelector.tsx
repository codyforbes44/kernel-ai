import { memo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCompanions, useAllRelationships } from '@/hooks/useCompanion';
import { PERSONALITY_ICONS, PERSONALITY_COLORS } from '@/types/companion';
import { AffinityMeter } from './AffinityMeter';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanionSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const CompanionSelector = memo(function CompanionSelector({ 
  selectedId, 
  onSelect 
}: CompanionSelectorProps) {
  const { data: companions, isLoading } = useCompanions();
  const { data: relationships } = useAllRelationships();

  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  }, [onSelect]);

  if (isLoading) {
    return (
      <div 
        className="grid grid-cols-2 gap-3" 
        role="status" 
        aria-label="Loading companions"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" delay={i * 100} />
        ))}
        <span className="sr-only">Loading companions...</span>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-2 gap-3" 
      role="listbox"
      aria-label="Select a companion"
    >
      {companions?.map((companion) => {
        const relationship = relationships?.find((r) => r.companion_id === companion.id);
        const isSelected = selectedId === companion.id;

        return (
          <Card
            key={companion.id}
            onClick={() => onSelect(companion.id)}
            onKeyDown={(e) => handleKeyDown(e, companion.id)}
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            className={`cursor-pointer transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {PERSONALITY_ICONS[companion.personality_type]}
                </span>
                <div>
                  <h3 className="font-semibold">{companion.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">
                    {companion.personality_type}
                  </p>
                </div>
              </div>
              {relationship && (
                <AffinityMeter 
                  level={relationship.affinity_level} 
                  size="sm" 
                  showLabel={false} 
                />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
