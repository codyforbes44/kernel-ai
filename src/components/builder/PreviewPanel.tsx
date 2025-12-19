import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ExternalLink, Smartphone, Monitor, Tablet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProjectFile } from '@/types/builder';

interface PreviewPanelProps {
  files: ProjectFile[];
  onError?: (error: string) => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes: Record<ViewportSize, { width: string; icon: React.ReactNode; label: string }> = {
  desktop: { width: '100%', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
  tablet: { width: '768px', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  mobile: { width: '375px', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
};

// Generate HTML for preview
function generatePreviewHTML(files: ProjectFile[]): string {
  const appFile = files.find(f => f.path === '/src/App.tsx' || f.path === '/src/App.jsx');
  const cssFile = files.find(f => f.path === '/src/App.css');
  const indexHtml = files.find(f => f.path === '/index.html');
  
  // Extract component code - simplified transpilation
  let jsCode = '';
  if (appFile?.content) {
    // Very basic transpilation for preview (removes TypeScript, converts JSX)
    jsCode = appFile.content
      // Remove TypeScript type annotations
      .replace(/:\s*\w+(\[\])?(\s*[,\)])/g, '$2')
      .replace(/:\s*\w+\s*=/g, ' =')
      .replace(/<(\w+)([^>]*)>/g, (match, tag, attrs) => {
        return `React.createElement('${tag.toLowerCase()}', ${attrs ? `{${attrs.trim().replace(/(\w+)="([^"]*)"/g, '$1: "$2"').replace(/className/g, 'className')}}` : 'null'}`;
      })
      .replace(/<\/\w+>/g, ')')
      // Handle self-closing tags
      .replace(/<(\w+)([^>]*)\/>/g, (match, tag, attrs) => {
        return `React.createElement('${tag.toLowerCase()}', ${attrs ? `{${attrs.trim().replace(/(\w+)="([^"]*)"/g, '$1: "$2"')}}` : 'null'})`;
      });
  }

  const cssCode = cssFile?.content || '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${cssCode}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${appFile?.content || `
      function App() {
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
      }
    `}
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>
`;
}

export function PreviewPanel({ files, onError }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setPreviewKey(k => k + 1);
  }, []);

  // Update preview when files change
  useEffect(() => {
    if (!iframeRef.current) return;

    try {
      const html = generatePreviewHTML(files);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      iframeRef.current.src = url;
      
      iframeRef.current.onload = () => {
        setIsLoading(false);
        URL.revokeObjectURL(url);
      };

      iframeRef.current.onerror = () => {
        setIsLoading(false);
        setError('Failed to load preview');
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview error');
      setIsLoading(false);
    }
  }, [files, previewKey]);

  const openInNewTab = () => {
    const html = generatePreviewHTML(files);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground mr-2">Preview</span>
          {Object.entries(viewportSizes).map(([key, { icon, label }]) => (
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
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={openInNewTab}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 overflow-auto">
        {error ? (
          <div className="flex flex-col items-center gap-3 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={refresh}>
              Try Again
            </Button>
          </div>
        ) : (
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
            style={{
              width: viewportSizes[viewport].width,
              maxWidth: '100%',
              height: viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '80%' : '70%',
            }}
          >
            <iframe
              ref={iframeRef}
              key={previewKey}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
