import { useState, useEffect, useCallback } from 'react';
import { Pipette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerPopoverProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  recentColors?: string[];
  onAddRecentColor?: (color: string) => void;
}

const presetColors = [
  // Grays
  '#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8', '#475569', '#1e293b', '#0f172a', '#000000',
  // Colors
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  // Light variants
  '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#99f6e4', '#bfdbfe', '#ddd6fe', '#fbcfe8',
];

export function ColorPickerPopover({
  color,
  onChange,
  label = 'Color',
  recentColors = [],
  onAddRecentColor,
}: ColorPickerPopoverProps) {
  const [inputValue, setInputValue] = useState(color);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleColorChange = useCallback((newColor: string) => {
    onChange(newColor);
    onAddRecentColor?.(newColor);
  }, [onChange, onAddRecentColor]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    // Validate hex color
    if (/^#[0-9a-fA-F]{6}$/.test(value) || /^#[0-9a-fA-F]{3}$/.test(value)) {
      handleColorChange(value);
    }
  }, [handleColorChange]);

  const handleInputBlur = useCallback(() => {
    // Normalize input on blur
    if (/^[0-9a-fA-F]{6}$/.test(inputValue)) {
      handleColorChange(`#${inputValue}`);
    } else if (/^[0-9a-fA-F]{3}$/.test(inputValue)) {
      handleColorChange(`#${inputValue}`);
    }
  }, [inputValue, handleColorChange]);

  const handleEyedropper = useCallback(async () => {
    try {
      // @ts-ignore - EyeDropper API
      if ('EyeDropper' in window) {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        handleColorChange(result.sRGBHex);
      }
    } catch (e) {
      // User cancelled or API not supported
    }
  }, [handleColorChange]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 w-full p-2 rounded-md border border-border",
            "hover:bg-accent transition-colors cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
        >
          <div
            className="w-6 h-6 rounded border border-border shadow-sm flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-mono flex-1 text-left truncate">
            {color || 'transparent'}
          </span>
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <Label className="text-xs font-medium">{label}</Label>
          
          {/* Color preview and input */}
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-md border border-border shadow-inner flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                placeholder="#000000"
                className="font-mono text-sm h-8"
              />
            </div>
            {'EyeDropper' in window && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={handleEyedropper}
                title="Pick color from screen"
              >
                <Pipette className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Native color picker */}
          <input
            type="color"
            value={color.startsWith('#') ? color : '#000000'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-8 rounded cursor-pointer"
          />

          {/* Preset colors */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground">Presets</Label>
            <div className="grid grid-cols-8 gap-1">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className={cn(
                    "w-6 h-6 rounded border border-border transition-transform hover:scale-110",
                    color.toLowerCase() === presetColor.toLowerCase() && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorChange(presetColor)}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground">Recent</Label>
              <div className="flex flex-wrap gap-1">
                {recentColors.slice(0, 8).map((recentColor, i) => (
                  <button
                    key={`${recentColor}-${i}`}
                    className={cn(
                      "w-6 h-6 rounded border border-border transition-transform hover:scale-110",
                      color.toLowerCase() === recentColor.toLowerCase() && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ backgroundColor: recentColor }}
                    onClick={() => handleColorChange(recentColor)}
                    title={recentColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Transparent option */}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => handleColorChange('transparent')}
          >
            <div className="w-4 h-4 mr-2 rounded border border-dashed border-muted-foreground/50" />
            Transparent
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
