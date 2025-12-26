import { Card, CardContent } from '@/components/ui/card';
import { useCompanions, useAllRelationships } from '@/hooks/useCompanion';
import { PERSONALITY_ICONS, PERSONALITY_COLORS } from '@/types/companion';
import { AffinityMeter } from './AffinityMeter';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanionSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CompanionSelector({ selectedId, onSelect }: CompanionSelectorProps) {
  const { data: companions, isLoading } = useCompanions();
  const { data: relationships } = useAllRelationships();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {companions?.map((companion) => {
        const relationship = relationships?.find((r) => r.companion_id === companion.id);
        const isSelected = selectedId === companion.id;

        return (
          <Card
            key={companion.id}
            onClick={() => onSelect(companion.id)}
            className={`cursor-pointer transition-all hover:scale-[1.02] ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{PERSONALITY_ICONS[companion.personality_type]}</span>
                <div>
                  <h3 className="font-semibold">{companion.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{companion.personality_type}</p>
                </div>
              </div>
              {relationship && <AffinityMeter level={relationship.affinity_level} size="sm" showLabel={false} />}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
