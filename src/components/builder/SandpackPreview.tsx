import { useMemo } from 'react';
import {
  SandpackProvider,
  SandpackPreview as SandpackPreviewPane,
  SandpackLayout,
} from '@codesandbox/sandpack-react';
import { RefreshCw, ExternalLink, Smartphone, Monitor, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProjectFile } from '@/types/builder';
import { useState } from 'react';

interface SandpackPreviewProps {
  files: ProjectFile[];
  onError?: (error: string) => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportConfig: Record<ViewportSize, { width: string; icon: React.ReactNode; label: string }> = {
  desktop: { width: '100%', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
  tablet: { width: '768px', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  mobile: { width: '375px', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
};

// Convert project files to Sandpack format
function convertToSandpackFiles(files: ProjectFile[]): Record<string, string> {
  const sandpackFiles: Record<string, string> = {};
  
  for (const file of files) {
    if (file.content && file.type === 'file') {
      // Sandpack expects paths without leading slash for some files
      const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
      sandpackFiles[path] = file.content;
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to the Builder</h1>
      <p style={{ opacity: 0.9 }}>Edit App.tsx to start building your app</p>
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

export function SandpackPreview({ files }: SandpackPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const sandpackFiles = useMemo(() => convertToSandpackFiles(files), [files]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="h-full flex flex-col bg-background">
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
              // Open preview in new window - Sandpack handles this internally
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
      <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 overflow-auto">
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 h-full"
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
            <SandpackLayout style={{ height: '100%', border: 'none' }}>
              <SandpackPreviewPane 
                style={{ height: '100%' }}
                showRefreshButton={false}
                showOpenInCodeSandbox={false}
              />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}
