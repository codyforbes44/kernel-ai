import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  SandpackProvider,
  SandpackPreview as SandpackPreviewPane,
  SandpackLayout,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { RefreshCw, ExternalLink, Smartphone, Monitor, Tablet, MousePointer2 } from 'lucide-react';
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
  VisualEditsButton,
} from './visual-editor';
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
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportConfig: Record<ViewportSize, { width: string; icon: React.ReactNode; label: string }> = {
  desktop: { width: '100%', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
  tablet: { width: '768px', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  mobile: { width: '375px', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
};

// Memoized file conversion cache to avoid reprocessing unchanged files
const fileContentCache = new Map<string, { hash: string; processed: string }>();

function hashContent(content: string): string {
  // Simple fast hash for cache invalidation
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
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
      
      // Check cache for processed content
      const cached = fileContentCache.get(cacheKey);
      if (cached && cached.hash === contentHash) {
        sandpackFiles[path] = cached.processed;
        continue;
      }
      
      // Process file
      let content = file.content;
      if (injectVisualEditor && path.match(/\.(jsx|tsx)$/)) {
        content = injectSourceMapping(content, path);
      }
      
      // Cache the processed content
      fileContentCache.set(cacheKey, { hash: contentHash, processed: content });
      sandpackFiles[path] = content;
    }
  }
  
  // Limit cache size to prevent memory leaks
  if (fileContentCache.size > 200) {
    const keysToDelete = Array.from(fileContentCache.keys()).slice(0, 50);
    keysToDelete.forEach(key => fileContentCache.delete(key));
  }
  
  // Ensure we have required files for React template
  if (!sandpackFiles['/index.html']) {
    sandpackFiles['/index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
  }
  
  // Inject visual editor script into index.html if enabled
  if (injectVisualEditor && sandpackFiles['/index.html']) {
    const injectionScript = getVisualEditorInjectionScript();
    sandpackFiles['/index.html'] = sandpackFiles['/index.html'].replace(
      '</body>',
      `<script>${injectionScript}</script></body>`
    );
  }
  
  // Inject design system preview CSS and fonts if provided
  if (sandpackFiles['/index.html']) {
    let headInjection = '';
    
    // Add Google Fonts link if provided
    if (previewFontsUrl) {
      headInjection += `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${previewFontsUrl}">`;
    }
    
    // Add CSS variables
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-center p-5">
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
    sandpackFiles['/src/App.css'] = `* {
  margin: 0;
  padding: 0;
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
}: {
  files: ProjectFile[];
  onVisualChange?: (change: VisualChange) => void;
  onSaveVisualChanges?: (changes: Array<{ fileId: string; content: string }>) => Promise<void>;
  onVisualEditorToggle?: (enabled: boolean) => void;
}) {
  const { sandpack } = useSandpack();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showInlineEditor, setShowInlineEditor] = useState(false);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    isEnabled,
    isSaving,
    selectedElement,
    hoveredElement,
    isInlineEditing,
    recentColors,
    canUndo,
    canRedo,
    enable,
    disable,
    toggle,
    updateStyle,
    updateText,
    updateClasses,
    deselect,
    pendingChanges,
    saveChanges,
    clearChanges,
    undo,
    redo,
    startInlineEdit,
    endInlineEdit,
    addRecentColor,
  } = useVisualEditor({
    iframeRef,
    files,
    onElementSelected: (element) => {
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

  // Notify parent of visual editor toggle
  useEffect(() => {
    onVisualEditorToggle?.(isEnabled);
  }, [isEnabled, onVisualEditorToggle]);

  // Get iframe ref from Sandpack
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
  }, [disable]);

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

  // Calculate floating toolbar position (relative to container)
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
      {/* Visual Editor Toggle in toolbar */}
      <div className="absolute top-2 right-2 z-20">
        <VisualEditsButton
          isActive={isEnabled}
          onClick={toggle}
        />
      </div>

      {/* Floating Toolbar */}
      {isEnabled && showFloatingToolbar && selectedElement && !showInlineEditor && (
        <FloatingToolbar
          element={selectedElement}
          position={getToolbarPosition()}
          onEditText={() => setShowInlineEditor(true)}
          onEditColor={() => {
            // Focus on style tab in property panel
          }}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
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

      {/* Property Editor Panel */}
      {isEnabled && (
        <div className="absolute right-0 top-12 bottom-0 w-72 z-10">
          <PropertyEditorPanel
            selectedElement={selectedElement}
            onUpdateStyle={updateStyle}
            onUpdateText={updateText}
            onUpdateClasses={updateClasses}
            onDeselect={deselect}
            onClose={handleCloseEditor}
          />
        </div>
      )}

      {/* Changes indicator with save button */}
      {pendingChanges.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
          <div className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg">
            {pendingChanges.length} unsaved change{pendingChanges.length > 1 ? 's' : ''}
          </div>
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

export function SandpackPreview({ 
  files, 
  onError, 
  onVisualChange, 
  onSaveVisualChanges,
  previewCSS,
  previewSystemName,
  previewFontsUrl,
  onVisualEditorToggle,
}: SandpackPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const sandpackFiles = useMemo(
    () => convertToSandpackFiles(files, true, previewCSS, previewFontsUrl),
    [files, previewCSS, previewFontsUrl]
  );

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Design System Preview Indicator */}
      {previewSystemName && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
          </span>
          Previewing: {previewSystemName}
        </div>
      )}

      {/* Toolbar */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground mr-2">Preview</span>
          {Object.entries(viewportConfig).map(([key, { icon, label }]) => (
            <Button
              key={key}
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7',
                viewport === key && 'bg-accent'
              )}
              onClick={() => setViewport(key as ViewportSize)}
              title={label}
            >
              {icon}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const previewFrame = document.querySelector('.sp-preview-iframe') as HTMLIFrameElement;
              if (previewFrame?.src) {
                window.open(previewFrame.src, '_blank');
              }
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 overflow-auto relative">
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 h-full relative"
          style={{
            width: viewportConfig[viewport].width,
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
            <div className="h-full relative">
              <SandpackLayout style={{ height: '100%', border: 'none' }}>
                <SandpackPreviewPane 
                  style={{ height: '100%' }}
                  showRefreshButton={false}
                  showOpenInCodeSandbox={false}
                />
              </SandpackLayout>
              <SandpackPreviewInner 
                files={files}
                onVisualChange={onVisualChange} 
                onSaveVisualChanges={onSaveVisualChanges}
                onVisualEditorToggle={onVisualEditorToggle}
              />
            </div>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}
