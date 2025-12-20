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
import { useVisualEditor, PropertyEditorPanel, getVisualEditorInjectionScript } from './visual-editor';
import { injectSourceMapping } from '@/lib/jsxSourceMapper';
import { toast } from 'sonner';

interface SandpackPreviewProps {
  files: ProjectFile[];
  onError?: (error: string) => void;
  onVisualChange?: (change: VisualChange) => void;
  onSaveVisualChanges?: (changes: Array<{ fileId: string; content: string }>) => Promise<void>;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportConfig: Record<ViewportSize, { width: string; icon: React.ReactNode; label: string }> = {
  desktop: { width: '100%', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
  tablet: { width: '768px', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  mobile: { width: '375px', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
};

// Convert project files to Sandpack format with visual editor injection
function convertToSandpackFiles(files: ProjectFile[], injectVisualEditor: boolean): Record<string, string> {
  const sandpackFiles: Record<string, string> = {};
  
  for (const file of files) {
    if (file.content && file.type === 'file') {
      const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
      
      // Inject source mapping into JSX/TSX files for visual editor
      let content = file.content;
      if (injectVisualEditor && path.match(/\.(jsx|tsx)$/)) {
        content = injectSourceMapping(content, path);
      }
      
      sandpackFiles[path] = content;
    }
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
}: {
  files: ProjectFile[];
  onVisualChange?: (change: VisualChange) => void;
  onSaveVisualChanges?: (changes: Array<{ fileId: string; content: string }>) => Promise<void>;
}) {
  const { sandpack } = useSandpack();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const {
    isEnabled,
    isSaving,
    selectedElement,
    hoveredElement,
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
  } = useVisualEditor({
    iframeRef,
    files,
    onElementSelected: (element) => {
      // Element selected in preview
    },
    onChangeApplied: (change) => {
      onVisualChange?.(change);
    },
    onSaveChanges: onSaveVisualChanges,
  });

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

  return (
    <>
      {/* Visual Editor Toggle in toolbar */}
      <Button
        variant={isEnabled ? 'default' : 'ghost'}
        size="icon"
        className={cn('h-7 w-7', isEnabled && 'bg-primary text-primary-foreground')}
        onClick={toggle}
        title={isEnabled ? 'Disable Visual Editor' : 'Enable Visual Editor'}
      >
        <MousePointer2 className="h-4 w-4" />
      </Button>

      {/* Property Editor Panel */}
      {isEnabled && (
        <div className="absolute right-0 top-10 bottom-0 w-72 z-10">
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
    </>
  );
}

export function SandpackPreview({ files, onError, onVisualChange, onSaveVisualChanges }: SandpackPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [visualEditorEnabled, setVisualEditorEnabled] = useState(false);

  const sandpackFiles = useMemo(
    () => convertToSandpackFiles(files, true), // Always inject for now
    [files]
  );

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
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
              />
            </div>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}
