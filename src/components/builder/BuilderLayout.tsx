import { useState, useCallback, useEffect } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { FileExplorer } from './FileExplorer';
import { MonacoEditor } from './MonacoEditor';
import { EditorTabs } from './EditorTabs';
import { SandpackPreview } from './SandpackPreview';
import { BuilderChat } from './BuilderChat';
import { FileVersionHistory } from './FileVersionHistory';
import { ErrorCapture, type CapturedError } from './ErrorCapture';
import { DeploymentPanel } from './DeploymentPanel';
import { GitHubPanel } from './GitHubPanel';
import { DesignSystemPanel } from './DesignSystemPanel';
import { ComponentMarketplace } from './ComponentMarketplace';
import { useBuilderProject } from '@/hooks/useBuilderProject';
import { createFileVersion } from '@/hooks/useFileVersions';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Save, Code2, Eye, Sparkles, History, ArrowLeft, Rocket, Github, Palette, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface BuilderLayoutProps {
  projectId: string;
}

export function BuilderLayout({ projectId }: BuilderLayoutProps) {
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = useState(true);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showAIChat, setShowAIChat] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeployments, setShowDeployments] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);
  const [showDesignSystem, setShowDesignSystem] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [capturedErrors, setCapturedErrors] = useState<CapturedError[]>([]);
  const [isFixingErrors, setIsFixingErrors] = useState(false);
  
  const {
    project,
    files,
    fileTree,
    openTabs,
    activeTabId,
    activeFile,
    isLoading,
    openFile,
    closeTab,
    setActiveTabId,
    createFile,
    deleteFile,
    renameFile,
    getFileContent,
    updateLocalContent,
    saveFile,
    applyAIOperations,
  } = useBuilderProject(projectId);

  const handleSave = useCallback(() => {
    if (activeTabId) {
      saveFile(activeTabId);
    }
  }, [activeTabId, saveFile]);

  // Restore a version
  const handleRestoreVersion = useCallback(async (content: string) => {
    if (!activeTabId || !activeFile) return;
    
    // Save current content as a version before restoring
    const currentContent = getFileContent(activeTabId);
    if (currentContent) {
      await createFileVersion(activeTabId, currentContent, 'Before restore');
    }
    
    // Update local content with restored version
    updateLocalContent(activeTabId, content);
    // Auto-save the restored content
    await saveFile(activeTabId);
    toast.success('Version restored');
  }, [activeTabId, activeFile, getFileContent, updateLocalContent, saveFile]);

  // Handle "Try to Fix" from error capture
  const handleTryToFix = useCallback((errors: CapturedError[]) => {
    setIsFixingErrors(true);
    // Trigger AI chat fix via window function
    const fixHandler = (window as unknown as { __builderChatFixErrors?: (errors: CapturedError[]) => void }).__builderChatFixErrors;
    if (fixHandler) {
      fixHandler(errors);
    }
    setTimeout(() => setIsFixingErrors(false), 1000);
  }, []);

  const handleClearErrors = useCallback(() => {
    setCapturedErrors([]);
  }, []);

  // Keyboard shortcuts - Ctrl/Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Mobile Header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-border bg-card">
          <Link to="/builder" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-sm font-medium truncate">{project?.name}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', !showPreview && 'bg-primary text-primary-foreground')}
              onClick={() => setShowPreview(false)}
            >
              <Code2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', showPreview && 'bg-primary text-primary-foreground')}
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {showPreview ? (
          <SandpackPreview files={files} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <EditorTabs
              tabs={openTabs}
              activeTabId={activeTabId}
              onTabSelect={setActiveTabId}
              onTabClose={closeTab}
            />
            {activeFile ? (
              <MonacoEditor
                value={getFileContent(activeFile.id)}
                language={activeFile.language || 'plaintext'}
                onChange={(value) => updateLocalContent(activeFile.id, value)}
                onSave={handleSave}
                path={activeFile.path}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
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
              <BreadcrumbPage className="font-medium">{project?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', showDesignSystem && 'bg-primary/10 text-primary')}
                onClick={() => {
                  setShowDesignSystem(!showDesignSystem);
                  if (!showDesignSystem) {
                    setShowAIChat(false);
                    setShowHistory(false);
                    setShowDeployments(false);
                    setShowGitHub(false);
                    setShowMarketplace(false);
                  }
                }}
              >
                <Palette className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Design System</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', showMarketplace && 'bg-primary/10 text-primary')}
                onClick={() => {
                  setShowMarketplace(!showMarketplace);
                  if (!showMarketplace) {
                    setShowAIChat(false);
                    setShowHistory(false);
                    setShowDeployments(false);
                    setShowGitHub(false);
                    setShowDesignSystem(false);
                  }
                }}
              >
                <Package className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Component Marketplace</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', showGitHub && 'bg-primary/10 text-primary')}
                onClick={() => {
                  setShowGitHub(!showGitHub);
                  if (!showGitHub) {
                    setShowAIChat(false);
                    setShowHistory(false);
                    setShowDeployments(false);
                    setShowDesignSystem(false);
                    setShowMarketplace(false);
                  }
                }}
              >
                <Github className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>GitHub</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', showDeployments && 'bg-primary/10 text-primary')}
                onClick={() => {
                  setShowDeployments(!showDeployments);
                  if (!showDeployments) {
                    setShowAIChat(false);
                    setShowHistory(false);
                    setShowGitHub(false);
                    setShowDesignSystem(false);
                    setShowMarketplace(false);
                  }
                }}
              >
                <Rocket className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deployments</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', showHistory && 'bg-primary/10 text-primary')}
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory) {
                    setShowAIChat(false);
                    setShowDeployments(false);
                    setShowGitHub(false);
                    setShowDesignSystem(false);
                    setShowMarketplace(false);
                  }
                }}
                disabled={!activeTabId}
              >
                <History className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Version History</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', showAIChat && 'bg-primary/10 text-primary')}
                onClick={() => {
                  setShowAIChat(!showAIChat);
                  if (!showAIChat) {
                    setShowHistory(false);
                    setShowDeployments(false);
                    setShowGitHub(false);
                    setShowDesignSystem(false);
                    setShowMarketplace(false);
                  }
                }}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI Assistant</TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* File Explorer */}
        {showExplorer && (
          <>
            <ResizablePanel defaultSize={15} minSize={12} maxSize={25}>
              <FileExplorer
                files={files}
                fileTree={fileTree}
                activeFileId={activeTabId}
                onFileSelect={openFile}
                onCreateFile={(path, name, type) => createFile({ path, name, type })}
                onDeleteFile={(id) => deleteFile(id)}
                onRenameFile={(id, newName, newPath) => renameFile({ fileId: id, newName, newPath })}
                projectName={project?.name}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {/* Editor */}
        <ResizablePanel defaultSize={showPreview && showAIChat ? 35 : showPreview || showAIChat ? 50 : 85}>
          <div className="h-full flex flex-col">
            <EditorTabs
              tabs={openTabs}
              activeTabId={activeTabId}
              onTabSelect={setActiveTabId}
              onTabClose={closeTab}
            />
            {activeFile ? (
              <MonacoEditor
                value={getFileContent(activeFile.id)}
                language={activeFile.language || 'plaintext'}
                onChange={(value) => updateLocalContent(activeFile.id, value)}
                onSave={handleSave}
                path={activeFile.path}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground bg-[hsl(var(--code-background))]">
                <div className="text-center">
                  <Code2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Select a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>

        {/* Preview */}
        {showPreview && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={(showAIChat || showHistory) ? 25 : 40} minSize={20}>
              <div className="h-full flex flex-col">
                <SandpackPreview files={files} />
                <ErrorCapture
                  onErrorsChange={setCapturedErrors}
                  onTryToFix={handleTryToFix}
                  isFixing={isFixingErrors}
                />
              </div>
            </ResizablePanel>
          </>
        )}

        {/* AI Chat */}
        {showAIChat && !showHistory && !showDeployments && !showGitHub && !showDesignSystem && !showMarketplace && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <BuilderChat
                files={files}
                onApplyOperations={applyAIOperations}
                errors={capturedErrors}
                onClearErrors={handleClearErrors}
                projectId={projectId}
              />
            </ResizablePanel>
          </>
        )}

        {/* Design System Panel */}
        {showDesignSystem && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <DesignSystemPanel projectId={projectId} />
            </ResizablePanel>
          </>
        )}

        {/* Component Marketplace Panel */}
        {showMarketplace && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
              <ComponentMarketplace 
                projectId={projectId}
                onInstallComponent={(code) => {
                  toast.success('Component installed! Code copied to clipboard.');
                  navigator.clipboard.writeText(code);
                }}
              />
            </ResizablePanel>
          </>
        )}

        {/* Deployments Panel */}
        {showDeployments && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <DeploymentPanel
                projectId={projectId}
                onClose={() => setShowDeployments(false)}
              />
            </ResizablePanel>
          </>
        )}

        {/* GitHub Panel */}
        {showGitHub && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <GitHubPanel
                projectId={projectId}
                projectName={project?.name}
              />
            </ResizablePanel>
          </>
        )}

        {/* Version History */}
        {showHistory && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <FileVersionHistory
                fileId={activeTabId}
                fileName={activeFile?.name || null}
                currentContent={activeTabId ? getFileContent(activeTabId) : ''}
                onRestore={handleRestoreVersion}
                onClose={() => setShowHistory(false)}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
