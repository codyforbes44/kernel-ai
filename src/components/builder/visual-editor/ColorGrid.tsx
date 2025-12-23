import { cn } from '@/lib/utils';

interface ColorGridProps {
  colors: readonly string[];
  selectedClasses: string[];
  classPrefix: string;
  onSelectColor: (colorClass: string) => void;
  includeSpecials?: boolean;
}

/**
 * Reusable color grid component for selecting Tailwind color classes
 */
export function ColorGrid({
  colors,
  selectedClasses,
  classPrefix,
  onSelectColor,
  includeSpecials = false,
}: ColorGridProps) {
  const isSelected = (colorClass: string) => 
    selectedClasses.some(c => c.startsWith(colorClass) || c === colorClass);

  return (
    <div className="grid grid-cols-6 gap-1">
      {includeSpecials && (
        <>
          {/* Transparent */}
          <button
            type="button"
            className={cn(
              'w-7 h-7 rounded border-2 border-dashed border-muted-foreground/30',
              isSelected(`${classPrefix}-transparent`) && 'ring-2 ring-primary ring-offset-1'
            )}
            title="transparent"
            onClick={() => onSelectColor(`${classPrefix}-transparent`)}
          />
          {/* White */}
          <button
            type="button"
            className={cn(
              'w-7 h-7 rounded border border-border bg-white',
              isSelected(`${classPrefix}-white`) && 'ring-2 ring-primary ring-offset-1'
            )}
            title="white"
            onClick={() => onSelectColor(`${classPrefix}-white`)}
          />
          {/* Black */}
          <button
            type="button"
            className={cn(
              'w-7 h-7 rounded border border-border bg-black',
              isSelected(`${classPrefix}-black`) && 'ring-2 ring-primary ring-offset-1'
            )}
            title="black"
            onClick={() => onSelectColor(`${classPrefix}-black`)}
          />
        </>
      )}
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={cn(
            'w-7 h-7 rounded border border-border transition-transform hover:scale-110',
            isSelected(`${classPrefix}-${color}`) && 'ring-2 ring-primary ring-offset-1'
          )}
          style={{ backgroundColor: `var(--color-${color}-500, #888)` }}
          title={color}
          onClick={() => onSelectColor(`${classPrefix}-${color}-500`)}
        />
      ))}
    </div>
  );
}
