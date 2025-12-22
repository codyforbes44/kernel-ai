import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { FileExplorer } from './FileExplorer';
import { MonacoEditor } from './MonacoEditor';
import { EditorTabs } from './EditorTabs';
import { SandpackPreview } from './SandpackPreview';
import { ErrorCapture, type CapturedError } from './ErrorCapture';
import { PanelRenderer } from './PanelRenderer';
import { CollaboratorAvatars } from './CollaboratorAvatars';
import { RemixProjectDialog } from '@/components/dialogs/RemixProjectDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { useBuilderProject } from '@/hooks/useBuilderProject';
import { usePanelManager, PanelType } from '@/hooks/usePanelManager';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Save, Code2, Eye, Sparkles, History, ArrowLeft, Rocket, Github, Palette, Package, BookMarked, Copy, MoreVertical, Globe, Lock, HardDrive, Trash2, Database, Bot, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface BuilderLayoutProps {
  projectId: string;
}

// Panel toolbar button configuration
const PANEL_BUTTONS: Array<{
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
  { panel: 'agent', icon: Bot, label: 'AI Agent (Autonomous)' },
  { panel: 'ai-chat', icon: Sparkles, label: 'AI Assistant' },
];

export function BuilderLayout({ projectId }: BuilderLayoutProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Use panel manager for simplified state
  const {
    activePanel,
    showExplorer,
    showPreview,
    togglePanel,
    togglePreview,
    isPanelActive,
    getPanelConfig,
  } = usePanelManager('ai-chat');

  const [capturedErrors, setCapturedErrors] = useState<CapturedError[]>([]);
  const [isFixingErrors, setIsFixingErrors] = useState(false);
  const [previewCSS, setPreviewCSS] = useState<string | null>(null);
  const [previewSystemName, setPreviewSystemName] = useState<string | null>(null);
  const [previewFontsUrl, setPreviewFontsUrl] = useState<string | null>(null);
  const [showRemixDialog, setShowRemixDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Store the fix handler from BuilderChat
  const fixHandlerRef = useRef<((errors: CapturedError[]) => void) | null>(null);
  
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
    remixProject,
    isRemixing,
    updateProject,
    isUpdatingProject,
    deleteProject,
    isDeletingProject,
  } = useBuilderProject(projectId);

  // Clear design preview when design system panel closes
  useEffect(() => {
    if (activePanel !== 'design-system') {
      setPreviewCSS(null);
      setPreviewSystemName(null);
      setPreviewFontsUrl(null);
    }
  }, [activePanel]);

  const handleTogglePublic = useCallback(async () => {
    if (!project) return;
    const newIsPublic = !project.is_public;
    await updateProject({ is_public: newIsPublic });
    toast.success(newIsPublic ? 'Project is now public' : 'Project is now private');
  }, [project, updateProject]);

  const handleRemix = useCallback(async (newName: string, includeKnowledgeBase: boolean) => {
    if (!project) return;
    
    const result = await remixProject({
      sourceProjectId: project.id,
      newName,
      includeKnowledgeBase,
    });
    
    setShowRemixDialog(false);
    
    if (result?.project) {
      navigate(`/builder/${result.project.id}`);
    }
  }, [project, remixProject, navigate]);

  const handleDeleteProject = useCallback(async () => {
    if (!project) return;
    await deleteProject(project.id);
    setShowDeleteDialog(false);
    navigate('/builder');
  }, [project, deleteProject, navigate]);

  const handleSave = useCallback(() => {
    if (activeTabId) {
      saveFile(activeTabId);
    }
  }, [activeTabId, saveFile]);

  const handleRestoreVersion = useCallback(async (content: string) => {
    if (!activeTabId || !activeFile) return;
    
    const currentContent = getFileContent(activeTabId);
    if (currentContent) {
      await createFileVersion(activeTabId, currentContent, 'Before restore');
    }
    
    updateLocalContent(activeTabId, content);
    await saveFile(activeTabId);
    toast.success('Version restored');
  }, [activeTabId, activeFile, getFileContent, updateLocalContent, saveFile]);

  const handleFixHandlerReady = useCallback((handler: (errors: CapturedError[]) => void) => {
    fixHandlerRef.current = handler;
  }, []);

  const handleTryToFix = useCallback((errors: CapturedError[]) => {
    setIsFixingErrors(true);
    if (fixHandlerRef.current) {
      fixHandlerRef.current(errors);
    }
    setTimeout(() => setIsFixingErrors(false), 1000);
  }, []);

  const handleClearErrors = useCallback(() => {
    setCapturedErrors([]);
  }, []);

  const handleSaveVisualChanges = useCallback(async (changes: Array<{ fileId: string; content: string }>) => {
    for (const { fileId, content } of changes) {
      updateLocalContent(fileId, content);
      await saveFile(fileId);
    }
    toast.success(`Saved ${changes.length} visual change${changes.length > 1 ? 's' : ''} to source code`);
  }, [updateLocalContent, saveFile]);

  const handlePreviewChange = useCallback((css: string | null, systemName?: string, fontsUrl?: string | null) => {
    setPreviewCSS(css);
    setPreviewSystemName(systemName || null);
    setPreviewFontsUrl(fontsUrl || null);
  }, []);

  const handleInstallComponent = useCallback((code: string) => {
    toast.success('Component installed! Code copied to clipboard.');
    navigator.clipboard.writeText(code);
  }, []);

  // Keyboard shortcuts
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
              onClick={togglePreview}
            >
              <Code2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', showPreview && 'bg-primary text-primary-foreground')}
              onClick={togglePreview}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showPreview ? (
          <SandpackPreview files={files} previewCSS={previewCSS} previewSystemName={previewSystemName} previewFontsUrl={previewFontsUrl} />
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
              <BreadcrumbPage className="font-medium flex items-center gap-2">
                {project?.name}
                {project?.is_public && (
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
                  className={cn('h-8 w-8', isPanelActive(panel) && 'bg-primary/10 text-primary')}
                  onClick={() => togglePanel(panel)}
                  disabled={requiresActiveFile && !activeTabId}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleSave}
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
              <DropdownMenuItem onClick={handleTogglePublic} disabled={isUpdatingProject}>
                {project?.is_public ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Make Private
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Make Public
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowRemixDialog(true)}>
                <Copy className="h-4 w-4 mr-2" />
                Remix Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <ResizablePanel defaultSize={showPreview && activePanel ? 35 : showPreview || activePanel ? 50 : 85}>
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
            <ResizablePanel defaultSize={activePanel ? 25 : 40} minSize={20}>
              <div className="h-full flex flex-col">
                <SandpackPreview 
                  files={files} 
                  onSaveVisualChanges={handleSaveVisualChanges}
                  previewCSS={previewCSS}
                  previewSystemName={previewSystemName}
                  previewFontsUrl={previewFontsUrl}
                />
                <ErrorCapture
                  onErrorsChange={setCapturedErrors}
                  onTryToFix={handleTryToFix}
                  isFixing={isFixingErrors}
                />
              </div>
            </ResizablePanel>
          </>
        )}

        {/* Active Panel */}
        <PanelRenderer
          activePanel={activePanel}
          projectId={projectId}
          projectName={project?.name}
          activeTabId={activeTabId}
          activeFileName={activeFile?.name || null}
          files={files}
          capturedErrors={capturedErrors}
          getFileContent={getFileContent}
          onApplyOperations={applyAIOperations}
          onClearErrors={handleClearErrors}
          onRestoreVersion={handleRestoreVersion}
          onPreviewChange={handlePreviewChange}
          onInstallComponent={handleInstallComponent}
          togglePanel={togglePanel}
          getPanelConfig={getPanelConfig}
          onFixHandlerReady={handleFixHandlerReady}
        />
      </ResizablePanelGroup>

      {/* Remix Project Dialog */}
      <RemixProjectDialog
        open={showRemixDialog}
        onOpenChange={setShowRemixDialog}
        sourceProject={project || null}
        fileCount={files.length}
        onRemix={handleRemix}
        isRemixing={isRemixing}
      />

      {/* Delete Project Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete project?"
        description={`Are you sure you want to delete "${project?.name}"? This will permanently delete the project and all its files. This action cannot be undone.`}
        onConfirm={handleDeleteProject}
        isLoading={isDeletingProject}
        impactItems={[
          `${files.length} files will be deleted`,
          'All version history will be lost',
          'Deployments will be removed',
        ]}
      />
    </div>
  );
}
