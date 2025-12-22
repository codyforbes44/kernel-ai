import { cn } from '@/lib/utils';
import type { VisualChange } from '@/types/visual-editor';

interface DiffPreviewProps {
  changes: VisualChange[];
  type: 'undo' | 'redo';
  className?: string;
}

export function DiffPreview({ changes, type, className }: DiffPreviewProps) {
  if (changes.length === 0) return null;

  // Get the last change (what will be undone/redone)
  const lastChange = changes[changes.length - 1];
  if (!lastChange) return null;

  const formatValue = (value: string) => {
    if (!value) return <span className="text-muted-foreground italic">empty</span>;
    if (value.length > 30) return value.slice(0, 30) + '...';
    return value;
  };

  const getChangeTypeLabel = (change: VisualChange) => {
    switch (change.type) {
      case 'text':
        return 'Text';
      case 'style':
        return change.property ? `Style (${change.property})` : 'Style';
      case 'class':
        return 'Classes';
      case 'attribute':
        return 'Attribute';
      default:
        return 'Change';
    }
  };

  return (
    <div className={cn(
      "w-56 p-2 space-y-1.5 text-xs",
      className
    )}>
      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
        <span>{type === 'undo' ? 'Will revert:' : 'Will restore:'}</span>
        <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
          {getChangeTypeLabel(lastChange)}
        </span>
      </div>
      
      <div className="space-y-1 font-mono">
        {/* Old value (what we go back to on undo, what we come from on redo) */}
        <div className={cn(
          "flex items-start gap-1.5 p-1.5 rounded",
          type === 'undo' ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
        )}>
          <span className="font-bold shrink-0">{type === 'undo' ? '+' : '−'}</span>
          <span className="break-all">{formatValue(type === 'undo' ? lastChange.oldValue : lastChange.newValue)}</span>
        </div>
        
        {/* New value (what we leave on undo, what we apply on redo) */}
        <div className={cn(
          "flex items-start gap-1.5 p-1.5 rounded",
          type === 'undo' ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-green-500/10 text-green-600 dark:text-green-400"
        )}>
          <span className="font-bold shrink-0">{type === 'undo' ? '−' : '+'}</span>
          <span className="break-all">{formatValue(type === 'undo' ? lastChange.newValue : lastChange.oldValue)}</span>
        </div>
      </div>

      {changes.length > 1 && (
        <p className="text-muted-foreground text-[10px]">
          +{changes.length - 1} more change{changes.length > 2 ? 's' : ''} in stack
        </p>
      )}
    </div>
  );
}
