import { AffinityMeter } from './AffinityMeter';
import { CompanionAvatar } from './CompanionAvatar';
import type { CompanionProfile, CompanionRelationship } from '@/types/companion';

interface ChatHeaderProps {
  companion: CompanionProfile;
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
          <h2 className="font-semibold">{companion.name}</h2>
          {relationship && <AffinityMeter level={relationship.affinity_level} size="sm" />}
        </div>
      </div>
    </div>
  );
}
