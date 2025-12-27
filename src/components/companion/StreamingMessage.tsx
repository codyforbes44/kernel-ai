import { cn } from '@/lib/utils';
import { PERSONALITY_COLORS } from '@/constants/companion';

interface StreamingMessageProps {
  content: string;
  personalityType: string;
}

export function StreamingMessage({ content, personalityType }: StreamingMessageProps) {
  const color = PERSONALITY_COLORS[personalityType] || PERSONALITY_COLORS.mentor;
  
  return (
    <div className="flex justify-start">
      <div 
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2 bg-muted',
          'animate-in fade-in-0 slide-in-from-left-2 duration-200'
        )}
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <p className="text-sm whitespace-pre-wrap">
          {content}
          <span className="inline-block w-2 h-4 ml-1 bg-primary/60 animate-pulse rounded-sm" />
        </p>
      </div>
    </div>
  );
}
