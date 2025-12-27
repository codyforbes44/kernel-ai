import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { VoiceConversation } from './VoiceConversation';
import type { CompanionProfile } from '@/types/companion';

interface VoiceConversationDialogProps {
  companion: CompanionProfile;
  trigger: ReactNode;
}

export function VoiceConversationDialog({ companion, trigger }: VoiceConversationDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Voice Chat with {companion.name}
          </DialogTitle>
        </DialogHeader>
        <VoiceConversation
          companionName={companion.name}
          personalityType={companion.personality_type}
          systemPrompt={companion.system_prompt}
        />
      </DialogContent>
    </Dialog>
  );
}
