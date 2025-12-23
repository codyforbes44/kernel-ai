import { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CollaboratorAvatars } from './CollaboratorAvatars';
import { 
  Save, Code2, Globe, MoreVertical, Settings, Copy,
  Sparkles, History, Rocket, Github, Palette, Package, 
  BookMarked, HardDrive, Database, Bot, Shield, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PanelType } from '@/hooks/usePanelManager';

// Panel toolbar button configuration
export const PANEL_BUTTONS: Array<{
  panel: PanelType;
  icon: typeof Sparkles;
  label: string;
  requiresActiveFile?: boolean;
}> = [
  { panel: 'database', icon: Database, label: 'Database' },
  { panel: 'security', icon: Shield, label: 'Security Scanner' },
  { panel: 'design-system', icon: Palette, label: 'Design System' },
  { panel: 'marketplace', icon: Package, label: 'Component Marketplace' },
  { panel: 'github', icon: Github, label: 'GitHub' },
  { panel: 'deployments', icon: Rocket, label: 'Deployments' },
  { panel: 'history', icon: History, label: 'Version History', requiresActiveFile: true },
  { panel: 'knowledge-base', icon: BookMarked, label: 'Knowledge Base' },
  { panel: 'storage', icon: HardDrive, label: 'File Storage' },
  { panel: 'ai-assets', icon: Wand2, label: 'AI Studio' },
  { panel: 'agent', icon: Bot, label: 'AI Agent (Autonomous)' },
  { panel: 'ai-chat', icon: Sparkles, label: 'AI Assistant' },
];

interface BuilderHeaderProps {
  projectId: string;
  projectName?: string;
  isPublic?: boolean;
  activeTabId: string | null;
  isAgentRunning: boolean;
  isPanelActive: (panel: PanelType) => boolean;
  togglePanel: (panel: PanelType) => void;
  onSave: () => void;
  onOpenSettings: () => void;
  onOpenRemix: () => void;
}

export const BuilderHeader = memo(function BuilderHeader({
  projectId,
  projectName,
  isPublic,
  activeTabId,
  isAgentRunning,
  isPanelActive,
  togglePanel,
  onSave,
  onOpenSettings,
  onOpenRemix,
}: BuilderHeaderProps) {
  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/builder" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Code2 className="h-4 w-4" />
                Builder
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium flex items-center gap-2">
              {projectName}
              {isPublic && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">
                  <Globe className="h-3 w-3" />
                  Public
                </span>
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center gap-2">
        {/* Collaborator Avatars */}
        <CollaboratorAvatars projectId={projectId} />
        
        {/* Panel toggle buttons */}
        {PANEL_BUTTONS.map(({ panel, icon: Icon, label, requiresActiveFile }) => (
          <Tooltip key={panel}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8 relative', isPanelActive(panel) && 'bg-primary/10 text-primary')}
                onClick={() => togglePanel(panel)}
                disabled={requiresActiveFile && !activeTabId}
              >
                <Icon className="h-4 w-4" />
                {/* Agent running indicator */}
                {panel === 'agent' && isAgentRunning && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {panel === 'agent' && isAgentRunning ? `${label} (Running...)` : label}
            </TooltipContent>
          </Tooltip>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Project Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenRemix}>
              <Copy className="h-4 w-4 mr-2" />
              Remix Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});
