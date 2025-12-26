import { cn } from '@/lib/utils';

interface MoodIndicatorProps {
  mood: string;
  size?: 'sm' | 'md';
  className?: string;
}

const MOOD_COLORS: Record<string, string> = {
  happy: 'bg-green-500',
  curious: 'bg-blue-500',
  empathetic: 'bg-purple-500',
  excited: 'bg-yellow-500',
  inquisitive: 'bg-cyan-500',
  playful: 'bg-pink-500',
  thoughtful: 'bg-indigo-500',
  focused: 'bg-slate-500',
  warm: 'bg-orange-500',
  neutral: 'bg-gray-400',
};

const MOOD_LABELS: Record<string, string> = {
  happy: 'Happy',
  curious: 'Curious',
  empathetic: 'Understanding',
  excited: 'Excited',
  inquisitive: 'Inquisitive',
  playful: 'Playful',
  thoughtful: 'Thoughtful',
  focused: 'Focused',
  warm: 'Warm',
  neutral: 'Calm',
};

export function MoodIndicator({ mood, size = 'md', className }: MoodIndicatorProps) {
  const color = MOOD_COLORS[mood] || MOOD_COLORS.neutral;
  const label = MOOD_LABELS[mood] || 'Calm';
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className={cn(
          'rounded-full animate-pulse',
          color,
          size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
        )} 
      />
      <span className={cn(
        'text-muted-foreground',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        {label}
      </span>
    </div>
  );
}
