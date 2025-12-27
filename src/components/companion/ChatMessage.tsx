import { memo, useCallback } from 'react';
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

export const ChatMessage = memo(function ChatMessage({ 
  message, 
  isPlaying, 
  isVoiceLoading, 
  onVoiceClick,
  voiceEnabled = true,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  const handleVoiceClick = useCallback(() => {
    onVoiceClick(message.id, message.content);
  }, [message.id, message.content, onVoiceClick]);
  
  return (
    <div 
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
      role="listitem"
      aria-label={`${isUser ? 'You' : 'Companion'} said: ${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}`}
    >
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
              onClick={handleVoiceClick}
              size="sm"
              aria-label={isPlaying ? 'Stop voice playback' : 'Play message aloud'}
            />
          </div>
        )}
      </div>
    </div>
  );
});
