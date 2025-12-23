import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeployRequest {
  projectId: string;
  environment: 'preview' | 'production';
  commitMessage?: string;
}

interface ProjectFile {
  path: string;
  content: string | null;
  type: 'file' | 'folder';
}

// Input validation helpers
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function sanitizeString(str: string, maxLength: number): string {
  return str.slice(0, maxLength).replace(/[<>]/g, "");
}

function validateDeployRequest(body: unknown): { valid: true; data: DeployRequest } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const { projectId, environment, commitMessage } = body as Record<string, unknown>;

  if (typeof projectId !== "string" || !isValidUUID(projectId)) {
    return { valid: false, error: "projectId must be a valid UUID" };
  }

  if (environment !== "preview" && environment !== "production") {
    return { valid: false, error: "environment must be 'preview' or 'production'" };
  }

  if (commitMessage !== undefined && commitMessage !== null) {
    if (typeof commitMessage !== "string") {
      return { valid: false, error: "commitMessage must be a string" };
    }
    if (commitMessage.length > 500) {
      return { valid: false, error: "commitMessage must be 500 characters or less" };
    }
  }

  return {
    valid: true,
    data: {
      projectId,
      environment,
      commitMessage: typeof commitMessage === "string" ? sanitizeString(commitMessage, 500) : undefined,
    },
  };
}

// Transform TypeScript/JSX code to be browser-compatible
function transformCode(code: string, filePath: string): string {
  let transformed = code;
  
  // Remove all import statements
  transformed = transformed.replace(/^import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+(?:\s*,\s*\{[^}]*\})?)\s+from\s+['"][^'"]+['"];?\s*$/gm, '');
  transformed = transformed.replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '');
  
  // Remove export statements but keep the code
  transformed = transformed.replace(/^export\s+default\s+function\s+(\w+)/gm, 'function $1');
  transformed = transformed.replace(/^export\s+default\s+class\s+(\w+)/gm, 'class $1');
  transformed = transformed.replace(/^export\s+default\s+/gm, 'const _default = ');
  transformed = transformed.replace(/^export\s+(?:const|let|var|function|class)\s+/gm, (match) => {
    return match.replace('export ', '');
  });
  transformed = transformed.replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
  transformed = transformed.replace(/^export\s+type\s+.*$/gm, '');
  transformed = transformed.replace(/^export\s+interface\s+.*$/gm, '');
  
  // Remove TypeScript type annotations that Babel might not handle well
  // Remove 'as const' assertions
  transformed = transformed.replace(/\s+as\s+const\b/g, '');
  
  // Remove satisfies keyword
  transformed = transformed.replace(/\s+satisfies\s+\w+(?:<[^>]+>)?/g, '');
  
  return transformed;
}

// Extract component name from file path
function getComponentName(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  return fileName.replace(/\.(tsx|jsx|ts|js)$/, '');
}

// Build dependency graph to order components correctly
function buildDependencyOrder(files: ProjectFile[]): ProjectFile[] {
  const componentFiles = files.filter(f => 
    f.type === 'file' && 
    f.content && 
    (f.path.endsWith('.tsx') || f.path.endsWith('.jsx') || f.path.endsWith('.ts') || f.path.endsWith('.js')) &&
    !f.path.includes('node_modules') &&
    !f.path.includes('.test.') &&
    !f.path.includes('.spec.')
  );
  
  // Order: types/utils first, then components, then App last
  const ordered: ProjectFile[] = [];
  const appFile = componentFiles.find(f => f.path.includes('App.tsx') || f.path.includes('App.jsx'));
  const mainFile = componentFiles.find(f => f.path.includes('main.tsx') || f.path.includes('main.jsx') || f.path.includes('index.tsx'));
  
  // Add utility files first (lib, utils, types, hooks)
  for (const file of componentFiles) {
    if (file === appFile || file === mainFile) continue;
    if (file.path.includes('/lib/') || 
        file.path.includes('/utils/') || 
        file.path.includes('/types/') ||
        file.path.includes('/constants/')) {
      ordered.push(file);
    }
  }
  
  // Add hooks
  for (const file of componentFiles) {
    if (file === appFile || file === mainFile) continue;
    if (file.path.includes('/hooks/') || file.path.includes('use')) {
      if (!ordered.includes(file)) {
        ordered.push(file);
      }
    }
  }
  
  // Add UI components
  for (const file of componentFiles) {
    if (file === appFile || file === mainFile) continue;
    if (file.path.includes('/ui/') || file.path.includes('/components/ui/')) {
      if (!ordered.includes(file)) {
        ordered.push(file);
      }
    }
  }
  
  // Add remaining components
  for (const file of componentFiles) {
    if (file === appFile || file === mainFile) continue;
    if (!ordered.includes(file)) {
      ordered.push(file);
    }
  }
  
  // Add App file last (but before main)
  if (appFile) {
    ordered.push(appFile);
  }
  
  return ordered;
}

