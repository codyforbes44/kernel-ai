import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { VisualEditsButton } from '../visual-editor/VisualEditsButton';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface ViewportConfig {
  width: string;
  height?: string;
  icon: React.ReactNode;
  label: string;
  dimensions: string;
}

export const viewportConfig: Record<ViewportSize, ViewportConfig> = {
  desktop: { 
    width: '100%', 
    icon: <Monitor className="h-4 w-4" />, 
    label: 'Desktop',
    dimensions: '1920×1080'
  },
  tablet: { 
    width: '768px', 
    height: '1024px',
    icon: <Tablet className="h-4 w-4" />, 
    label: 'Tablet',
    dimensions: '768×1024'
  },
  mobile: { 
    width: '375px', 
    height: '812px',
    icon: <Smartphone className="h-4 w-4" />, 
    label: 'Mobile',
    dimensions: '375×812'
  },
};

interface PreviewToolbarProps {
  viewport: ViewportSize;
  onViewportChange: (viewport: ViewportSize) => void;
  onRefresh: () => void;
  onOpenExternal: () => void;
  isVisualEditorActive: boolean;
  onToggleVisualEditor: () => void;
  currentPath?: string;
  isBundling?: boolean;
}

export function PreviewToolbar({
  viewport,
  onViewportChange,
  onRefresh,
  onOpenExternal,
  isVisualEditorActive,
  onToggleVisualEditor,
  currentPath = '/',
  isBundling = false,
}: PreviewToolbarProps) {
  return (
    <div className="h-11 flex items-center justify-between px-2 border-b border-border bg-muted/40 backdrop-blur-sm">
      {/* Left side - URL bar style preview indicator */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-1 px-2 py-1 bg-background/80 border border-border/50 rounded-md min-w-0 max-w-[200px]">
          <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate font-mono">
            {currentPath}
          </span>
        </div>
        
        {isBundling && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">Bundling...</span>
          </div>
        )}
      </div>

      {/* Center - Viewport toggles */}
      <div className="flex items-center gap-0.5 bg-background/60 rounded-lg p-0.5 border border-border/50">
        {(Object.entries(viewportConfig) as [ViewportSize, ViewportConfig][]).map(([key, config]) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-7 w-7 rounded-md transition-all',
                  viewport === key && [
                    'bg-primary text-primary-foreground shadow-sm',
                    'hover:bg-primary hover:text-primary-foreground',
                  ],
                  viewport !== key && 'hover:bg-muted'
                )}
                onClick={() => onViewportChange(key)}
              >
                {config.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-medium">{config.label}</p>
              <p className="text-muted-foreground">{config.dimensions}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1 flex-1 justify-end">
        <VisualEditsButton
          isActive={isVisualEditorActive}
          onClick={onToggleVisualEditor}
        />
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onRefresh}
            >
              <RefreshCw className={cn("h-4 w-4", isBundling && "animate-spin")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Refresh preview</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onOpenExternal}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Open in new tab</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
