import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useShortcut } from '@/hooks/useKeyboardShortcuts';
import {
  SandpackProvider,
  SandpackPreview as SandpackPreviewPane,
  SandpackLayout,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProjectFile } from '@/types/builder';
import type { SelectedElement, VisualChange } from '@/types/visual-editor';
import { 
  useVisualEditor, 
  PropertyEditorPanel, 
  getVisualEditorInjectionScript,
  FloatingToolbar,
  InlineTextEditor,
  ChangeHistoryPanel,
} from './visual-editor';
import { DeviceFrame, PreviewToolbar, PreviewLoadingOverlay, viewportConfig } from './preview';
import { injectSourceMapping } from '@/lib/jsxSourceMapper';
import { toast } from 'sonner';

interface SandpackPreviewProps {
  files: ProjectFile[];
  onError?: (error: string) => void;
  onVisualChange?: (change: VisualChange) => void;
  onSaveVisualChanges?: (changes: Array<{ fileId: string; content: string }>) => Promise<void>;
  previewCSS?: string | null;
  previewSystemName?: string | null;
  previewFontsUrl?: string | null;
  onVisualEditorToggle?: (enabled: boolean) => void;
  onNavigateToSource?: (filePath: string, lineNumber: number) => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

// Memoized file conversion cache to avoid reprocessing unchanged files
const fileContentCache = new Map<string, { hash: string; processed: string }>();

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Convert project files to Sandpack format with visual editor injection
function convertToSandpackFiles(
  files: ProjectFile[], 
  injectVisualEditor: boolean,
  previewCSS?: string | null,
  previewFontsUrl?: string | null
): Record<string, string> {
  const sandpackFiles: Record<string, string> = {};
  
  for (const file of files) {
    if (file.content && file.type === 'file') {
      const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
      const contentHash = hashContent(file.content);
      const cacheKey = `${path}:${injectVisualEditor}:${contentHash}`;
      
      const cached = fileContentCache.get(cacheKey);
      if (cached && cached.hash === contentHash) {
        sandpackFiles[path] = cached.processed;
        continue;
      }
      
      let content = file.content;
      if (injectVisualEditor && path.match(/\.(jsx|tsx)$/)) {
        content = injectSourceMapping(content, path);
      }
      
      fileContentCache.set(cacheKey, { hash: contentHash, processed: content });
      sandpackFiles[path] = content;
    }
  }
  
  if (fileContentCache.size > 200) {
    const keysToDelete = Array.from(fileContentCache.keys()).slice(0, 50);
    keysToDelete.forEach(key => fileContentCache.delete(key));
  }
  
  if (!sandpackFiles['/index.html']) {
    sandpackFiles['/index.html'] = `<!DOCTYPE html>
<html lang="en" style="height: 100%">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
  </head>
  <body style="height: 100%; margin: 0;">
    <div id="root" style="height: 100%"></div>
  </body>
</html>`;
  }
  
  if (injectVisualEditor && sandpackFiles['/index.html']) {
    const injectionScript = getVisualEditorInjectionScript();
    sandpackFiles['/index.html'] = sandpackFiles['/index.html'].replace(
      '</body>',
      `<script>${injectionScript}</script></body>`
    );
  }
  
  if (sandpackFiles['/index.html']) {
    let headInjection = '';
    
    if (previewFontsUrl) {
      headInjection += `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${previewFontsUrl}">`;
    }
    
    if (previewCSS) {
      headInjection += `<style id="design-system-preview">${previewCSS}</style>`;
    }
    
    if (headInjection) {
      sandpackFiles['/index.html'] = sandpackFiles['/index.html'].replace(
        '</head>',
        `${headInjection}</head>`
      );
    }
  }
  
  if (!sandpackFiles['/src/main.tsx'] && !sandpackFiles['/src/index.tsx']) {
    sandpackFiles['/src/main.tsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }
  
  if (!sandpackFiles['/src/App.tsx'] && !sandpackFiles['/src/App.jsx']) {
    sandpackFiles['/src/App.tsx'] = `export default function App() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-center p-5">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Builder</h1>
      <p className="text-lg opacity-90">Edit App.tsx to start building your app</p>
      <button className="mt-6 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-opacity-90 transition">
        Get Started
      </button>
    </div>
  );
}`;
  }
  
  if (!sandpackFiles['/src/App.css']) {
    sandpackFiles['/src/App.css'] = `html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}
* {
  box-sizing: border-box;
}`;
  }
  
  return sandpackFiles;
}

// Inner component that has access to Sandpack context
function SandpackPreviewInner({
  files,
  onVisualChange,
  onSaveVisualChanges,
  onVisualEditorToggle,
  onNavigateToSource,
  isVisualEditorEnabled,
  onToggleVisualEditor,
}: {
  files: ProjectFile[];
  onVisualChange?: (change: VisualChange) => void;
  onSaveVisualChanges?: (changes: Array<{ fileId: string; content: string }>) => Promise<void>;
  onVisualEditorToggle?: (enabled: boolean) => void;
  onNavigateToSource?: (filePath: string, lineNumber: number) => void;
  isVisualEditorEnabled: boolean;
  onToggleVisualEditor: () => void;
}) {
  const { sandpack } = useSandpack();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showInlineEditor, setShowInlineEditor] = useState(false);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    isEnabled,
    isSaving,
    selectedElement,
    canUndo,
    canRedo,
    disable,
    toggle,
    updateStyle,
    updateText,
    updateClasses,
    deselect,
    pendingChanges,
    saveChanges,
    clearChanges,
    navigateToSource,
    undo,
    redo,
    historyEntries,
    currentHistoryIndex,
    jumpToHistoryPoint,
    undoPreview,
    redoPreview,
  } = useVisualEditor({
    iframeRef,
    files,
    onNavigateToSource,
    onElementSelected: () => {
      setShowFloatingToolbar(true);
    },
    onElementDeselected: () => {
      setShowFloatingToolbar(false);
      setShowInlineEditor(false);
    },
    onDoubleClick: (element) => {
      if (element.textContent) {
        setShowInlineEditor(true);
      }
    },
    onChangeApplied: (change) => {
      onVisualChange?.(change);
    },
    onSaveChanges: onSaveVisualChanges,
  });

  // Sync external toggle with internal state
  useEffect(() => {
    if (isVisualEditorEnabled !== isEnabled) {
      toggle();
    }
  }, [isVisualEditorEnabled]);

  useEffect(() => {
    onVisualEditorToggle?.(isEnabled);
  }, [isEnabled, onVisualEditorToggle]);

  useEffect(() => {
    const checkIframe = () => {
      const iframe = document.querySelector('.sp-preview-iframe') as HTMLIFrameElement;
      if (iframe && iframeRef.current !== iframe) {
        (iframeRef as React.MutableRefObject<HTMLIFrameElement>).current = iframe;
      }
    };
    
    checkIframe();
    const interval = setInterval(checkIframe, 500);
    return () => clearInterval(interval);
  }, []);

  const handleCloseEditor = useCallback(() => {
    disable();
    onToggleVisualEditor();
  }, [disable, onToggleVisualEditor]);

  const handleInlineTextSave = useCallback((text: string) => {
    updateText(text);
    setShowInlineEditor(false);
  }, [updateText]);

  const handleInlineTextCancel = useCallback(() => {
    setShowInlineEditor(false);
  }, []);

  const handleDuplicate = useCallback(() => {
    if (selectedElement) {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'VISUAL_EDITOR_DUPLICATE' }, '*');
      }
      toast.success('Element duplicated');
    }
  }, [selectedElement]);

  const handleDelete = useCallback(() => {
    if (selectedElement) {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'VISUAL_EDITOR_DELETE' }, '*');
      }
      toast.success('Element deleted');
    }
  }, [selectedElement]);

  const getToolbarPosition = useCallback(() => {
    if (!selectedElement || !containerRef.current) return { top: 0, left: 0 };
    
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      top: selectedElement.rect.top - containerRect.top,
      left: selectedElement.rect.left - containerRect.left + (selectedElement.rect.width / 2),
    };
  }, [selectedElement]);

  return (
    <div ref={containerRef} className="relative h-full">
      {/* Floating Toolbar */}
      {isEnabled && showFloatingToolbar && selectedElement && !showInlineEditor && (
        <FloatingToolbar
          element={selectedElement}
          position={getToolbarPosition()}
          onEditText={() => setShowInlineEditor(true)}
          onEditColor={() => {}}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          undoPreview={undoPreview}
          redoPreview={redoPreview}
        />
      )}

      {/* Inline Text Editor */}
      {isEnabled && showInlineEditor && selectedElement && selectedElement.textContent && (
        <InlineTextEditor
          initialText={selectedElement.textContent}
          position={{
            top: selectedElement.rect.top,
            left: selectedElement.rect.left,
            width: selectedElement.rect.width,
            height: selectedElement.rect.height,
          }}
          fontSize={selectedElement.styles.fontSize}
          fontWeight={selectedElement.styles.fontWeight}
          color={selectedElement.styles.color}
          onSave={handleInlineTextSave}
          onCancel={handleInlineTextCancel}
        />
      )}

      {/* Property Editor Panel - Slide in from right */}
      {isEnabled && (
        <div className="absolute right-0 top-0 bottom-0 w-72 z-10 animate-slide-in-right">
          <PropertyEditorPanel
            selectedElement={selectedElement}
            onUpdateStyle={updateStyle}
            onUpdateText={updateText}
            onUpdateClasses={updateClasses}
            onDeselect={deselect}
            onClose={handleCloseEditor}
            onNavigateToSource={navigateToSource}
          />
        </div>
      )}

      {/* Change History Panel */}
      {isEnabled && showHistoryPanel && (
        <div className="absolute left-4 top-4 z-20 animate-fade-in">
          <ChangeHistoryPanel
            history={historyEntries}
            currentIndex={currentHistoryIndex}
            onJumpTo={jumpToHistoryPoint}
            onClose={() => setShowHistoryPanel(false)}
            className="w-72"
          />
        </div>
      )}

      {/* Changes indicator with save button */}
      {pendingChanges.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 animate-fade-in">
          <div className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg font-medium">
            {pendingChanges.length} unsaved change{pendingChanges.length > 1 ? 's' : ''}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 shadow-lg bg-background hover:bg-muted"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            title="View change history"
          >
            <History className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs shadow-lg"
            onClick={saveChanges}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save to Code'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs shadow-lg bg-background"
            onClick={clearChanges}
            disabled={isSaving}
          >
            Discard
          </Button>
        </div>
      )}
    </div>
  );
}

