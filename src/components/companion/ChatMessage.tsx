import { Button } from '@/components/ui/button';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanionMessage } from '@/types/companion';

interface ChatMessageProps {
  message: CompanionMessage;
  isPlaying: boolean;
  isVoiceLoading: boolean;
  onVoiceClick: (messageId: string, content: string) => void;
}

export function ChatMessage({ message, isPlaying, isVoiceLoading, onVoiceClick }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-2 group relative',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {!isUser && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute -right-10 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
              (isPlaying || isVoiceLoading) && 'opacity-100'
            )}
            onClick={() => onVoiceClick(message.id, message.content)}
            disabled={isVoiceLoading && !isPlaying}
          >
            {isVoiceLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
