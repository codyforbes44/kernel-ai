import { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Code2, 
  Eye, 
  FolderOpen, 
  Bot, 
  Save,
  LayoutGrid,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KernelLogo } from '@/components/ui/kernel-logo';
import { EditorTabs } from './EditorTabs';
import { MonacoEditor } from './MonacoEditor';
import { SandpackPreview } from './SandpackPreview';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { MobileFileBrowser } from './MobileFileBrowser';
import { MobilePanelDrawer } from './MobilePanelDrawer';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useAICredits } from '@/hooks/useAICredits';
import { useSwipeToggle } from '@/hooks/useMobileGestures';
import { hapticFeedback } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';
import { buildFileTree } from '@/lib/fileTree';
import type { ProjectFile, OpenTab } from '@/types/builder';
import type { PanelId } from '@/registry/panelRegistry';

interface BuilderMobileLayoutProps {
  projectId?: string;
  projectName?: string;
  showPreview: boolean;
  togglePreview: () => void;
  files: ProjectFile[];
  openTabs: OpenTab[];
  activeTabId: string | null;
  activeFile: ProjectFile | undefined;
  previewCSS: string | null;
  previewSystemName: string | null;
  previewFontsUrl: string | null;
  setActiveTabId: (id: string | null) => void;
  closeTab: (tabId: string) => void;
  saveFile: (fileId: string) => Promise<void>;
  getFileContent: (fileId: string) => string;
  updateLocalContent: (fileId: string, content: string) => void;
  onSave: () => void;
  onFileSelect?: (file: ProjectFile) => void;
}

