import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { LucideIcon } from 'lucide-react';
import {
  Bot,
  History,
  Rocket,
  Github,
  Palette,
  Package,
  BookOpen,
  Database,
  HardDrive,
  Shield,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { XLogo } from '@/components/ui/x-logo';

// ============================================
// Panel Type Definition
// ============================================

export type PanelId =
  | 'ai-chat'
  | 'ai-assets'
  | 'agent'
  | 'history'
  | 'deployments'
  | 'github'
  | 'design-system'
  | 'marketplace'
  | 'knowledge-base'
  | 'storage'
  | 'database'
  | 'security'
  | 'x-automation';

// For backwards compatibility
export type PanelType = PanelId | null;

// ============================================
// Panel Configuration
// ============================================

export interface PanelSizeConfig {
  defaultSize: number;
  minSize: number;
  maxSize: number;
}

export interface PanelDefinition {
  id: PanelId;
  name: string;
  description?: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  /** Size configuration for resizable panel */
  size: PanelSizeConfig;
  /** Whether to lazy load the component */
  lazy?: boolean;
  /** Category for grouping in UI */
  category: 'ai' | 'project' | 'cloud' | 'tools';
  /** Keyboard shortcut */
  shortcut?: string;
}

// ============================================
// Panel Registry
// ============================================

const panelDefinitions: PanelDefinition[] = [
  // AI Category
  {
    id: 'ai-chat',
    name: 'AI Assistant',
    description: 'Chat with AI to build your app',
    icon: Bot,
    size: { defaultSize: 25, minSize: 20, maxSize: 40 },
    category: 'ai',
    shortcut: 'Ctrl+Shift+A',
  },
  {
    id: 'agent',
    name: 'AI Agent',
    description: 'Autonomous AI agent for complex tasks',
    icon: Cpu,
    size: { defaultSize: 30, minSize: 25, maxSize: 50 },
    lazy: true,
    category: 'ai',
  },
  {
    id: 'ai-assets',
    name: 'AI Studio',
    description: 'Generate images and assets with AI',
    icon: Sparkles,
    size: { defaultSize: 30, minSize: 25, maxSize: 45 },
    lazy: true,
    category: 'ai',
  },
  
  // Project Category
  {
    id: 'history',
    name: 'Version History',
    description: 'View and restore file versions',
    icon: History,
    size: { defaultSize: 25, minSize: 20, maxSize: 40 },
    category: 'project',
  },
  {
    id: 'deployments',
    name: 'Deployments',
    description: 'Manage deployments and domains',
    icon: Rocket,
    size: { defaultSize: 25, minSize: 20, maxSize: 40 },
    category: 'project',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync with GitHub repository',
    icon: Github,
    size: { defaultSize: 25, minSize: 20, maxSize: 40 },
    category: 'project',
  },
  {
    id: 'design-system',
    name: 'Design System',
    description: 'Manage colors, typography, and tokens',
    icon: Palette,
    size: { defaultSize: 25, minSize: 20, maxSize: 40 },
    category: 'project',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    description: 'Project context and documentation',
    icon: BookOpen,
    size: { defaultSize: 25, minSize: 20, maxSize: 40 },
    category: 'project',
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Browse and install components',
    icon: Package,
    size: { defaultSize: 30, minSize: 25, maxSize: 50 },
    lazy: true,
    category: 'project',
  },
  
  // Cloud Category
  {
    id: 'database',
    name: 'Database',
    description: 'Manage database tables and records',
    icon: Database,
    size: { defaultSize: 50, minSize: 35, maxSize: 70 },
    lazy: true,
    category: 'cloud',
  },
  {
    id: 'storage',
    name: 'Storage',
    description: 'Manage file storage buckets',
    icon: HardDrive,
    size: { defaultSize: 30, minSize: 25, maxSize: 50 },
    lazy: true,
    category: 'cloud',
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Security scanner and RLS policies',
    icon: Shield,
    size: { defaultSize: 40, minSize: 30, maxSize: 60 },
    lazy: true,
    category: 'cloud',
  },
  
  // Tools Category
  {
    id: 'x-automation',
    name: 'X Automation',
    description: 'Generate and schedule tweets',
    icon: XLogo,
    size: { defaultSize: 30, minSize: 25, maxSize: 50 },
    lazy: true,
    category: 'tools',
  },
];

// ============================================
// Registry Class
// ============================================

class PanelRegistry {
  private panels: Map<PanelId, PanelDefinition> = new Map();
  
  constructor(definitions: PanelDefinition[]) {
    definitions.forEach(def => this.panels.set(def.id, def));
  }
  
  get(id: PanelId): PanelDefinition | undefined {
    return this.panels.get(id);
  }
  
  getAll(): PanelDefinition[] {
    return Array.from(this.panels.values());
  }
  
  getByCategory(category: PanelDefinition['category']): PanelDefinition[] {
    return this.getAll().filter(p => p.category === category);
  }
  
  getSizeConfig(id: PanelId): PanelSizeConfig {
    const panel = this.panels.get(id);
    if (!panel) {
      return { defaultSize: 25, minSize: 20, maxSize: 40 };
    }
    return panel.size;
  }
  
  getAllIds(): PanelId[] {
    return Array.from(this.panels.keys());
  }
  
  has(id: string): id is PanelId {
    return this.panels.has(id as PanelId);
  }
}

// Singleton instance
export const panelRegistry = new PanelRegistry(panelDefinitions);

// ============================================
// Lazy Component Loaders
// ============================================

export const lazyPanelComponents = {
  'ai-chat': () => import('@/components/builder/BuilderChat').then(m => m.BuilderChat),
  'agent': lazy(() => import('@/components/builder/AgentChat').then(m => ({ default: m.AgentChat }))),
  'ai-assets': lazy(() => import('@/components/builder/AIAssetsPanel').then(m => ({ default: m.AIAssetsPanel }))),
  'history': () => import('@/components/builder/FileVersionHistory').then(m => m.FileVersionHistory),
  'deployments': () => import('@/components/builder/DeploymentPanel').then(m => m.DeploymentPanel),
  'github': () => import('@/components/builder/GitHubPanel').then(m => m.GitHubPanel),
  'design-system': () => import('@/components/builder/DesignSystemPanel').then(m => m.DesignSystemPanel),
  'marketplace': lazy(() => import('@/components/builder/ComponentMarketplace').then(m => ({ default: m.ComponentMarketplace }))),
  'knowledge-base': () => import('@/components/builder/KnowledgeBasePanel').then(m => m.KnowledgeBasePanel),
  'storage': lazy(() => import('@/components/builder/StorageBrowser').then(m => ({ default: m.StorageBrowser }))),
  'database': lazy(() => import('@/components/builder/DatabasePanel').then(m => ({ default: m.DatabasePanel }))),
  'security': lazy(() => import('@/components/builder/SecurityDashboard').then(m => ({ default: m.SecurityDashboard }))),
  'x-automation': lazy(() => import('@/components/builder/XAutomationPanel').then(m => ({ default: m.XAutomationPanel }))),
} as const;

// ============================================
// Helper Hooks & Functions
// ============================================

export function getPanelDefinition(id: PanelId): PanelDefinition {
  const def = panelRegistry.get(id);
  if (!def) {
    throw new Error(`Panel "${id}" not found in registry`);
  }
  return def;
}

export function getPanelsByCategory(): Record<PanelDefinition['category'], PanelDefinition[]> {
  return {
    ai: panelRegistry.getByCategory('ai'),
    project: panelRegistry.getByCategory('project'),
    cloud: panelRegistry.getByCategory('cloud'),
    tools: panelRegistry.getByCategory('tools'),
  };
}

// ============================================
// Re-export for convenience
// ============================================

export { panelDefinitions };
