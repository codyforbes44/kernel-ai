import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { panelRegistry, type PanelId, type PanelType } from '@/registry/panelRegistry';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';

interface PanelToggleBarProps {
  activePanel: PanelType;
  activeTabId: string | null;
  isAgentRunning?: boolean;
  showPreview: boolean;
  onTogglePanel: (panel: PanelType) => void;
  onTogglePreview: () => void;
}

// Ordered panels by category for display
const PANEL_ORDER: PanelId[] = [
  // AI
  'ai-chat',
  'agent',
  'ai-assets',
  // Cloud
  'database',
  'storage',
  'security',
  // Project
  'history',
  'deployments',
  'github',
  'design-system',
  'marketplace',
  'knowledge-base',
  // Tools
  'x-automation',
];

// Panels that require an active file
const REQUIRES_ACTIVE_FILE: PanelId[] = ['history'];

export const PanelToggleBar = memo(function PanelToggleBar({
  activePanel,
  activeTabId,
  isAgentRunning = false,
  showPreview,
  onTogglePanel,
  onTogglePreview,
}: PanelToggleBarProps) {
  const categories = {
    ai: { label: 'AI', panels: PANEL_ORDER.filter(id => panelRegistry.get(id)?.category === 'ai') },
    cloud: { label: 'Cloud', panels: PANEL_ORDER.filter(id => panelRegistry.get(id)?.category === 'cloud') },
    project: { label: 'Project', panels: PANEL_ORDER.filter(id => panelRegistry.get(id)?.category === 'project') },
    tools: { label: 'Tools', panels: PANEL_ORDER.filter(id => panelRegistry.get(id)?.category === 'tools') },
  };

  const renderPanelButton = (panelId: PanelId) => {
    const panel = panelRegistry.get(panelId);
    if (!panel) return null;

    const Icon = panel.icon;
    const isActive = activePanel === panelId;
    const requiresFile = REQUIRES_ACTIVE_FILE.includes(panelId);
    const isDisabled = requiresFile && !activeTabId;

    return (
      <Tooltip key={panelId}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              // Mobile-first: taller touch targets, icon-only
              'h-9 w-9 p-0 md:h-8 md:w-auto md:px-2 gap-1.5 text-xs font-normal relative transition-all touch-manipulation',
              isActive 
                ? 'bg-primary/15 text-primary border border-primary/30' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !isDisabled && onTogglePanel(panelId)}
            disabled={isDisabled}
          >
            <Icon className="h-4 w-4 md:h-3.5 md:w-3.5" />
            <span className="hidden lg:inline">{panel.name}</span>
            
            {/* Agent running indicator */}
            {panelId === 'agent' && isAgentRunning && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{panel.name}</p>
          {panel.description && (
            <p className="text-muted-foreground">{panel.description}</p>
          )}
          {panelId === 'agent' && isAgentRunning && (
            <p className="text-primary font-medium">Running...</p>
          )}
          {requiresFile && !activeTabId && (
            <p className="text-destructive">Requires an open file</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="h-12 md:h-10 flex items-center gap-1 px-2 md:px-3 border-b border-border bg-muted/30 overflow-x-auto scrollbar-none">
      {/* AI Panels */}
      <div className="flex items-center gap-0.5">
        <span className="text-[10px] uppercase text-muted-foreground/60 font-medium px-1 hidden xl:block">AI</span>
        {categories.ai.panels.map(renderPanelButton)}
      </div>

      <Separator orientation="vertical" className="h-5 mx-0.5 md:mx-1" />

      {/* Cloud Panels */}
      <div className="flex items-center gap-0.5">
        <span className="text-[10px] uppercase text-muted-foreground/60 font-medium px-1 hidden xl:block">Cloud</span>
        {categories.cloud.panels.map(renderPanelButton)}
      </div>

      <Separator orientation="vertical" className="h-5 mx-0.5 md:mx-1" />

      {/* Project Panels */}
      <div className="flex items-center gap-0.5">
        <span className="text-[10px] uppercase text-muted-foreground/60 font-medium px-1 hidden xl:block">Project</span>
        {categories.project.panels.map(renderPanelButton)}
      </div>

      {categories.tools.panels.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-5 mx-0.5 md:mx-1" />
          
          {/* Tools Panels */}
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] uppercase text-muted-foreground/60 font-medium px-1 hidden xl:block">Tools</span>
            {categories.tools.panels.map(renderPanelButton)}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1 min-w-2" />

      {/* Preview Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-9 w-9 p-0 md:h-8 md:w-auto md:px-2 gap-1.5 text-xs font-normal touch-manipulation',
              showPreview 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={onTogglePreview}
          >
            {showPreview ? (
              <PanelRightClose className="h-4 w-4 md:h-3.5 md:w-3.5" />
            ) : (
              <PanelRightOpen className="h-4 w-4 md:h-3.5 md:w-3.5" />
            )}
            <span className="hidden lg:inline">Preview</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
});