// Generate a static preview with comprehensive CDN dependencies
function generateStaticPreview(files: ProjectFile[], projectName: string): Map<string, string> {
  const outputFiles = new Map<string, string>();
  
  const safeProjectName = projectName.replace(/[<>&"']/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] || c));
  
  // Get ordered component files
  const orderedFiles = buildDependencyOrder(files);
  
  // Find CSS files
  const cssFiles = files.filter(f => f.type === 'file' && f.content && f.path.endsWith('.css'));
  
  // Combine and process CSS
  let combinedCSS = cssFiles.map(f => {
    let css = f.content || '';
    // Remove @import statements (they won't work in inline styles)
    css = css.replace(/@import\s+[^;]+;/g, '');
    // Remove @tailwind directives
    css = css.replace(/@tailwind\s+[^;]+;/g, '');
    // Remove @layer directives but keep content
    css = css.replace(/@layer\s+\w+\s*\{([^}]*)\}/g, '$1');
    return css;
  }).join('\n\n');
  
  // Build component code with proper ordering
  let componentCode = '';
  const processedComponents: string[] = [];
  
  for (const file of orderedFiles) {
    if (!file.content) continue;
    
    const componentName = getComponentName(file.path);
    const transformed = transformCode(file.content, file.path);
    
    // Skip empty or type-only files
    if (transformed.trim().length < 10) continue;
    
    componentCode += `
// ========== ${file.path} ==========
try {
${transformed}
} catch (e) {
  console.warn('Error loading ${file.path}:', e.message);
}

`;
    processedComponents.push(componentName);
  }

  // Generate the main HTML file with comprehensive library support
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeProjectName}</title>
  <meta name="description" content="${safeProjectName} - Built with React, TypeScript, Tailwind, Vite & Supabase">
  <meta name="generator" content="Lovable AI Builder">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            primary: {
              DEFAULT: 'hsl(var(--primary))',
              foreground: 'hsl(var(--primary-foreground))',
            },
            secondary: {
              DEFAULT: 'hsl(var(--secondary))',
              foreground: 'hsl(var(--secondary-foreground))',
            },
            destructive: {
              DEFAULT: 'hsl(var(--destructive))',
              foreground: 'hsl(var(--destructive-foreground))',
            },
            muted: {
              DEFAULT: 'hsl(var(--muted))',
              foreground: 'hsl(var(--muted-foreground))',
            },
            accent: {
              DEFAULT: 'hsl(var(--accent))',
              foreground: 'hsl(var(--accent-foreground))',
            },
            popover: {
              DEFAULT: 'hsl(var(--popover))',
              foreground: 'hsl(var(--popover-foreground))',
            },
            card: {
              DEFAULT: 'hsl(var(--card))',
              foreground: 'hsl(var(--card-foreground))',
            },
          },
          borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
          },
        },
      },
    }
  </script>
  
  <!-- Core React -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  
  <!-- Babel for JSX transformation -->
  <script src="https://unpkg.com/@babel/standalone@7.23.5/babel.min.js"></script>
  
  <!-- React Router -->
  <script src="https://unpkg.com/react-router-dom@6.20.0/dist/umd/react-router-dom.production.min.js"></script>
  
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.min.js"></script>
  
  <!-- Framer Motion -->
  <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
  
  <!-- Class Variance Authority -->
  <script src="https://unpkg.com/class-variance-authority@0.7.0/dist/index.js"></script>
  
  <!-- clsx and tailwind-merge -->
  <script src="https://unpkg.com/clsx@2.0.0/dist/clsx.min.js"></script>
  
  <style>
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 222.2 84% 4.9%;
      --primary: 222.2 47.4% 11.2%;
      --primary-foreground: 210 40% 98%;
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 210 40% 98%;
      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: 222.2 84% 4.9%;
      --radius: 0.5rem;
    }
    
    .dark {
      --background: 222.2 84% 4.9%;
      --foreground: 210 40% 98%;
      --card: 222.2 84% 4.9%;
      --card-foreground: 210 40% 98%;
      --popover: 222.2 84% 4.9%;
      --popover-foreground: 210 40% 98%;
      --primary: 210 40% 98%;
      --primary-foreground: 222.2 47.4% 11.2%;
      --secondary: 217.2 32.6% 17.5%;
      --secondary-foreground: 210 40% 98%;
      --muted: 217.2 32.6% 17.5%;
      --muted-foreground: 215 20.2% 65.1%;
      --accent: 217.2 32.6% 17.5%;
      --accent-foreground: 210 40% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 210 40% 98%;
      --border: 217.2 32.6% 17.5%;
      --input: 217.2 32.6% 17.5%;
      --ring: 212.7 26.8% 83.9%;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      border-color: hsl(var(--border));
    }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      min-height: 100vh;
    }
    
    /* Animation keyframes */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    
    .animate-slide-up {
      animation: slideUp 0.4s ease-out;
    }
    
