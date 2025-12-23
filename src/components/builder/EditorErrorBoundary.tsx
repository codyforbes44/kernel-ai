import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { captureError, addBreadcrumb } from '@/lib/sentry';

interface EditorErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Editor Error Boundary caught an error:', error, errorInfo);
    
    // Add breadcrumb and capture to Sentry
    addBreadcrumb('Error caught in EditorErrorBoundary', 'error-boundary', 'error', {
      componentStack: errorInfo.componentStack,
    });
    
    captureError(error, {
      boundary: 'EditorErrorBoundary',
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const { fallbackTitle = 'Something went wrong', fallbackMessage = 'An error occurred while loading this component.' } = this.props;
      
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background p-6">
          <div className="flex flex-col items-center text-center max-w-md">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {fallbackTitle}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {fallbackMessage}
            </p>
            {this.state.error && (
              <div className="w-full mb-4 p-3 bg-muted/50 rounded-lg border border-border">
                <code className="text-xs text-destructive break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