// Hook to track Sandpack bundling status
function useSandpackStatus() {
  const { sandpack } = useSandpack();
  const [isBundling, setIsBundling] = useState(true);
  
  useEffect(() => {
    // Check initial status
    setIsBundling(sandpack.status !== 'running');
    
    // Listen for status changes
    const handleStatus = () => {
      setIsBundling(sandpack.status !== 'running');
    };
    
    // Poll for status changes (Sandpack doesn't have great event support)
    const interval = setInterval(handleStatus, 100);
    return () => clearInterval(interval);
  }, [sandpack.status]);
  
  return { isBundling, status: sandpack.status };
}

// Status indicator component
function SandpackStatusIndicator() {
  const { isBundling } = useSandpackStatus();
  
  return (
    <PreviewLoadingOverlay 
      isLoading={isBundling}
      message="Building preview..."
    />
  );
}

export function SandpackPreview({ 
  files, 
  onError, 
  onVisualChange, 
  onSaveVisualChanges,
  previewCSS,
  previewSystemName,
  previewFontsUrl,
  onVisualEditorToggle,
  onNavigateToSource,
}: SandpackPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isVisualEditorActive, setIsVisualEditorActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Viewport switching keyboard shortcuts
  useShortcut('1', () => setViewport('desktop'), { description: 'Desktop view' });
  useShortcut('2', () => setViewport('tablet'), { description: 'Tablet view' });
  useShortcut('3', () => setViewport('mobile'), { description: 'Mobile view' });

  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const sandpackFiles = useMemo(
    () => convertToSandpackFiles(files, true, previewCSS, previewFontsUrl),
    [files, previewCSS, previewFontsUrl]
  );

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const handleOpenExternal = () => {
    const previewFrame = document.querySelector('.sp-preview-iframe') as HTMLIFrameElement;
    if (previewFrame?.src) {
      window.open(previewFrame.src, '_blank');
    }
  };

  const handleToggleVisualEditor = () => {
    setIsVisualEditorActive(prev => !prev);
  };

  return (
    <div className={cn(
      "h-full flex flex-col bg-muted/30 relative transition-all duration-300",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Design System Preview Indicator */}
      {previewSystemName && !isFullscreen && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
          </span>
          Previewing: {previewSystemName}
        </div>
      )}

      {/* Toolbar - hidden in fullscreen except for floating controls */}
      <PreviewToolbar
        viewport={viewport}
        onViewportChange={setViewport}
        onRefresh={handleRefresh}
        onOpenExternal={handleOpenExternal}
        isVisualEditorActive={isVisualEditorActive}
        onToggleVisualEditor={handleToggleVisualEditor}
        currentPath="/"
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Preview Area - maximized to fill palette */}
      <div className={cn(
        "flex-1 flex items-stretch justify-center overflow-hidden min-h-0",
        isFullscreen ? 'p-0' : (viewport === 'desktop' ? 'p-0' : 'p-1')
      )}>
        <DeviceFrame 
          viewport={viewport}
          className={cn(
            "transition-all duration-300",
            viewport === 'desktop' && 'w-full h-full',
            viewport === 'tablet' && 'h-full',
            viewport === 'mobile' && 'h-full',
          )}
        >
          <div
            className={cn(
              "bg-background overflow-hidden transition-all duration-300 h-full relative flex flex-col",
              viewport === 'desktop' && 'rounded-lg shadow-lg w-full',
              viewport !== 'desktop' && 'rounded-xl',
            )}
            style={{
              width: viewport === 'desktop' ? '100%' : viewportConfig[viewport].width,
              maxWidth: '100%',
            }}
          >
            <SandpackProvider
              key={refreshKey}
              template="react-ts"
              files={sandpackFiles}
              options={{
                externalResources: [
                  'https://cdn.tailwindcss.com',
                ],
                recompileMode: 'delayed',
                recompileDelay: 500,
              }}
              customSetup={{
                entry: '/src/main.tsx',
                dependencies: {
                  'react': '^18.2.0',
                  'react-dom': '^18.2.0',
                },
              }}
              theme="auto"
            >
              {/* Use absolute positioning to ensure full height */}
              <div className="absolute inset-0 flex flex-col">
                <SandpackLayout 
                  style={{ 
                    flex: 1, 
                    height: '100%', 
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <SandpackPreviewPane 
                    style={{ flex: 1, height: '100%' }}
                    showRefreshButton={false}
                    showOpenInCodeSandbox={false}
                  />
                </SandpackLayout>
              </div>
              
              {/* Loading overlay - positioned outside absolute container */}
              <SandpackStatusIndicator />
              
              <SandpackPreviewInner 
                files={files}
                onVisualChange={onVisualChange} 
                onSaveVisualChanges={onSaveVisualChanges}
                onVisualEditorToggle={(enabled) => {
                  setIsVisualEditorActive(enabled);
                  onVisualEditorToggle?.(enabled);
                }}
                onNavigateToSource={onNavigateToSource}
                isVisualEditorEnabled={isVisualEditorActive}
                onToggleVisualEditor={handleToggleVisualEditor}
              />
            </SandpackProvider>
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
}
