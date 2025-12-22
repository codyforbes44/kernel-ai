import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Bug, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PanelErrorBoundaryProps {
  children: ReactNode;
  panelName: string;
  onRetry?: () => void;
}

interface PanelErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Functional component for the fallback UI (to use hooks)
function PanelErrorFallbackUI({ 
  panelName, 
  error, 
  errorInfo,
  onReset 
}: { 
  panelName: string; 
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const copyErrorDetails = () => {
    const details = [
      `Panel: ${panelName}`,
      `Error: ${error?.message || 'Unknown error'}`,
      `Stack: ${error?.stack || 'No stack trace'}`,
      `Component Stack: ${errorInfo?.componentStack || 'No component stack'}`,
    ].join('\n\n');

    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Icon */}
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {panelName} failed to load
        </h3>

        {/* Message */}
        <p className="text-sm text-muted-foreground mb-4">
          An error occurred while rendering this panel. You can try again or report the issue.
        </p>

        {/* Error message preview */}
        {error && (
          <div className="w-full mb-4 p-3 bg-muted/50 rounded-lg border border-border text-left">
            <code className="text-xs text-destructive break-all line-clamp-2">
              {error.message}
            </code>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col w-full gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onReset}
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 gap-2"
            >
              <Bug className="h-4 w-4" />
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={copyErrorDetails}
              className="gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Expanded error details */}
        {showDetails && error && (
          <div className="w-full mt-4 p-3 bg-muted/30 rounded-lg border border-border text-left overflow-auto max-h-48">
            <p className="text-xs font-medium text-muted-foreground mb-2">Stack Trace:</p>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
              {error.stack || 'No stack trace available'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export class PanelErrorBoundary extends Component<PanelErrorBoundaryProps, PanelErrorBoundaryState> {
  constructor(props: PanelErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<PanelErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[${this.props.panelName}] Panel Error:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <PanelErrorFallbackUI
          panelName={this.props.panelName}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}