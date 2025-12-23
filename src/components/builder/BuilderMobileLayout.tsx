import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code2, Eye, Home, Settings, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KernelLogo } from '@/components/ui/kernel-logo';
import { EditorTabs } from './EditorTabs';
import { MonacoEditor } from './MonacoEditor';
import { SandpackPreview } from './SandpackPreview';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { useAICredits } from '@/hooks/useAICredits';
import { cn } from '@/lib/utils';
import type { ProjectFile, OpenTab } from '@/types/builder';

interface BuilderMobileLayoutProps {
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
}

export const BuilderMobileLayout = memo(function BuilderMobileLayout({
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
}: BuilderMobileLayoutProps) {
  const { credits } = useAICredits();
  const isLowCredits = (credits?.balance ?? 0) < 10;
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Link to="/builder" className="flex items-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link to="/" className="flex items-center">
            <KernelLogo size="sm" />
          </Link>
        </div>
        <span className="text-sm font-medium truncate flex-1 text-center mx-2">{projectName}</span>
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

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <EditorErrorBoundary fallbackTitle="Preview Error" fallbackMessage="Failed to load the preview. Try refreshing.">
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
            />
            {activeFile ? (
              <EditorErrorBoundary fallbackTitle="Editor Error" fallbackMessage="Failed to load the code editor.">
                <MonacoEditor
                  value={getFileContent(activeFile.id)}
                  language={activeFile.language || 'plaintext'}
                  onChange={(value) => updateLocalContent(activeFile.id, value)}
                  onSave={onSave}
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

      {/* Bottom Navigation Bar */}
      <nav 
        className="shrink-0 border-t border-border/50 bg-sidebar flex items-center justify-around px-2 z-50"
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
          minHeight: '56px'
        }}
      >
        <Link
          to="/"
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[60px] text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
        >
          <div className="flex items-center justify-center w-10 h-7 rounded-full">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          to="/builder"
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[60px] text-primary active:scale-95 touch-manipulation"
        >
          <div className="flex items-center justify-center w-10 h-7 rounded-full bg-primary/15">
            <Code2 className="h-5 w-5 scale-110" />
          </div>
          <span className="text-[10px] font-semibold">Builder</span>
        </Link>

        <Link
          to="/settings"
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[60px] text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
        >
          <div className="flex items-center justify-center w-10 h-7 rounded-full">
            <Settings className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium">Settings</span>
        </Link>

        {/* Credits Badge */}
        <div className="flex flex-col items-center justify-center gap-1 py-2 px-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            isLowCredits 
              ? "bg-destructive/15 text-destructive" 
              : "bg-primary/15 text-primary"
          )}>
            <Coins className="h-3.5 w-3.5" />
            <span>{credits?.balance ?? 0}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Credits</span>
        </div>
      </nav>
    </div>
  );
});
