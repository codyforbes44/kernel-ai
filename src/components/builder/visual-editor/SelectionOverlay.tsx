import { useMemo } from 'react';
import type { SelectedElement } from '@/types/visual-editor';
import { cn } from '@/lib/utils';

interface SelectionOverlayProps {
  selectedElement: SelectedElement | null;
  hoveredElement: SelectedElement | null;
  isEnabled: boolean;
  containerRef: React.RefObject<HTMLElement>;
}

export function SelectionOverlay({
  selectedElement,
  hoveredElement,
  isEnabled,
  containerRef,
}: SelectionOverlayProps) {
  // Calculate positions relative to container
  const containerRect = containerRef.current?.getBoundingClientRect();

  const selectedStyle = useMemo(() => {
    if (!selectedElement || !containerRect) return null;
    return {
      top: selectedElement.rect.top,
      left: selectedElement.rect.left,
      width: selectedElement.rect.width,
      height: selectedElement.rect.height,
    };
  }, [selectedElement, containerRect]);

  const hoveredStyle = useMemo(() => {
    if (!hoveredElement || !containerRect || hoveredElement === selectedElement) return null;
    return {
      top: hoveredElement.rect.top,
      left: hoveredElement.rect.left,
      width: hoveredElement.rect.width,
      height: hoveredElement.rect.height,
    };
  }, [hoveredElement, selectedElement, containerRect]);

  if (!isEnabled) return null;

  return (
    <>
      {/* Element label badge - shows what's selected */}
      {selectedElement && selectedStyle && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            top: Math.max(0, selectedStyle.top - 24),
            left: selectedStyle.left,
          }}
        >
          <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-t font-mono">
            {selectedElement.tagName}
            {selectedElement.className && (
              <span className="opacity-70 ml-1">
                .{selectedElement.className.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Hovered element info */}
      {hoveredElement && hoveredStyle && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            top: Math.max(0, hoveredStyle.top - 20),
            left: hoveredStyle.left,
          }}
        >
          <div className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded font-mono opacity-80">
            {hoveredElement.tagName}
          </div>
        </div>
      )}
    </>
  );
}
