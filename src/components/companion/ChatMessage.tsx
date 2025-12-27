import { cn } from '@/lib/utils';
import { VoicePlaybackButton } from './voice/VoicePlaybackButton';
import type { CompanionMessage } from '@/types/companion';

interface ChatMessageProps {
  message: CompanionMessage;
  isPlaying: boolean;
  isVoiceLoading: boolean;
  onVoiceClick: (messageId: string, content: string) => void;
  voiceEnabled?: boolean;
}

export function ChatMessage({ 
  message, 
  isPlaying, 
  isVoiceLoading, 
  onVoiceClick,
  voiceEnabled = true,
}: ChatMessageProps) {
  // Support both 'user' role and 'companion'/'assistant' roles
  const isUser = message.role === 'user';
  
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-2 group relative',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {!isUser && voiceEnabled && (
          <div className={cn(
            'absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity',
            (isPlaying || isVoiceLoading) && 'opacity-100'
          )}>
            <VoicePlaybackButton
              isPlaying={isPlaying}
              isLoading={isVoiceLoading}
              onClick={() => onVoiceClick(message.id, message.content)}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
