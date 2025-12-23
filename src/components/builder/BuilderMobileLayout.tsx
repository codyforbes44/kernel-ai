import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorTabs } from './EditorTabs';
import { MonacoEditor } from './MonacoEditor';
import { SandpackPreview } from './SandpackPreview';
import { EditorErrorBoundary } from './EditorErrorBoundary';
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
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="h-12 flex items-center justify-between px-3 border-b border-border bg-card">
        <Link to="/builder" className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-sm font-medium truncate">{projectName}</span>
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
          <SandpackPreview 
            files={files} 
            previewCSS={previewCSS} 
            previewSystemName={previewSystemName} 
            previewFontsUrl={previewFontsUrl} 
          />
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
  );
});
