import { Button } from '@/components/ui/button';
import { AffinityMeter } from './AffinityMeter';
import { CompanionAvatar } from './CompanionAvatar';
import { MoodIndicator } from './MoodIndicator';
import { CompanionProfile } from './CompanionProfile';
import { CompanionAnalyticsDashboard } from './analytics/CompanionAnalyticsDashboard';
import { CompanionSettingsSheet } from './settings/CompanionSettingsSheet';
import { ActivitiesHub } from './activities/ActivitiesHub';
import { User, BarChart3, Settings, Gamepad2 } from 'lucide-react';
import type { CompanionProfile as CompanionProfileType, CompanionRelationship, CompanionConversation } from '@/types/companion';
import type { VoiceSettings } from '@/hooks/useCompanionVoiceSettings';

interface ChatHeaderProps {
  companion: CompanionProfileType;
  relationship: CompanionRelationship | null;
  conversations?: CompanionConversation[];
  voiceSettings?: VoiceSettings;
  onVoiceSettingsChange?: (settings: VoiceSettings) => void;
}

export function ChatHeader({ 
  companion, 
  relationship, 
  conversations = [],
  voiceSettings,
  onVoiceSettingsChange,
}: ChatHeaderProps) {
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
        <div className="flex items-center gap-1">
          {relationship && (
            <>
              <ActivitiesHub
                companion={companion}
                relationship={relationship}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Gamepad2 className="h-4 w-4" />
                  </Button>
                }
              />
              <CompanionAnalyticsDashboard
                companion={companion}
                relationship={relationship}
                conversations={conversations}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                }
              />
              {voiceSettings && onVoiceSettingsChange && (
                <CompanionSettingsSheet
                  companion={companion}
                  relationship={relationship}
                  conversations={conversations}
                  voiceSettings={voiceSettings}
                  onVoiceSettingsChange={onVoiceSettingsChange}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
            </>
          )}
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
    </div>
  );
}
          />
        </div>
      </div>
    </div>
  );
}
