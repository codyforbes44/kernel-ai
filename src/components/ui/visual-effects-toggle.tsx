import { Sparkles, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VisualEffectsToggleProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
}

export function VisualEffectsToggle({ 
  enabled, 
  onToggle, 
  className 
}: VisualEffectsToggleProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-9 w-9 rounded-full backdrop-blur-sm transition-all duration-300",
              enabled 
                ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted/80 border border-border/50",
              className
            )}
            aria-label={enabled ? "Disable visual effects" : "Enable visual effects"}
          >
            {enabled ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <SparklesIcon className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{enabled ? "Disable 3D effects" : "Enable 3D effects"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
