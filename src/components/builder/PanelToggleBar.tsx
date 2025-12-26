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
              'h-8 w-8 p-0 shrink-0 text-xs font-normal relative transition-all touch-manipulation',
              'xl:h-7 xl:w-auto xl:px-2 xl:gap-1.5',
              isActive 
                ? 'bg-primary/15 text-primary border border-primary/30' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !isDisabled && onTogglePanel(panelId)}
            disabled={isDisabled}
          >
            <Icon className="h-4 w-4 xl:h-3.5 xl:w-3.5 shrink-0" />
            <span className="hidden xl:inline truncate">{panel.name}</span>
            
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
    <div className="h-10 flex items-center gap-1 px-2 border-b border-border bg-muted/30 overflow-hidden">
      {/* Scrollable content area */}
      <div className="flex items-center gap-1 min-w-0 flex-1 overflow-x-auto scrollbar-none">
        {/* AI Panels */}
        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-[10px] uppercase text-muted-foreground/60 font-medium px-1 hidden 2xl:block">AI</span>
          {categories.ai.panels.map(renderPanelButton)}
        </div>

        <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

        {/* Cloud Panels */}
        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-[10px] uppercase text-muted-foreground/60 font-medium px-1 hidden 2xl:block">Cloud</span>
          {categories.cloud.panels.map(renderPanelButton)}
        </div>

        <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

        {/* Project Panels */}
        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-[10px] uppercase text-muted-foreground/60 font-medium px-1 hidden 2xl:block">Project</span>
          {categories.project.panels.map(renderPanelButton)}
        </div>

        {categories.tools.panels.length > 0 && (
          <>
            <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />
            
            {/* Tools Panels */}
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="text-[10px] uppercase text-muted-foreground/60 font-medium px-1 hidden 2xl:block">Tools</span>
              {categories.tools.panels.map(renderPanelButton)}
            </div>
          </>
        )}
      </div>

      {/* Preview Toggle - fixed on the right */}
      <div className="flex items-center shrink-0 ml-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0 shrink-0 touch-manipulation',
                'xl:h-7 xl:w-auto xl:px-2 xl:gap-1.5',
                showPreview 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={onTogglePreview}
            >
              {showPreview ? (
                <PanelRightClose className="h-4 w-4 xl:h-3.5 xl:w-3.5 shrink-0" />
              ) : (
                <PanelRightOpen className="h-4 w-4 xl:h-3.5 xl:w-3.5 shrink-0" />
              )}
              <span className="hidden xl:inline">Preview</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});
