import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { QueuedPrompt } from '@/hooks/usePromptQueue';

interface QueueItemProps {
  prompt: QueuedPrompt;
  onRemove: (id: string) => void;
  isProcessing?: boolean;
  index: number;
}

export function QueueItem({ prompt, onRemove, isProcessing, index }: QueueItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prompt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Truncate content for display
  const truncatedContent = prompt.content.length > 80 
    ? prompt.content.slice(0, 80) + '...' 
    : prompt.content;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50 group',
        isDragging && 'opacity-50 shadow-lg bg-muted',
        isProcessing && 'border-primary/50 bg-primary/5'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted-foreground/10"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Index badge */}
      <div className={cn(
        'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium',
        isProcessing 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted-foreground/20 text-muted-foreground'
      )}>
        {isProcessing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          index + 1
        )}
      </div>

      {/* Content preview */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground truncate">
          {truncatedContent}
        </p>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(prompt.id)}
        disabled={isProcessing}
        aria-label="Remove from queue"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
