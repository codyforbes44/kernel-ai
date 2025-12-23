import { Suspense } from 'react';
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PanelErrorBoundary } from './PanelErrorBoundary';
import { panelRegistry, type PanelId, type PanelType } from '@/registry/panelRegistry';

// Direct imports for non-lazy panels
import { BuilderChat } from './BuilderChat';
import { FileVersionHistory } from './FileVersionHistory';
import { DeploymentPanel } from './DeploymentPanel';
import { GitHubPanel } from './GitHubPanel';
import { DesignSystemPanel } from './DesignSystemPanel';
import { KnowledgeBasePanel } from './KnowledgeBasePanel';

// Lazy imports for heavy panels
import { lazy } from 'react';
const AgentChat = lazy(() => import('./AgentChat').then(m => ({ default: m.AgentChat })));
const AIAssetsPanel = lazy(() => import('./AIAssetsPanel').then(m => ({ default: m.AIAssetsPanel })));
const ComponentMarketplace = lazy(() => import('./ComponentMarketplace').then(m => ({ default: m.ComponentMarketplace })));
const StorageBrowser = lazy(() => import('./StorageBrowser').then(m => ({ default: m.StorageBrowser })));
const DatabasePanel = lazy(() => import('./DatabasePanel').then(m => ({ default: m.DatabasePanel })));
const SecurityDashboard = lazy(() => import('./SecurityDashboard').then(m => ({ default: m.SecurityDashboard })));
const XAutomationPanel = lazy(() => import('./XAutomationPanel').then(m => ({ default: m.XAutomationPanel })));

import type { ProjectFile } from '@/types/builder';
import type { CapturedError } from './ErrorCapture';

interface PanelRendererProps {
  activePanel: PanelType;
  projectId: string;
  projectName?: string;
  activeTabId: string | null;
  activeFileName: string | null;
  files: ProjectFile[];
  capturedErrors: CapturedError[];
  getFileContent: (fileId: string) => string;
  onApplyOperations: (operations: Array<{ type: 'create' | 'update' | 'delete'; path: string; content?: string }>) => Promise<void>;
  onClearErrors: () => void;
  onRestoreVersion: (content: string) => Promise<void>;
  onPreviewChange: (css: string | null, systemName?: string, fontsUrl?: string | null) => void;
  onInstallComponent: (code: string) => void;
  onInsertCode?: (code: string) => void;
  togglePanel: (panel: PanelType) => void;
  setActivePanel: (panel: PanelType) => void;
  getPanelConfig: (panel: PanelId) => { defaultSize: number; minSize: number; maxSize: number };
  onFixHandlerReady: (handler: (errors: CapturedError[]) => void) => void;
  onAgentRunningChange?: (isRunning: boolean) => void;
  aiStudioInitialTab?: 'generate' | 'screenshot' | 'library';
}

function PanelLoadingFallback() {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <LoadingSpinner size="md" />
    </div>
  );
}

/**
 * Renders the active panel using the panel registry for configuration.
 * Uses lazy loading for heavy components and wraps each panel in an error boundary.
 */
export function PanelRenderer({
  activePanel,
  projectId,
  projectName,
  activeTabId,
  activeFileName,
  files,
  capturedErrors,
  getFileContent,
  onApplyOperations,
  onClearErrors,
  onRestoreVersion,
  onPreviewChange,
  onInstallComponent,
  onInsertCode,
  togglePanel,
  setActivePanel,
  getPanelConfig,
  onFixHandlerReady,
  onAgentRunningChange,
  aiStudioInitialTab,
}: PanelRendererProps) {
  if (!activePanel) return null;

  const panelDef = panelRegistry.get(activePanel);
  const config = getPanelConfig(activePanel);
  const panelName = panelDef?.name ?? activePanel;

  // Map panel IDs to their rendered components
  const panelComponents: Record<PanelId, JSX.Element> = {
    'ai-chat': (
      <BuilderChat
        files={files}
        onApplyOperations={onApplyOperations}
        errors={capturedErrors}
        onClearErrors={onClearErrors}
        projectId={projectId}
        onFixHandlerReady={onFixHandlerReady}
        onOpenAIStudio={() => setActivePanel('ai-assets')}
      />
    ),
    'agent': (
      <Suspense fallback={<PanelLoadingFallback />}>
        <AgentChat
          files={files}
          projectId={projectId}
          errors={capturedErrors}
          onApplyOperations={onApplyOperations}
          onClearErrors={onClearErrors}
          onFixHandlerReady={onFixHandlerReady}
          onRunningChange={onAgentRunningChange}
        />
      </Suspense>
    ),
    'ai-assets': (
      <Suspense fallback={<PanelLoadingFallback />}>
        <AIAssetsPanel
          projectId={projectId}
          onInsertCode={onInsertCode}
          initialTab={aiStudioInitialTab}
        />
      </Suspense>
    ),
    'history': (
      <FileVersionHistory
        fileId={activeTabId}
        fileName={activeFileName}
        currentContent={activeTabId ? getFileContent(activeTabId) : ''}
        onRestore={onRestoreVersion}
        onClose={() => togglePanel('history')}
      />
    ),
    'deployments': (
      <DeploymentPanel
        projectId={projectId}
        onClose={() => togglePanel('deployments')}
      />
    ),
    'github': (
      <GitHubPanel
        projectId={projectId}
        projectName={projectName}
      />
    ),
    'design-system': (
      <DesignSystemPanel projectId={projectId} onPreviewChange={onPreviewChange} />
    ),
    'marketplace': (
      <Suspense fallback={<PanelLoadingFallback />}>
        <ComponentMarketplace
          projectId={projectId}
          onInstallComponent={onInstallComponent}
        />
      </Suspense>
    ),
    'knowledge-base': (
      <KnowledgeBasePanel projectId={projectId} />
    ),
    'storage': (
      <Suspense fallback={<PanelLoadingFallback />}>
        <StorageBrowser />
      </Suspense>
    ),
    'database': (
      <Suspense fallback={<PanelLoadingFallback />}>
        <DatabasePanel />
      </Suspense>
    ),
    'security': (
      <Suspense fallback={<PanelLoadingFallback />}>
        <SecurityDashboard />
      </Suspense>
    ),
    'x-automation': (
      <Suspense fallback={<PanelLoadingFallback />}>
        <XAutomationPanel />
      </Suspense>
    ),
  };

  const content = panelComponents[activePanel];
  if (!content) return null;

  return (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={config.defaultSize} minSize={config.minSize} maxSize={config.maxSize}>
        <PanelErrorBoundary panelName={panelName}>
          {content}
        </PanelErrorBoundary>
      </ResizablePanel>
    </>
  );
}
