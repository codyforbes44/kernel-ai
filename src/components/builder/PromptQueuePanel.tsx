import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronDown, ChevronUp, Pause, Play, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowBadge } from '@/components/ui/glow-badge';
import { QueueItem } from './QueueItem';
import type { QueuedPrompt } from '@/hooks/usePromptQueue';
import { cn } from '@/lib/utils';

interface PromptQueuePanelProps {
  queue: QueuedPrompt[];
  isPaused: boolean;
  isProcessing: boolean;
  currentIndex: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onTogglePause: () => void;
  onStartProcessing: () => void;
}

export function PromptQueuePanel({
  queue,
  isPaused,
  isProcessing,
  currentIndex,
  onReorder,
  onRemove,
  onClear,
  onTogglePause,
  onStartProcessing,
}: PromptQueuePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex(p => p.id === active.id);
      const newIndex = queue.findIndex(p => p.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  if (queue.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="border border-border rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Queue</span>
          <GlowBadge variant="outline" size="sm" className="text-[10px] px-1.5 py-0">
            Beta
          </GlowBadge>
          <span className="text-xs text-muted-foreground">
            ({queue.length} prompt{queue.length !== 1 ? 's' : ''})
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Process/Pause toggle */}
          {isProcessing ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePause();
              }}
              title={isPaused ? 'Resume processing' : 'Pause processing'}
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5 text-success" />
              ) : (
                <Pause className="h-3.5 w-3.5 text-warning" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onStartProcessing();
              }}
              title="Send all prompts"
            >
              <Play className="h-3.5 w-3.5 text-success" />
            </Button>
          )}
          
          {/* Clear all */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            title="Clear queue"
            disabled={isProcessing}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          
          {/* Expand/collapse */}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Queue items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2 space-y-1.5 max-h-[200px] overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={queue.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {queue.map((prompt, index) => (
                    <QueueItem
                      key={prompt.id}
                      prompt={prompt}
                      index={index}
                      onRemove={onRemove}
                      isProcessing={isProcessing && index === currentIndex}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            
            {/* Keyboard shortcut hint */}
            <div className="px-3 py-1.5 border-t border-border/50 bg-muted/20">
              <p className="text-[10px] text-muted-foreground text-center">
                <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Ctrl</kbd>
                {' + '}
                <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Enter</kbd>
                {' to add • '}
                <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Ctrl</kbd>
                {' + '}
                <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Shift</kbd>
                {' + '}
                <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Enter</kbd>
                {' to send all'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
