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
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg p-0 sm:p-6 h-[85vh] sm:h-auto max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-4 sm:p-0 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            Voice Chat with {companion.name}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-4 sm:px-0 pb-4 sm:pb-0">
          <VoiceConversation
            companionName={companion.name}
            personalityType={companion.personality_type}
            systemPrompt={companion.system_prompt}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
