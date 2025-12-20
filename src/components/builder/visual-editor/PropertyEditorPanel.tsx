import { useState, useCallback } from 'react';
import { X, Type, Palette, BoxSelect, AlignLeft, RotateCcw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { SelectedElement } from '@/types/visual-editor';
import {
  TAILWIND_COLORS,
  TAILWIND_SHADES,
  TAILWIND_FONT_SIZES,
  TAILWIND_FONT_WEIGHTS,
  TAILWIND_SPACING,
} from '@/types/visual-editor';

interface PropertyEditorPanelProps {
  selectedElement: SelectedElement | null;
  onUpdateStyle: (property: string, value: string) => void;
  onUpdateText: (text: string) => void;
  onUpdateClasses: (classes: string) => void;
  onDeselect: () => void;
  onClose: () => void;
}

export function PropertyEditorPanel({
  selectedElement,
  onUpdateStyle,
  onUpdateText,
  onUpdateClasses,
  onDeselect,
  onClose,
}: PropertyEditorPanelProps) {
  const [editingText, setEditingText] = useState('');
  const [editingClasses, setEditingClasses] = useState('');
  const [copiedProperty, setCopiedProperty] = useState<string | null>(null);

  // Sync text editing state when element changes
  const handleTextChange = useCallback((value: string) => {
    setEditingText(value);
  }, []);

  const handleTextBlur = useCallback(() => {
    if (selectedElement && editingText !== selectedElement.textContent) {
      onUpdateText(editingText);
    }
  }, [selectedElement, editingText, onUpdateText]);

  const handleClassesChange = useCallback((value: string) => {
    setEditingClasses(value);
  }, []);

  const handleClassesBlur = useCallback(() => {
    if (selectedElement && editingClasses !== selectedElement.className) {
      onUpdateClasses(editingClasses);
    }
  }, [selectedElement, editingClasses, onUpdateClasses]);

  // Copy style value to clipboard
  const copyValue = useCallback((property: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedProperty(property);
    setTimeout(() => setCopiedProperty(null), 2000);
  }, []);

  if (!selectedElement) {
    return (
      <div className="h-full flex flex-col bg-card border-l border-border">
        <div className="h-10 flex items-center justify-between px-3 border-b border-border">
          <span className="text-sm font-medium">Visual Editor</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 text-center">
          <div>
            <BoxSelect className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Click an element in the preview to select it</p>
            <p className="text-xs mt-1 opacity-70">Then edit its properties here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            {selectedElement.tagName}
          </Badge>
          {selectedElement.id && (
            <span className="text-xs text-muted-foreground">#{selectedElement.id}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDeselect} title="Deselect">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="text" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b px-2 h-9">
          <TabsTrigger value="text" className="text-xs gap-1.5">
            <Type className="h-3.5 w-3.5" />
            Text
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Style
          </TabsTrigger>
          <TabsTrigger value="spacing" className="text-xs gap-1.5">
            <BoxSelect className="h-3.5 w-3.5" />
            Spacing
          </TabsTrigger>
          <TabsTrigger value="classes" className="text-xs gap-1.5">
            <AlignLeft className="h-3.5 w-3.5" />
            Classes
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Text Tab */}
          <TabsContent value="text" className="m-0 p-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Text Content</Label>
                {selectedElement.textContent ? (
                  <Input
                    value={editingText || selectedElement.textContent}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onBlur={handleTextBlur}
                    onFocus={() => setEditingText(selectedElement.textContent)}
                    placeholder="Enter text..."
                    className="text-sm"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    This element contains child elements, not direct text
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Font Size</Label>
                <div className="flex flex-wrap gap-1">
                  {TAILWIND_FONT_SIZES.slice(0, 7).map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-7 px-2 text-xs',
                        selectedElement.tailwindClasses.includes(`text-${size}`) && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => {
                        const newClasses = selectedElement.tailwindClasses
                          .filter(c => !c.startsWith('text-') || TAILWIND_COLORS.some(color => c.includes(color)))
                          .concat(`text-${size}`)
                          .join(' ');
                        onUpdateClasses(newClasses);
                      }}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Font Weight</Label>
                <div className="flex flex-wrap gap-1">
                  {TAILWIND_FONT_WEIGHTS.map((weight) => (
                    <Button
                      key={weight}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-7 px-2 text-xs',
                        selectedElement.tailwindClasses.includes(`font-${weight}`) && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => {
                        const newClasses = selectedElement.tailwindClasses
                          .filter(c => !c.startsWith('font-'))
                          .concat(`font-${weight}`)
                          .join(' ');
                        onUpdateClasses(newClasses);
                      }}
                    >
                      {weight}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="m-0 p-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Text Color</Label>
                <div className="grid grid-cols-6 gap-1">
                  {TAILWIND_COLORS.slice(0, 12).map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'w-7 h-7 rounded border border-border transition-transform hover:scale-110',
                        `bg-${color}-500`,
                        selectedElement.tailwindClasses.some(c => c.startsWith(`text-${color}`)) && 'ring-2 ring-primary ring-offset-1'
                      )}
                      style={{ backgroundColor: `var(--color-${color}-500, #888)` }}
                      title={color}
                      onClick={() => {
                        const newClasses = selectedElement.tailwindClasses
                          .filter(c => !c.startsWith('text-') || TAILWIND_FONT_SIZES.some(s => c === `text-${s}`))
                          .concat(`text-${color}-600`)
                          .join(' ');
                        onUpdateClasses(newClasses);
                      }}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Background Color</Label>
                <div className="grid grid-cols-6 gap-1">
                  <button
                    className={cn(
                      'w-7 h-7 rounded border-2 border-dashed border-muted-foreground/30',
                      selectedElement.tailwindClasses.includes('bg-transparent') && 'ring-2 ring-primary ring-offset-1'
                    )}
                    title="transparent"
                    onClick={() => {
                      const newClasses = selectedElement.tailwindClasses
                        .filter(c => !c.startsWith('bg-'))
                        .concat('bg-transparent')
                        .join(' ');
                      onUpdateClasses(newClasses);
                    }}
                  />
                  <button
                    className={cn(
                      'w-7 h-7 rounded border border-border bg-white',
                      selectedElement.tailwindClasses.includes('bg-white') && 'ring-2 ring-primary ring-offset-1'
                    )}
                    title="white"
                    onClick={() => {
                      const newClasses = selectedElement.tailwindClasses
                        .filter(c => !c.startsWith('bg-'))
                        .concat('bg-white')
                        .join(' ');
                      onUpdateClasses(newClasses);
                    }}
                  />
                  <button
                    className={cn(
                      'w-7 h-7 rounded border border-border bg-black',
                      selectedElement.tailwindClasses.includes('bg-black') && 'ring-2 ring-primary ring-offset-1'
                    )}
                    title="black"
                    onClick={() => {
                      const newClasses = selectedElement.tailwindClasses
                        .filter(c => !c.startsWith('bg-'))
                        .concat('bg-black')
                        .join(' ');
                      onUpdateClasses(newClasses);
                    }}
                  />
                  {TAILWIND_COLORS.slice(0, 9).map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'w-7 h-7 rounded border border-border transition-transform hover:scale-110',
                        selectedElement.tailwindClasses.some(c => c.startsWith(`bg-${color}`)) && 'ring-2 ring-primary ring-offset-1'
                      )}
                      style={{ backgroundColor: `var(--color-${color}-500, #888)` }}
                      title={color}
                      onClick={() => {
                        const newClasses = selectedElement.tailwindClasses
                          .filter(c => !c.startsWith('bg-'))
                          .concat(`bg-${color}-500`)
                          .join(' ');
                        onUpdateClasses(newClasses);
                      }}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Border Radius</Label>
                <div className="flex flex-wrap gap-1">
                  {['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].map((radius) => (
                    <Button
                      key={radius}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-7 px-2 text-xs',
                        selectedElement.tailwindClasses.includes(`rounded-${radius}`) && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => {
                        const newClasses = selectedElement.tailwindClasses
                          .filter(c => !c.startsWith('rounded'))
                          .concat(radius === 'none' ? '' : `rounded-${radius}`)
                          .filter(Boolean)
                          .join(' ');
                        onUpdateClasses(newClasses);
                      }}
                    >
                      {radius}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="m-0 p-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Padding</Label>
                <div className="flex flex-wrap gap-1">
                  {['0', '1', '2', '3', '4', '6', '8', '10', '12', '16'].map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-7 px-2 text-xs',
                        selectedElement.tailwindClasses.includes(`p-${size}`) && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => {
                        const newClasses = selectedElement.tailwindClasses
                          .filter(c => c !== 'p-' && !c.match(/^p-\d+$/))
                          .concat(`p-${size}`)
                          .join(' ');
                        onUpdateClasses(newClasses);
                      }}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Margin</Label>
                <div className="flex flex-wrap gap-1">
                  {['0', '1', '2', '3', '4', '6', '8', 'auto'].map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-7 px-2 text-xs',
                        selectedElement.tailwindClasses.includes(`m-${size}`) && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => {
                        const newClasses = selectedElement.tailwindClasses
                          .filter(c => c !== 'm-' && !c.match(/^m-(\d+|auto)$/))
                          .concat(`m-${size}`)
                          .join(' ');
                        onUpdateClasses(newClasses);
                      }}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Gap (Flex/Grid)</Label>
                <div className="flex flex-wrap gap-1">
                  {['0', '1', '2', '3', '4', '6', '8'].map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-7 px-2 text-xs',
                        selectedElement.tailwindClasses.includes(`gap-${size}`) && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => {
                        const newClasses = selectedElement.tailwindClasses
                          .filter(c => !c.match(/^gap-\d+$/))
                          .concat(`gap-${size}`)
                          .join(' ');
                        onUpdateClasses(newClasses);
                      }}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="m-0 p-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Current Classes</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedElement.tailwindClasses.length > 0 ? (
                    selectedElement.tailwindClasses.map((cls, i) => (
                      <Badge
                        key={`${cls}-${i}`}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          const newClasses = selectedElement.tailwindClasses
                            .filter((_, idx) => idx !== i)
                            .join(' ');
                          onUpdateClasses(newClasses);
                        }}
                      >
                        {cls}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No classes</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Edit Classes</Label>
                <Input
                  value={editingClasses || selectedElement.className}
                  onChange={(e) => handleClassesChange(e.target.value)}
                  onBlur={handleClassesBlur}
                  onFocus={() => setEditingClasses(selectedElement.className)}
                  placeholder="Add Tailwind classes..."
                  className="text-sm font-mono"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Computed Styles</Label>
                <div className="space-y-1 text-xs font-mono">
                  {Object.entries(selectedElement.styles).map(([prop, value]) => (
                    <div
                      key={prop}
                      className="flex items-center justify-between py-1 px-2 rounded bg-muted/50 group"
                    >
                      <span className="text-muted-foreground">{prop}:</span>
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[120px]">{value}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100"
                          onClick={() => copyValue(prop, value)}
                        >
                          {copiedProperty === prop ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
