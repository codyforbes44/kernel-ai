import { useState, useCallback } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { FileExplorer } from './FileExplorer';
import { MonacoEditor } from './MonacoEditor';
import { EditorTabs } from './EditorTabs';
import { PreviewPanel } from './PreviewPanel';
import { useBuilderProject } from '@/hooks/useBuilderProject';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Save, Settings, Code2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface BuilderLayoutProps {
  projectId: string;
}

export function BuilderLayout({ projectId }: BuilderLayoutProps) {
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = useState(true);
  const [showExplorer, setShowExplorer] = useState(true);
  
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
  } = useBuilderProject(projectId);

  const handleSave = useCallback(() => {
    if (activeTabId) {
      saveFile(activeTabId);
    }
  }, [activeTabId, saveFile]);

  // Keyboard shortcuts
  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if ((e.metaKey || e.ctrlKey) && e.key === 's') {
  //       e.preventDefault();
  //       handleSave();
  //     }
  //   };
  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, [handleSave]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          <PreviewPanel files={files} />
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
        <div className="flex items-center gap-4">
          <Link to="/builder" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Projects</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium">{project?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="default" size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            Run
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
        <ResizablePanel defaultSize={showPreview ? 45 : 85}>
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
            <ResizablePanel defaultSize={40} minSize={25}>
              <PreviewPanel files={files} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
