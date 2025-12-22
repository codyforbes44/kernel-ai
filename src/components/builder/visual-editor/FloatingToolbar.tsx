import { useState } from 'react';
import { Type, Palette, Trash2, Copy, Undo2, Redo2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import type { SelectedElement, VisualChange } from '@/types/visual-editor';
import { DiffPreview } from './DiffPreview';

interface FloatingToolbarProps {
  element: SelectedElement;
  position: { top: number; left: number };
  onEditText: () => void;
  onEditColor: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  undoPreview?: VisualChange[];
  redoPreview?: VisualChange[];
}

export function FloatingToolbar({
  element,
  position,
  onEditText,
  onEditColor,
  onDuplicate,
  onDelete,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  undoPreview = [],
  redoPreview = [],
}: FloatingToolbarProps) {
  const hasTextContent = element.textContent && element.textContent.trim().length > 0;
  
  // Calculate toolbar position - above the element
  const toolbarTop = Math.max(8, position.top - 48);
  const toolbarLeft = position.left;

  return (
    <div
      className={cn(
        "fixed z-[100] flex items-center gap-0.5 p-1 rounded-lg",
        "bg-popover/95 backdrop-blur-sm border border-border shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
      style={{
        top: `${toolbarTop}px`,
        left: `${toolbarLeft}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Element type badge */}
      <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-muted rounded mr-1">
        {element.tagName}
      </span>

      {/* Edit Text - only for text elements */}
      {hasTextContent && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEditText}
            >
              <Type className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Edit Text</TooltipContent>
        </Tooltip>
      )}

      {/* Edit Colors */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEditColor}
          >
            <Palette className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Edit Colors</TooltipContent>
      </Tooltip>

      {/* Duplicate */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDuplicate}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Duplicate</TooltipContent>
      </Tooltip>

      {/* Delete */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Delete</TooltipContent>
      </Tooltip>

      {/* Separator */}
      {(onUndo || onRedo) && (
        <div className="w-px h-4 bg-border mx-1" />
      )}

      {/* Undo */}
      {onUndo && (
        <HoverCard openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onUndo}
                    disabled={!canUndo}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <span>Undo</span>
                  <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">⌘Z</kbd>
                </TooltipContent>
              </Tooltip>
            </div>
          </HoverCardTrigger>
          {canUndo && undoPreview.length > 0 && (
            <HoverCardContent side="bottom" align="center" className="p-0 w-auto">
              <DiffPreview changes={undoPreview} type="undo" />
            </HoverCardContent>
          )}
        </HoverCard>
      )}

      {/* Redo */}
      {onRedo && (
        <HoverCard openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onRedo}
                    disabled={!canRedo}
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <span>Redo</span>
                  <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">⌘⇧Z</kbd>
                </TooltipContent>
              </Tooltip>
            </div>
          </HoverCardTrigger>
          {canRedo && redoPreview.length > 0 && (
            <HoverCardContent side="bottom" align="center" className="p-0 w-auto">
              <DiffPreview changes={redoPreview} type="redo" />
            </HoverCardContent>
          )}
        </HoverCard>
      )}
    </div>
  );
}
