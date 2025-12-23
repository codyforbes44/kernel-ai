import { Component, ErrorInfo, ReactNode } from 'react';
import { captureError, addBreadcrumb } from '@/lib/sentry';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

// Fallback component with copy functionality
function ErrorFallback({ 
  error, 
  eventId, 
  onReset, 
  componentName 
}: { 
  error: Error | null; 
  eventId: string | null; 
  onReset: () => void;
  componentName?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const errorInfo = {
      message: error?.message,
      stack: error?.stack,
      eventId,
      component: componentName,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
    
    await navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[200px] bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            {componentName ? `Error in ${componentName}` : 'Something went wrong'}
          </h2>
          <p className="text-muted-foreground text-sm">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>

        {error && (
          <div className="text-left bg-muted/50 rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Error Details</span>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 text-xs gap-1">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <pre className="text-xs text-destructive overflow-auto max-h-24 whitespace-pre-wrap break-all">
              {error.message}
            </pre>
            {eventId && (
              <p className="text-xs text-muted-foreground">
                Event ID: <code className="bg-muted px-1 rounded">{eventId}</code>
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button onClick={onReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a href="https://github.com/your-repo/issues" target="_blank" rel="noopener noreferrer">
              <Bug className="h-4 w-4" />
              Report Issue
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Add breadcrumb for context
    addBreadcrumb(
      `Error caught in ${this.props.componentName || 'ErrorBoundary'}`,
      'error-boundary',
      'error',
      { componentStack: errorInfo.componentStack }
    );

    // Capture to Sentry with context
    captureError(error, {
      componentName: this.props.componentName,
      componentStack: errorInfo.componentStack,
    });

    // Log to console in development
    console.error('[SentryErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, eventId: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          eventId={this.state.eventId}
          onReset={this.handleReset}
          componentName={this.props.componentName}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withSentryErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <SentryErrorBoundary componentName={componentName || WrappedComponent.displayName || WrappedComponent.name}>
        <WrappedComponent {...props} />
      </SentryErrorBoundary>
    );
  };
}