${combinedCSS}
  </style>
</head>
<body class="min-h-screen bg-background text-foreground antialiased">
  <div id="root">
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid hsl(var(--primary)); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 16px; color: hsl(var(--muted-foreground));">Loading ${safeProjectName}...</p>
      </div>
    </div>
  </div>
  <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  
  <script>
    // Setup global shims for common libraries
    window.process = { env: { NODE_ENV: 'production' } };
    
    // React hooks shortcuts
    const { 
      useState, useEffect, useCallback, useMemo, useRef, 
      useContext, useReducer, useLayoutEffect, createContext,
      Fragment, createElement, forwardRef, memo, lazy, Suspense,
      Children, cloneElement, isValidElement
    } = React;
    
    // React Router shims
    const ReactRouterDOM = window.ReactRouterDOM || {};
    const { 
      BrowserRouter, Routes, Route, Link, NavLink, Navigate,
      useNavigate, useLocation, useParams, useSearchParams,
      Outlet, createBrowserRouter, RouterProvider
    } = ReactRouterDOM;
    
    // Framer Motion shims
    const FramerMotion = window.Motion || {};
    const { motion, AnimatePresence, useAnimation, useInView } = FramerMotion;
    
    // Lucide React shims
    const LucideReact = window.lucideReact || {};
    
    // CVA shim
    const cva = window.cva || function(base, config) {
      return function(props) {
        let classes = base || '';
        if (config && config.variants && props) {
          Object.keys(config.variants).forEach(key => {
            const value = props[key] || (config.defaultVariants && config.defaultVariants[key]);
            if (value && config.variants[key] && config.variants[key][value]) {
              classes += ' ' + config.variants[key][value];
            }
          });
        }
        return classes;
      };
    };
    
    // clsx shim
    const clsx = window.clsx || function(...args) {
      return args.filter(Boolean).join(' ');
    };
    
    // cn utility (commonly used with shadcn)
    const cn = function(...inputs) {
      return clsx(...inputs);
    };
    
    // Toast shim
    const toast = function(options) {
      const message = typeof options === 'string' ? options : options?.description || options?.title || '';
      console.log('Toast:', message);
    };
    toast.success = (msg) => toast({ title: 'Success', description: msg });
    toast.error = (msg) => toast({ title: 'Error', description: msg });
    toast.info = (msg) => toast({ title: 'Info', description: msg });
    
    // Supabase client shim (for preview only)
    const supabase = {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signIn: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
    };
    
    // React Query shims
    const useQuery = function(options) {
      const [data, setData] = useState(null);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState(null);
      
      useEffect(() => {
        if (options.queryFn) {
          options.queryFn()
            .then(result => { setData(result); setIsLoading(false); })
            .catch(err => { setError(err); setIsLoading(false); });
        } else {
          setIsLoading(false);
        }
      }, []);
      
      return { data, isLoading, error, refetch: () => {} };
    };
    
    const useMutation = function(options) {
      const [isLoading, setIsLoading] = useState(false);
      const mutate = async (variables) => {
        setIsLoading(true);
        try {
          if (options.mutationFn) {
            const result = await options.mutationFn(variables);
            if (options.onSuccess) options.onSuccess(result);
            return result;
          }
        } catch (error) {
          if (options.onError) options.onError(error);
        } finally {
          setIsLoading(false);
        }
      };
      return { mutate, mutateAsync: mutate, isLoading, isPending: isLoading };
    };
    
    const QueryClient = function() { return {}; };
    const QueryClientProvider = function({ children }) { return children; };
    
    // Common icon shims
    const iconShim = (name) => {
      return function(props) {
        const Icon = LucideReact[name];
        if (Icon) return React.createElement(Icon, props);
        return React.createElement('span', { 
          ...props, 
          style: { display: 'inline-block', width: props?.size || 24, height: props?.size || 24 } 
        });
      };
    };
    
    // Pre-define common icons
    const commonIcons = [
      'Menu', 'X', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
      'Check', 'Plus', 'Minus', 'Search', 'Settings', 'User', 'Home', 'Mail',
      'Phone', 'MapPin', 'Calendar', 'Clock', 'Heart', 'Star', 'Share',
      'Download', 'Upload', 'Edit', 'Trash', 'Copy', 'Save', 'Send',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ExternalLink',
      'Eye', 'EyeOff', 'Lock', 'Unlock', 'Key', 'Shield', 'AlertCircle',
      'Info', 'HelpCircle', 'CheckCircle', 'XCircle', 'AlertTriangle',
      'Loader2', 'RefreshCw', 'RotateCcw', 'Zap', 'Sparkles', 'Wand2',
      'Code', 'Terminal', 'FileText', 'Folder', 'Image', 'Video', 'Music',
      'MessageSquare', 'Bell', 'Gift', 'ShoppingCart', 'CreditCard', 'DollarSign',
      'Sun', 'Moon', 'Cloud', 'Wifi', 'Battery', 'Smartphone', 'Monitor',
      'Github', 'Twitter', 'Linkedin', 'Facebook', 'Instagram', 'Youtube'
    ];
    
    commonIcons.forEach(name => {
      window[name] = iconShim(name);
    });
  </script>
  
  <script type="text/babel" data-presets="react,typescript">
    // Component code starts here
