import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InlineTextEditorProps {
  initialText: string;
  position: { top: number; left: number; width: number; height: number };
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  onSave: (newText: string) => void;
  onCancel: () => void;
}

export function InlineTextEditor({
  initialText,
  position,
  fontSize = '16px',
  fontWeight = '400',
  color = 'inherit',
  onSave,
  onCancel,
}: InlineTextEditorProps) {
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = useCallback(() => {
    if (text.trim() !== initialText.trim()) {
      onSave(text.trim());
    } else {
      onCancel();
    }
  }, [text, initialText, onSave, onCancel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }, [handleSave, onCancel]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div 
      className="fixed z-[101] animate-in fade-in-0 zoom-in-95 duration-100"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: `${Math.max(position.width, 100)}px`,
      }}
    >
      <div className={cn(
        "relative border-2 border-primary rounded-md overflow-hidden",
        "shadow-lg bg-background"
      )}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn(
            "w-full resize-none border-0 bg-transparent p-2 outline-none",
            "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
          style={{
            fontSize,
            fontWeight,
            color,
            minHeight: `${Math.max(position.height, 32)}px`,
          }}
          rows={1}
        />
        
        {/* Action buttons */}
        <div className="absolute -bottom-8 right-0 flex gap-1">
          <Button
            size="icon"
            variant="default"
            className="h-6 w-6 rounded-full shadow-md"
            onClick={handleSave}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6 rounded-full shadow-md bg-background"
            onClick={onCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
