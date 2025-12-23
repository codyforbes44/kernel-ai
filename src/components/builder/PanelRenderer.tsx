import { lazy, Suspense } from 'react';
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import { BuilderChat } from './BuilderChat';
import { FileVersionHistory } from './FileVersionHistory';
import { DeploymentPanel } from './DeploymentPanel';
import { GitHubPanel } from './GitHubPanel';
import { DesignSystemPanel } from './DesignSystemPanel';
import { KnowledgeBasePanel } from './KnowledgeBasePanel';
import { SecurityPanel } from './SecurityPanel';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PanelErrorBoundary } from './PanelErrorBoundary';
import type { PanelType } from '@/hooks/usePanelManager';
import type { ProjectFile } from '@/types/builder';
import type { CapturedError } from './ErrorCapture';

// Lazy load heavy components
const ComponentMarketplace = lazy(() => 
  import('./ComponentMarketplace').then(m => ({ default: m.ComponentMarketplace }))
);
const StorageBrowser = lazy(() => 
  import('./StorageBrowser').then(m => ({ default: m.StorageBrowser }))
);
const DatabasePanel = lazy(() => 
  import('./DatabasePanel').then(m => ({ default: m.DatabasePanel }))
);
const SecurityDashboard = lazy(() => 
  import('./SecurityDashboard').then(m => ({ default: m.SecurityDashboard }))
);
const AgentChat = lazy(() => 
  import('./AgentChat').then(m => ({ default: m.AgentChat }))
);
const AIAssetsPanel = lazy(() => 
  import('./AIAssetsPanel').then(m => ({ default: m.AIAssetsPanel }))
);

interface PanelRendererProps {
  activePanel: PanelType | null;
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
  getPanelConfig: (panel: PanelType) => { defaultSize: number; minSize: number; maxSize: number };
  onFixHandlerReady: (handler: (errors: CapturedError[]) => void) => void;
  onAgentRunningChange?: (isRunning: boolean) => void;
  aiStudioInitialTab?: 'generate' | 'screenshot' | 'library';
}

// Loading fallback for lazy-loaded panels
function PanelLoadingFallback() {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <LoadingSpinner size="md" />
    </div>
  );
}

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

  const config = getPanelConfig(activePanel);

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'ai-chat':
        return (
          <PanelErrorBoundary panelName="AI Assistant">
            <BuilderChat
              files={files}
              onApplyOperations={onApplyOperations}
              errors={capturedErrors}
              onClearErrors={onClearErrors}
              projectId={projectId}
              onFixHandlerReady={onFixHandlerReady}
              onOpenAIStudio={(tab) => {
                setActivePanel('ai-assets');
              }}
            />
          </PanelErrorBoundary>
        );

      case 'agent':
        return (
          <PanelErrorBoundary panelName="AI Agent">
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
          </PanelErrorBoundary>
        );

      case 'history':
        return (
          <PanelErrorBoundary panelName="Version History">
            <FileVersionHistory
              fileId={activeTabId}
              fileName={activeFileName}
              currentContent={activeTabId ? getFileContent(activeTabId) : ''}
              onRestore={onRestoreVersion}
              onClose={() => togglePanel('history')}
            />
          </PanelErrorBoundary>
        );

      case 'deployments':
        return (
          <PanelErrorBoundary panelName="Deployments">
            <DeploymentPanel
              projectId={projectId}
              onClose={() => togglePanel('deployments')}
            />
          </PanelErrorBoundary>
        );

      case 'github':
        return (
          <PanelErrorBoundary panelName="GitHub">
            <GitHubPanel
              projectId={projectId}
              projectName={projectName}
            />
          </PanelErrorBoundary>
        );

      case 'design-system':
        return (
          <PanelErrorBoundary panelName="Design System">
            <DesignSystemPanel projectId={projectId} onPreviewChange={onPreviewChange} />
          </PanelErrorBoundary>
        );

      case 'marketplace':
        return (
          <PanelErrorBoundary panelName="Component Marketplace">
            <Suspense fallback={<PanelLoadingFallback />}>
              <ComponentMarketplace 
                projectId={projectId}
                onInstallComponent={onInstallComponent}
              />
            </Suspense>
          </PanelErrorBoundary>
        );

      case 'knowledge-base':
        return (
          <PanelErrorBoundary panelName="Knowledge Base">
            <KnowledgeBasePanel projectId={projectId} />
          </PanelErrorBoundary>
        );

      case 'storage':
        return (
          <PanelErrorBoundary panelName="File Storage">
            <Suspense fallback={<PanelLoadingFallback />}>
              <StorageBrowser />
            </Suspense>
          </PanelErrorBoundary>
        );

      case 'database':
        return (
          <PanelErrorBoundary panelName="Database">
            <Suspense fallback={<PanelLoadingFallback />}>
              <DatabasePanel />
            </Suspense>
          </PanelErrorBoundary>
        );

      case 'security':
        return (
          <PanelErrorBoundary panelName="Security Scanner">
            <Suspense fallback={<PanelLoadingFallback />}>
              <SecurityDashboard />
            </Suspense>
          </PanelErrorBoundary>
        );

      case 'ai-assets':
        return (
          <PanelErrorBoundary panelName="AI Studio">
            <Suspense fallback={<PanelLoadingFallback />}>
              <AIAssetsPanel 
                projectId={projectId}
                onInsertCode={onInsertCode}
                initialTab={aiStudioInitialTab}
              />
            </Suspense>
          </PanelErrorBoundary>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={config.defaultSize} minSize={config.minSize} maxSize={config.maxSize}>
        {renderPanelContent()}
      </ResizablePanel>
    </>
  );
}