${componentCode}

    // Mount the application
    (function() {
      const container = document.getElementById('root');
      const root = ReactDOM.createRoot(container);
      
      // Create error boundary wrapper
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }
        
        static getDerivedStateFromError(error) {
          return { hasError: true, error };
        }
        
        componentDidCatch(error, errorInfo) {
          console.error('React Error:', error, errorInfo);
        }
        
        render() {
          if (this.state.hasError) {
            return React.createElement('div', {
              style: {
                padding: '40px',
                maxWidth: '800px',
                margin: '0 auto',
                fontFamily: 'system-ui, sans-serif'
              }
            },
              React.createElement('h1', {
                style: { color: '#dc2626', fontSize: '24px', marginBottom: '16px' }
              }, 'Something went wrong'),
              React.createElement('pre', {
                style: {
                  padding: '16px',
                  background: '#fef2f2',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '14px',
                  color: '#991b1b',
                  border: '1px solid #fecaca'
                }
              }, this.state.error?.message || 'Unknown error'),
              React.createElement('button', {
                onClick: () => window.location.reload(),
                style: {
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }
              }, 'Reload Page')
            );
          }
          return this.props.children;
        }
      }
      
      // Try to find and render the main App component
      try {
        let AppComponent = null;
        
        if (typeof App !== 'undefined') {
          AppComponent = App;
        } else if (typeof _default !== 'undefined') {
          AppComponent = _default;
        }
        
        if (AppComponent) {
          // Check if App uses Router - if so, wrap it
          const appString = AppComponent.toString();
          const usesRouter = appString.includes('BrowserRouter') || 
                            appString.includes('Routes') || 
                            appString.includes('Route');
          
          if (usesRouter && typeof BrowserRouter !== 'undefined') {
            root.render(
              React.createElement(ErrorBoundary, null,
                React.createElement(AppComponent)
              )
            );
          } else if (typeof BrowserRouter !== 'undefined') {
            // Wrap in BrowserRouter just in case
            root.render(
              React.createElement(ErrorBoundary, null,
                React.createElement(BrowserRouter, null,
                  React.createElement(AppComponent)
                )
              )
            );
          } else {
            root.render(
              React.createElement(ErrorBoundary, null,
                React.createElement(AppComponent)
              )
            );
          }
          console.log('✓ Application mounted successfully');
        } else {
          // No App component found - show a helpful message
          root.render(
            React.createElement('div', {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '40px',
                textAlign: 'center',
                fontFamily: 'system-ui, sans-serif'
              }
            },
              React.createElement('h1', {
                style: { fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }
              }, '${safeProjectName}'),
              React.createElement('p', {
                style: { color: '#6b7280', marginBottom: '24px' }
              }, 'No App component was found in this project.'),
              React.createElement('div', {
                style: {
                  padding: '16px 24px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151'
                }
              }, 'Create an App.tsx file with a default exported component to see your app here.')
            )
          );
          console.warn('No App component found');
        }
      } catch (error) {
        console.error('Failed to mount application:', error);
        root.render(
          React.createElement('div', {
            style: {
              padding: '40px',
              maxWidth: '800px',
              margin: '0 auto',
              fontFamily: 'system-ui, sans-serif'
            }
          },
            React.createElement('h1', {
              style: { color: '#dc2626', fontSize: '24px', marginBottom: '16px' }
            }, 'Build Error'),
            React.createElement('p', {
              style: { marginBottom: '16px', color: '#6b7280' }
            }, 'There was an error building your application:'),
            React.createElement('pre', {
              style: {
                padding: '16px',
                background: '#fef2f2',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '14px',
                color: '#991b1b',
                border: '1px solid #fecaca',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }
            }, error.message || String(error)),
            React.createElement('details', {
              style: { marginTop: '16px' }
            },
              React.createElement('summary', {
                style: { cursor: 'pointer', color: '#6b7280' }
              }, 'Stack trace'),
              React.createElement('pre', {
                style: {
                  marginTop: '8px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  overflow: 'auto'
                }
              }, error.stack || 'No stack trace available')
            )
          )
        );
      }
    })();
  </script>
