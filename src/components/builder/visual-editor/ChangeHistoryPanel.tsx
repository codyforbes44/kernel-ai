import { useState } from 'react';
import { History, ChevronDown, ChevronUp, Type, Palette, Code2, Hash, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { VisualChange } from '@/types/visual-editor';
import { formatDistanceToNow } from 'date-fns';

interface HistoryEntry {
  index: number;
  changes: VisualChange[];
  timestamp: Date;
}

interface ChangeHistoryPanelProps {
  history: HistoryEntry[];
  currentIndex: number;
  onJumpTo: (index: number) => void;
  onClose: () => void;
  className?: string;
}

const getChangeIcon = (type: VisualChange['type']) => {
  switch (type) {
    case 'text':
      return <Type className="h-3 w-3" />;
    case 'style':
      return <Palette className="h-3 w-3" />;
    case 'class':
      return <Code2 className="h-3 w-3" />;
    case 'attribute':
      return <Hash className="h-3 w-3" />;
    default:
      return <Code2 className="h-3 w-3" />;
  }
};

const getChangeLabel = (change: VisualChange) => {
  switch (change.type) {
    case 'text':
      return `Text: "${change.newValue.slice(0, 20)}${change.newValue.length > 20 ? '...' : ''}"`;
    case 'style':
      return `${change.property}: ${change.newValue}`;
    case 'class':
      return `Classes updated`;
    case 'attribute':
      return `${change.property} changed`;
    default:
      return 'Change';
  }
};

const formatValue = (value: string, maxLength = 25) => {
  if (!value) return <span className="text-muted-foreground italic">empty</span>;
  if (value.length > maxLength) return value.slice(0, maxLength) + '...';
  return value;
};

export function ChangeHistoryPanel({
  history,
  currentIndex,
  onJumpTo,
  onClose,
  className,
}: ChangeHistoryPanelProps) {
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    setExpandedEntry(expandedEntry === index ? null : index);
  };

  if (history.length === 0) {
    return (
      <div className={cn(
        "bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4",
        className
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4" />
            Change History
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            ×
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          No changes yet. Start editing to see history.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden",
      className
    )}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium">
          <History className="h-4 w-4" />
          Change History
          <span className="text-xs text-muted-foreground">({history.length})</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          ×
        </Button>
      </div>

      <ScrollArea className="max-h-80">
        <div className="p-2 space-y-1">
          {/* Initial state entry */}
          <button
            onClick={() => onJumpTo(-1)}
            className={cn(
              "w-full text-left p-2 rounded-md transition-colors text-xs",
              "hover:bg-accent/50",
              currentIndex === -1 && "bg-primary/10 border border-primary/30"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <RotateCcw className="h-3 w-3" />
                </div>
                <span className="font-medium">Initial State</span>
              </div>
              {currentIndex === -1 && (
                <Check className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
          </button>

          {/* History entries */}
          {history.map((entry, idx) => {
            const isExpanded = expandedEntry === entry.index;
            const isCurrent = currentIndex === entry.index;
            const lastChange = entry.changes[entry.changes.length - 1];

            return (
              <div
                key={entry.index}
                className={cn(
                  "rounded-md transition-colors text-xs",
                  "hover:bg-accent/50",
                  isCurrent && "bg-primary/10 border border-primary/30"
                )}
              >
                <button
                  onClick={() => onJumpTo(entry.index)}
                  className="w-full text-left p-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        isCurrent ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {getChangeIcon(lastChange.type)}
                      </div>
                      <div>
                        <span className="font-medium">{getChangeLabel(lastChange)}</span>
                        {entry.changes.length > 1 && (
                          <span className="text-muted-foreground ml-1">
                            +{entry.changes.length - 1}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isCurrent && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(entry.index);
                        }}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 ml-7">
                    {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-2 pb-2 ml-7 space-y-1.5">
                    {entry.changes.map((change, changeIdx) => (
                      <div
                        key={changeIdx}
                        className="bg-muted/50 rounded p-2 space-y-1 font-mono text-[10px]"
                      >
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {getChangeIcon(change.type)}
                          <span className="font-sans font-medium">
                            {change.type === 'style' ? change.property : change.type}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-red-600 dark:text-red-400">
                          <span className="font-bold shrink-0">−</span>
                          <span className="break-all">{formatValue(change.oldValue)}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-green-600 dark:text-green-400">
                          <span className="font-bold shrink-0">+</span>
                          <span className="break-all">{formatValue(change.newValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Current position indicator */}
      <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
        Position: {currentIndex + 1} of {history.length}
      </div>
    </div>
  );
}
