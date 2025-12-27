import { Button } from '@/components/ui/button';
import { AffinityMeter } from './AffinityMeter';
import { CompanionAvatar } from './CompanionAvatar';
import { MoodIndicator } from './MoodIndicator';
import { CompanionProfile } from './CompanionProfile';
import { User } from 'lucide-react';
import type { CompanionProfile as CompanionProfileType, CompanionRelationship } from '@/types/companion';

interface ChatHeaderProps {
  companion: CompanionProfileType;
  relationship: CompanionRelationship | null;
}

export function ChatHeader({ companion, relationship }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b bg-muted/30">
      <div className="flex items-center gap-3">
        <CompanionAvatar 
          personalityType={companion.personality_type} 
          avatarUrl={companion.avatar_url}
          size="md"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{relationship?.nickname || companion.name}</h2>
            {relationship && <MoodIndicator mood={relationship.current_mood} size="sm" />}
          </div>
          {relationship && <AffinityMeter level={relationship.affinity_level} size="sm" />}
        </div>
        <CompanionProfile 
          companion={companion} 
          relationship={relationship}
          trigger={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <User className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