export const BuilderMobileLayout = memo(function BuilderMobileLayout({
  projectId,
  projectName,
  showPreview,
  togglePreview,
  files,
  openTabs,
  activeTabId,
  activeFile,
  previewCSS,
  previewSystemName,
  previewFontsUrl,
  setActiveTabId,
  closeTab,
  saveFile,
  getFileContent,
  updateLocalContent,
  onSave,
  onFileSelect,
}: BuilderMobileLayoutProps) {
  const { credits } = useAICredits();
  const isLowCredits = (credits?.balance ?? 0) < 10;
  
  // Mobile-specific state
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [showPanelDrawer, setShowPanelDrawer] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  
  // Build file tree for browser
  const fileTree = buildFileTree(files);
  
  // Swipe gesture for code/preview toggle
  const { containerRef } = useSwipeToggle(showPreview, togglePreview, { direction: 'horizontal' });
  
  // FAB actions
  const handleOpenFileBrowser = useCallback(() => {
    hapticFeedback('medium');
    setShowFileBrowser(true);
  }, []);
  
  const handleOpenPanels = useCallback(() => {
    hapticFeedback('medium');
    setShowPanelDrawer(true);
  }, []);
  
  const handleSave = useCallback(() => {
    hapticFeedback('medium');
    onSave();
  }, [onSave]);
  
  const handleSelectPanel = useCallback((panel: PanelId) => {
    setActivePanel(panel);
    setShowPanel(true);
  }, []);
  
  const handleFileSelect = useCallback((file: ProjectFile) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
    // Switch to code view when file is selected
    if (showPreview) {
      togglePreview();
    }
  }, [onFileSelect, showPreview, togglePreview]);
  
  const fabActions = [
    { 
      icon: <FolderOpen className="h-5 w-5" />, 
      label: 'Files', 
      onClick: handleOpenFileBrowser 
    },
    { 
      icon: <Bot className="h-5 w-5" />, 
      label: 'AI Chat', 
      onClick: () => handleSelectPanel('ai-chat')
    },
    { 
      icon: <LayoutGrid className="h-5 w-5" />, 
      label: 'Panels', 
      onClick: handleOpenPanels 
    },
    { 
      icon: <Save className="h-5 w-5" />, 
      label: 'Save', 
      onClick: handleSave 
    },
  ];
  
  return (
    <div className="h-screen flex flex-col bg-background" ref={containerRef}>
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/builder" className="flex items-center p-1 -ml-1 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link to="/" className="flex items-center touch-manipulation">
            <KernelLogo size="sm" />
          </Link>
        </div>
        
        <span className="text-sm font-medium truncate flex-1 text-center mx-2 max-w-[140px]">
          {projectName}
        </span>
        
        <div className="flex items-center gap-1">
          {/* Credits Badge */}
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mr-1",
            isLowCredits 
              ? "bg-destructive/15 text-destructive" 
              : "bg-primary/15 text-primary"
          )}>
            <Coins className="h-3 w-3" />
            <span>{credits?.balance ?? 0}</span>
          </div>
          
          {/* Code/Preview Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 touch-manipulation',
              !showPreview && 'bg-primary/15 text-primary'
            )}
            onClick={() => { hapticFeedback('light'); if (showPreview) togglePreview(); }}
          >
            <Code2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 touch-manipulation',
              showPreview && 'bg-primary/15 text-primary'
            )}
            onClick={() => { hapticFeedback('light'); if (!showPreview) togglePreview(); }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {showPreview ? (
          <EditorErrorBoundary 
            fallbackTitle="Preview Error" 
            fallbackMessage="Failed to load the preview. Try refreshing."
          >
            <SandpackPreview 
              files={files} 
              previewCSS={previewCSS} 
              previewSystemName={previewSystemName} 
              previewFontsUrl={previewFontsUrl} 
            />
          </EditorErrorBoundary>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            <EditorTabs
              tabs={openTabs}
              activeTabId={activeTabId}
              onTabSelect={setActiveTabId}
              onTabClose={closeTab}
              onSaveFile={saveFile}
              isMobile
            />
            {activeFile ? (
              <EditorErrorBoundary 
                fallbackTitle="Editor Error" 
                fallbackMessage="Failed to load the code editor."
              >
                <MonacoEditor
                  value={getFileContent(activeFile.id)}
                  language={activeFile.language || 'plaintext'}
                  onChange={(value) => updateLocalContent(activeFile.id, value)}
                  onSave={onSave}
                  path={activeFile.path}
                />
              </EditorErrorBoundary>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 p-4">
                <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-center">
                  Select a file to edit
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFileBrowser}
                  className="touch-manipulation"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {}}
        expandable
        actions={fabActions}
        className="bottom-6"
      />

      {/* Mobile File Browser Sheet */}
      <MobileFileBrowser
        open={showFileBrowser}
        onOpenChange={setShowFileBrowser}
        files={files}
        fileTree={fileTree}
        activeFileId={activeFile?.id || null}
        onFileSelect={handleFileSelect}
        projectName={projectName}
      />

      {/* Mobile Panel Drawer */}
      <MobilePanelDrawer
        open={showPanelDrawer}
        onOpenChange={setShowPanelDrawer}
        activePanel={activePanel}
        onSelectPanel={handleSelectPanel}
      />

      {/* Panel Content Sheet - AI Chat */}
      {showPanel && activePanel === 'ai-chat' && projectId && (
        <div 
          className="fixed inset-0 z-50 bg-background animate-slide-in-right"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <header className="h-12 flex items-center justify-between px-3 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { hapticFeedback('light'); setShowPanel(false); }}
              className="touch-manipulation"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">AI Assistant</span>
            <div className="w-9" />
          </header>
          {/* Note: Full BuilderChat requires onApplyOperations - showing a placeholder for mobile */}
          <div className="h-[calc(100%-48px)] flex flex-col items-center justify-center p-6 text-center">
            <Bot className="h-16 w-16 text-primary/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
            <p className="text-sm text-muted-foreground mb-4">
              For the best AI chat experience, use desktop view where you can apply file changes directly.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowPanel(false)}
              className="touch-manipulation"
            >
              Go Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
