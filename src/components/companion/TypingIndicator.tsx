import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  personalityType?: string;
  className?: string;
}

export function TypingIndicator({ personalityType = 'mentor', className }: TypingIndicatorProps) {
  // Different animation styles based on personality
  const getAnimationStyle = () => {
    switch (personalityType) {
      case 'creative':
        return 'animate-bounce';
      case 'analytical':
        return 'animate-pulse';
      case 'supportive':
        return 'animate-spin';
      default:
        return 'animate-spin';
    }
  };

  return (
    <div className={cn('flex justify-start', className)}>
      <div className="bg-muted rounded-2xl px-4 py-3">
        <Loader2 className={cn('h-4 w-4', getAnimationStyle())} />
      </div>
    </div>
  );
}
