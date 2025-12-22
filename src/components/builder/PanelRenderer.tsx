import { lazy, Suspense } from 'react';
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import { BuilderChat } from './BuilderChat';
import { FileVersionHistory } from './FileVersionHistory';
import { DeploymentPanel } from './DeploymentPanel';
import { GitHubPanel } from './GitHubPanel';
import { DesignSystemPanel } from './DesignSystemPanel';
import { KnowledgeBasePanel } from './KnowledgeBasePanel';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
  togglePanel: (panel: PanelType) => void;
  getPanelConfig: (panel: PanelType) => { defaultSize: number; minSize: number; maxSize: number };
  onFixHandlerReady: (handler: (errors: CapturedError[]) => void) => void;
}

// Loading fallback for lazy-loaded panels
function PanelLoadingFallback() {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <LoadingSpinner size="md" />
    </div>
  );
}

// Error fallback for panel errors
function PanelErrorFallback({ panelName }: { panelName: string }) {
  return (
    <div className="h-full flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <p className="text-destructive font-medium mb-2">Failed to load {panelName}</p>
        <p className="text-sm text-muted-foreground">Try refreshing the page</p>
      </div>
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
  togglePanel,
  getPanelConfig,
  onFixHandlerReady,
}: PanelRendererProps) {
  if (!activePanel) return null;

  const config = getPanelConfig(activePanel);

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'ai-chat':
        return (
          <ErrorBoundary fallback={<PanelErrorFallback panelName="AI Assistant" />}>
            <BuilderChat
              files={files}
              onApplyOperations={onApplyOperations}
              errors={capturedErrors}
              onClearErrors={onClearErrors}
              projectId={projectId}
              onFixHandlerReady={onFixHandlerReady}
            />
          </ErrorBoundary>
        );

      case 'history':
        return (
          <ErrorBoundary fallback={<PanelErrorFallback panelName="Version History" />}>
            <FileVersionHistory
              fileId={activeTabId}
              fileName={activeFileName}
              currentContent={activeTabId ? getFileContent(activeTabId) : ''}
              onRestore={onRestoreVersion}
              onClose={() => togglePanel('history')}
            />
          </ErrorBoundary>
        );

      case 'deployments':
        return (
          <ErrorBoundary fallback={<PanelErrorFallback panelName="Deployments" />}>
            <DeploymentPanel
              projectId={projectId}
              onClose={() => togglePanel('deployments')}
            />
          </ErrorBoundary>
        );

      case 'github':
        return (
          <ErrorBoundary fallback={<PanelErrorFallback panelName="GitHub" />}>
            <GitHubPanel
              projectId={projectId}
              projectName={projectName}
            />
          </ErrorBoundary>
        );

      case 'design-system':
        return (
          <ErrorBoundary fallback={<PanelErrorFallback panelName="Design System" />}>
            <DesignSystemPanel projectId={projectId} onPreviewChange={onPreviewChange} />
          </ErrorBoundary>
        );

      case 'marketplace':
        return (
          <ErrorBoundary fallback={<PanelErrorFallback panelName="Component Marketplace" />}>
            <Suspense fallback={<PanelLoadingFallback />}>
              <ComponentMarketplace 
                projectId={projectId}
                onInstallComponent={onInstallComponent}
              />
            </Suspense>
          </ErrorBoundary>
        );

      case 'knowledge-base':
        return (
          <ErrorBoundary fallback={<PanelErrorFallback panelName="Knowledge Base" />}>
            <KnowledgeBasePanel projectId={projectId} />
          </ErrorBoundary>
        );

      case 'storage':
        return (
          <ErrorBoundary fallback={<PanelErrorFallback panelName="File Storage" />}>
            <Suspense fallback={<PanelLoadingFallback />}>
              <StorageBrowser />
            </Suspense>
          </ErrorBoundary>
        );

      case 'database':
        return (
          <ErrorBoundary fallback={<PanelErrorFallback panelName="Database" />}>
            <Suspense fallback={<PanelLoadingFallback />}>
              <DatabasePanel />
            </Suspense>
          </ErrorBoundary>
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
