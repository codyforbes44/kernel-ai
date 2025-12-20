import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BoxModelEditorProps {
  padding: { top: string; right: string; bottom: string; left: string };
  margin: { top: string; right: string; bottom: string; left: string };
  onPaddingChange: (side: 'top' | 'right' | 'bottom' | 'left', value: string) => void;
  onMarginChange: (side: 'top' | 'right' | 'bottom' | 'left', value: string) => void;
  onPaddingAllChange: (value: string) => void;
  onMarginAllChange: (value: string) => void;
}

export function BoxModelEditor({
  padding,
  margin,
  onPaddingChange,
  onMarginChange,
  onPaddingAllChange,
  onMarginAllChange,
}: BoxModelEditorProps) {
  const [linkPadding, setLinkPadding] = useState(true);
  const [linkMargin, setLinkMargin] = useState(true);

  const handlePaddingInput = useCallback((side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    if (linkPadding) {
      onPaddingAllChange(value);
    } else {
      onPaddingChange(side, value);
    }
  }, [linkPadding, onPaddingChange, onPaddingAllChange]);

  const handleMarginInput = useCallback((side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    if (linkMargin) {
      onMarginAllChange(value);
    } else {
      onMarginChange(side, value);
    }
  }, [linkMargin, onMarginChange, onMarginAllChange]);

  return (
    <div className="space-y-4">
      <Label className="text-xs font-medium">Box Model</Label>
      
      {/* Visual Box Model */}
      <div className="relative flex items-center justify-center p-4 bg-muted/30 rounded-lg">
        {/* Margin Layer */}
        <div className="relative border-2 border-dashed border-orange-400/50 bg-orange-400/10 p-3 rounded">
          <span className="absolute -top-2.5 left-2 text-[10px] font-mono bg-background px-1 text-orange-600">
            margin
          </span>
          
          {/* Margin Inputs */}
          <input
            type="text"
            value={margin.top}
            onChange={(e) => handleMarginInput('top', e.target.value)}
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-5 text-[10px] text-center bg-transparent border border-orange-400/50 rounded focus:outline-none focus:border-orange-500"
            placeholder="0"
          />
          <input
            type="text"
            value={margin.right}
            onChange={(e) => handleMarginInput('right', e.target.value)}
            className="absolute top-1/2 -right-1 -translate-y-1/2 w-8 h-5 text-[10px] text-center bg-transparent border border-orange-400/50 rounded focus:outline-none focus:border-orange-500"
            placeholder="0"
          />
          <input
            type="text"
            value={margin.bottom}
            onChange={(e) => handleMarginInput('bottom', e.target.value)}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-5 text-[10px] text-center bg-transparent border border-orange-400/50 rounded focus:outline-none focus:border-orange-500"
            placeholder="0"
          />
          <input
            type="text"
            value={margin.left}
            onChange={(e) => handleMarginInput('left', e.target.value)}
            className="absolute top-1/2 -left-1 -translate-y-1/2 w-8 h-5 text-[10px] text-center bg-transparent border border-orange-400/50 rounded focus:outline-none focus:border-orange-500"
            placeholder="0"
          />

          {/* Padding Layer */}
          <div className="relative border-2 border-dashed border-green-500/50 bg-green-500/10 p-3 rounded">
            <span className="absolute -top-2.5 left-2 text-[10px] font-mono bg-background px-1 text-green-600">
              padding
            </span>
            
            {/* Padding Inputs */}
            <input
              type="text"
              value={padding.top}
              onChange={(e) => handlePaddingInput('top', e.target.value)}
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-5 text-[10px] text-center bg-transparent border border-green-500/50 rounded focus:outline-none focus:border-green-600"
              placeholder="0"
            />
            <input
              type="text"
              value={padding.right}
              onChange={(e) => handlePaddingInput('right', e.target.value)}
              className="absolute top-1/2 -right-1 -translate-y-1/2 w-8 h-5 text-[10px] text-center bg-transparent border border-green-500/50 rounded focus:outline-none focus:border-green-600"
              placeholder="0"
            />
            <input
              type="text"
              value={padding.bottom}
              onChange={(e) => handlePaddingInput('bottom', e.target.value)}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-5 text-[10px] text-center bg-transparent border border-green-500/50 rounded focus:outline-none focus:border-green-600"
              placeholder="0"
            />
            <input
              type="text"
              value={padding.left}
              onChange={(e) => handlePaddingInput('left', e.target.value)}
              className="absolute top-1/2 -left-1 -translate-y-1/2 w-8 h-5 text-[10px] text-center bg-transparent border border-green-500/50 rounded focus:outline-none focus:border-green-600"
              placeholder="0"
            />

            {/* Content */}
            <div className="w-16 h-10 bg-primary/20 border border-primary/40 rounded flex items-center justify-center">
              <span className="text-[10px] font-mono text-muted-foreground">content</span>
            </div>
          </div>
        </div>
      </div>

      {/* Link toggles */}
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={linkPadding}
            onChange={(e) => setLinkPadding(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-muted-foreground">Link padding</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={linkMargin}
            onChange={(e) => setLinkMargin(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-muted-foreground">Link margin</span>
        </label>
      </div>
    </div>
  );
}
