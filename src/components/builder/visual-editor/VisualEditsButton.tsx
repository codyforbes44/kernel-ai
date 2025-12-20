import { MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VisualEditsButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function VisualEditsButton({ isActive, onClick, disabled }: VisualEditsButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          className={cn(
            "gap-2 h-9 px-3",
            "transition-all duration-200",
            isActive && [
              "bg-primary text-primary-foreground",
              "shadow-[0_0_12px_hsl(var(--primary)/0.4)]",
            ],
            !isActive && [
              "hover:bg-primary/10 hover:text-primary hover:border-primary/50",
            ]
          )}
          onClick={onClick}
          disabled={disabled}
        >
          <MousePointer2 className={cn(
            "h-4 w-4",
            isActive && "animate-pulse"
          )} />
          <span className="hidden sm:inline text-xs font-medium">
            {isActive ? 'Editing' : 'Visual Edits'}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {isActive 
          ? 'Click elements in preview to edit. Press ESC to exit.'
          : 'Click to edit elements visually in the preview'
        }
      </TooltipContent>
    </Tooltip>
  );
}