</body>
</html>`;

  outputFiles.set('index.html', html);
  
  // Copy static assets
  const assetFiles = files.filter(f => 
    f.type === 'file' && 
    f.content &&
    (f.path.endsWith('.png') || f.path.endsWith('.jpg') || f.path.endsWith('.jpeg') || 
     f.path.endsWith('.svg') || f.path.endsWith('.ico') || f.path.endsWith('.gif') ||
     f.path.endsWith('.webp') || f.path.endsWith('.woff') || f.path.endsWith('.woff2'))
  );
  
  for (const asset of assetFiles) {
    if (asset.content) {
      outputFiles.set(asset.path.replace('/src/', '/').replace('/public/', '/'), asset.content);
    }
  }
  
  return outputFiles;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.json();
    const validation = validateDeployRequest(rawBody);
    
    if (!validation.valid) {
      console.log("[deploy] Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { projectId, environment, commitMessage } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const startTime = Date.now();
    console.log(`[deploy] Starting ${environment} deployment for project ${projectId}`);

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: project, error: projectError } = await supabaseUser
      .from('builder_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: files, error: filesError } = await supabaseUser
      .from('project_files')
      .select('*')
      .eq('project_id', projectId);

    if (filesError) {
      throw filesError;
    }

    const { data: lastDeployment } = await supabaseUser
      .from('deployments')
      .select('version')
      .eq('project_id', projectId)
      .eq('environment', environment)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const version = (lastDeployment?.version || 0) + 1;

    const { data: subdomain } = await supabaseAdmin.rpc('generate_subdomain', {
      project_name: project.name,
      project_id: projectId
    });

    const { data: deployment, error: deploymentError } = await supabaseUser
      .from('deployments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        version,
        status: 'building',
        environment,
        subdomain: subdomain || `project-${projectId.slice(0, 8)}`,
        commit_message: commitMessage,
        file_count: files?.length || 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (deploymentError) {
      throw deploymentError;
    }

    console.log(`[deploy] Created deployment ${deployment.id}, version ${version}`);

    try {
      let buildLog = '';
      const appendLog = async (message: string) => {
        buildLog += message + '\n';
        console.log(`[deploy] ${message}`);
        await supabaseAdmin
          .from('deployments')
          .update({ build_log: buildLog })
          .eq('id', deployment.id);
      };

      await appendLog(`[${new Date().toISOString()}] Build started`);
      await appendLog(`Project: ${project.name}`);
      await appendLog(`Environment: ${environment}`);
      await appendLog(`Version: ${version}`);
      await appendLog(`Files to process: ${files?.length || 0}`);
      await appendLog('');

      await appendLog('Generating optimized static bundle...');
      await appendLog('- Processing TypeScript/JSX files');
      await appendLog('- Bundling CSS with Tailwind support');
      await appendLog('- Setting up CDN dependencies');
      
      const outputFiles = generateStaticPreview(
        files as ProjectFile[],
        project.name
      );
      await appendLog(`Generated ${outputFiles.size} output files`);

      const deployPath = `${projectId}/${environment}/v${version}`;
      let totalSize = 0;
      let uploadedCount = 0;

      await appendLog('');
      await appendLog('Uploading to storage...');

      for (const [filename, content] of outputFiles) {
        const filePath = `${deployPath}/${filename}`;
        const blob = new Blob([content], { type: getMimeType(filename) });
        totalSize += blob.size;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('deployments')
          .upload(filePath, blob, {
            contentType: getMimeType(filename),
            upsert: true,
          });

        if (uploadError) {
          await appendLog(`✗ Error uploading ${filename}: ${uploadError.message}`);
          console.error(`[deploy] Upload error for ${filename}:`, uploadError);
        } else {
          uploadedCount++;
          await appendLog(`✓ Uploaded: ${filename} (${formatBytes(blob.size)})`);
        }
      }

      await appendLog('');
      await appendLog('Finalizing deployment...');
      
      const { data: publicUrl } = supabaseAdmin.storage
        .from('deployments')
        .getPublicUrl(`${deployPath}/index.html`);

      const buildDuration = Date.now() - startTime;
      await appendLog('');
      await appendLog('═══════════════════════════════════════');
      await appendLog(`✓ Build completed in ${buildDuration}ms`);
      await appendLog(`  Files uploaded: ${uploadedCount}/${outputFiles.size}`);
      await appendLog(`  Total bundle size: ${formatBytes(totalSize)}`);
      await appendLog(`  Deploy URL: ${publicUrl.publicUrl}`);
      await appendLog('═══════════════════════════════════════');

      const { error: updateError } = await supabaseUser
        .from('deployments')
        .update({
          status: 'deployed',
          deploy_url: publicUrl.publicUrl,
          build_log: buildLog,
          build_duration_ms: buildDuration,
          bundle_size_bytes: totalSize,
          completed_at: new Date().toISOString(),
        })
        .eq('id', deployment.id);

      if (updateError) {
        console.error('[deploy] Failed to update deployment:', updateError);
      }

      console.log(`[deploy] Deployment ${deployment.id} completed in ${buildDuration}ms`);

      return new Response(
        JSON.stringify({
          success: true,
          deployment: {
            id: deployment.id,
            version,
            environment,
            status: 'deployed',
            deploy_url: publicUrl.publicUrl,
            subdomain: deployment.subdomain,
            build_duration_ms: buildDuration,
            bundle_size_bytes: totalSize,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (buildError) {
      console.error('[deploy] Build error:', buildError);

      await supabaseUser
        .from('deployments')
        .update({
          status: 'failed',
          build_log: `Build failed: ${buildError instanceof Error ? buildError.message : 'Unknown error'}`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', deployment.id);

      throw buildError;
    }
  } catch (error) {
    console.error('[deploy] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Deployment failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ico: 'image/x-icon',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
