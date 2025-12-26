import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { FileExplorer } from './FileExplorer';
import { LazyMonacoEditor, CollaborativeMonacoEditorRef } from './LazyMonacoEditor';
import { EditorTabs } from './EditorTabs';
import { SandpackPreview } from './SandpackPreview';
import { ErrorCapture, type CapturedError } from './ErrorCapture';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { PanelRenderer } from './PanelRenderer';
import { PanelToggleBar } from './PanelToggleBar';
import { TypingIndicator } from './TypingIndicator';
import { RemixProjectDialog } from '@/components/dialogs/RemixProjectDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { ProjectSettingsDialog } from '@/components/dialogs/ProjectSettingsDialog';
import { BuilderLoadingSkeleton } from './BuilderSkeletons';
import { BuilderHeader } from './BuilderHeader';
import { BuilderMobileLayout } from './BuilderMobileLayout';
import { useBuilderProject } from '@/hooks/useBuilderProject';
import { usePanelManager } from '@/hooks/usePanelManager';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { useEditorPresence } from '@/hooks/useEditorPresence';
import { createFileVersion } from '@/hooks/useFileVersions';
import { Code2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface BuilderLayoutProps {
  projectId: string;
}

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
  
  // Editor ref for code insertion
  const editorRef = useRef<CollaborativeMonacoEditorRef | null>(null);
  
  const {
    project,
    files,
    fileTree,
    openTabs,
    activeTabId,
    activeFile,
    isLoading,
    isFileContentLoading,
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

  // Handle code insertion from AI Studio
  const handleInsertCode = useCallback((code: string) => {
    if (editorRef.current) {
      editorRef.current.insertCode(code);
      toast.success('Code inserted at cursor position');
    } else {
      navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard');
    }
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
      <BuilderMobileLayout
        projectId={projectId}
        projectName={project?.name}
        showPreview={showPreview}
        togglePreview={togglePreview}
        files={files}
        openTabs={openTabs}
        activeTabId={activeTabId}
        activeFile={activeFile}
        previewCSS={previewCSS}
        previewSystemName={previewSystemName}
        previewFontsUrl={previewFontsUrl}
        setActiveTabId={setActiveTabId}
        closeTab={closeTab}
        saveFile={saveFile}
        getFileContent={getFileContent}
        updateLocalContent={updateLocalContent}
        onSave={handleSave}
        applyAIOperations={applyAIOperations}
        capturedErrors={capturedErrors}
        onClearErrors={handleClearErrors}
        onFixHandlerReady={handleFixHandlerReady}
        openFile={openFile}
      />
    );
  }

  // Desktop layout
  return (
    <div className="h-screen flex flex-col bg-background">
      <BuilderHeader
        projectId={projectId}
        projectName={project?.name}
        isPublic={project?.is_public}
        onSave={handleSave}
        onOpenSettings={() => setShowSettingsDialog(true)}
        onOpenRemix={() => setShowRemixDialog(true)}
      />

      {/* Panel Toggle Bar */}
      <PanelToggleBar
        activePanel={activePanel}
        activeTabId={activeTabId}
        isAgentRunning={isAgentRunning}
        showPreview={showPreview}
        onTogglePanel={togglePanel}
        onTogglePreview={togglePreview}
      />
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
              isFileContentLoading(activeFile.id) ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground bg-[hsl(var(--code-background))]">
                  <div className="text-center">
                    <div className="h-8 w-8 mx-auto mb-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm">Loading file content...</p>
                  </div>
                </div>
              ) : (
                <EditorErrorBoundary fallbackTitle="Editor Error" fallbackMessage="Failed to load the code editor.">
                  <LazyMonacoEditor
                    ref={editorRef}
                    value={getFileContent(activeFile.id) ?? ''}
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
              )
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
                    onClose={togglePreview}
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
          onInsertCode={handleInsertCode}
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
