import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { FileExplorer } from './FileExplorer';
import { MonacoEditor } from './MonacoEditor';
import { CollaborativeMonacoEditor } from './CollaborativeMonacoEditor';
import { EditorTabs } from './EditorTabs';
import { SandpackPreview } from './SandpackPreview';
import { ErrorCapture, type CapturedError } from './ErrorCapture';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { PanelRenderer } from './PanelRenderer';
import { CollaboratorAvatars } from './CollaboratorAvatars';
import { TypingIndicator } from './TypingIndicator';
import { RemixProjectDialog } from '@/components/dialogs/RemixProjectDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { ProjectSettingsDialog } from '@/components/dialogs/ProjectSettingsDialog';
import { BuilderLoadingSkeleton, FileExplorerSkeleton, EditorSkeleton, PreviewSkeleton, PanelSkeleton } from './BuilderSkeletons';
import { useBuilderProject } from '@/hooks/useBuilderProject';
import { usePanelManager, PanelType } from '@/hooks/usePanelManager';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { useEditorPresence } from '@/hooks/useEditorPresence';
import { createFileVersion } from '@/hooks/useFileVersions';
import { Button } from '@/components/ui/button';
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
import { Save, Code2, Eye, Sparkles, History, ArrowLeft, Rocket, Github, Palette, Package, BookMarked, Copy, MoreVertical, Globe, Lock, HardDrive, Trash2, Database, Bot, Shield, Settings, Wand2 } from 'lucide-react';
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
  { panel: 'ai-assets', icon: Wand2, label: 'AI Studio' },
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
    setActivePanel,
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
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  
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
    dirtyFiles,
  } = useBuilderProject(projectId);

  // Real-time presence tracking for collaborative editing
  const {
    collaborators,
    isConnected: isPresenceConnected,
    trackFileOpen,
    trackCursor,
    trackSelection,
    trackTyping,
    getTypingCollaborators,
  } = useEditorPresence({ projectId, enabled: true });

  // Get typing collaborators for the indicator
  const typingCollaborators = getTypingCollaborators();

  // Track active file for presence
  useEffect(() => {
    if (activeFile?.path) {
      trackFileOpen(activeFile.path);
    }
  }, [activeFile?.path, trackFileOpen]);

  // Warn user before leaving with unsaved changes
  const hasUnsavedChanges = dirtyFiles.size > 0;
  useUnsavedChangesWarning(hasUnsavedChanges);
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
    return <BuilderLoadingSkeleton />;
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
          <EditorErrorBoundary fallbackTitle="Preview Error" fallbackMessage="Failed to load the preview. Try refreshing.">
            <SandpackPreview files={files} previewCSS={previewCSS} previewSystemName={previewSystemName} previewFontsUrl={previewFontsUrl} />
          </EditorErrorBoundary>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <EditorTabs
              tabs={openTabs}
              activeTabId={activeTabId}
              onTabSelect={setActiveTabId}
              onTabClose={closeTab}
              onSaveFile={saveFile}
            />
            {activeFile ? (
              <EditorErrorBoundary fallbackTitle="Editor Error" fallbackMessage="Failed to load the code editor.">
                <MonacoEditor
                  value={getFileContent(activeFile.id)}
                  language={activeFile.language || 'plaintext'}
                  onChange={(value) => updateLocalContent(activeFile.id, value)}
                  onSave={handleSave}
                  path={activeFile.path}
                />
              </EditorErrorBoundary>
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
              <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Project Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowRemixDialog(true)}>
                <Copy className="h-4 w-4 mr-2" />
                Remix Project
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
              <EditorErrorBoundary fallbackTitle="File Explorer Error" fallbackMessage="Failed to load the file explorer.">
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
              </EditorErrorBoundary>
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
              onSaveFile={saveFile}
            />
            {activeFile ? (
              <EditorErrorBoundary fallbackTitle="Editor Error" fallbackMessage="Failed to load the code editor.">
                <CollaborativeMonacoEditor
                  value={getFileContent(activeFile.id)}
                  language={activeFile.language || 'plaintext'}
                  onChange={(value) => updateLocalContent(activeFile.id, value)}
                  onSave={handleSave}
                  path={activeFile.path}
                  collaborators={collaborators}
                  currentFilePath={activeFile.path}
                  onCursorChange={trackCursor}
                  onSelectionChange={trackSelection}
                  onTyping={trackTyping}
                />
                {/* Typing Indicator */}
                {typingCollaborators.length > 0 && (
                  <div className="absolute bottom-4 left-4 z-10">
                    <TypingIndicator
                      typingUsers={typingCollaborators.map(c => ({
                        id: c.userId,
                        displayName: c.displayName,
                        color: c.color,
                      }))}
                    />
                  </div>
                )}
              </EditorErrorBoundary>
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
                <EditorErrorBoundary fallbackTitle="Preview Error" fallbackMessage="Failed to load the preview. Try refreshing.">
                  <SandpackPreview 
                    files={files} 
                    onSaveVisualChanges={handleSaveVisualChanges}
                    previewCSS={previewCSS}
                    previewSystemName={previewSystemName}
                    previewFontsUrl={previewFontsUrl}
                  />
                </EditorErrorBoundary>
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
          setActivePanel={setActivePanel}
          getPanelConfig={getPanelConfig}
          onFixHandlerReady={handleFixHandlerReady}
          onAgentRunningChange={setIsAgentRunning}
        />
      </ResizablePanelGroup>

      {/* Project Settings Dialog */}
      <ProjectSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        project={project}
        files={files}
        onSave={async (updates) => { await updateProject(updates); }}
        onDelete={() => {
          setShowSettingsDialog(false);
          setShowDeleteDialog(true);
        }}
        isSaving={isUpdatingProject}
      />

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
