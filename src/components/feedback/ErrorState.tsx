import { AlertTriangle, RefreshCw, Bug, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  onGoBack?: () => void;
  onReport?: () => void;
  variant?: "page" | "inline" | "card";
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  error,
  onRetry,
  onGoBack,
  onReport,
  variant = "card",
  className,
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20",
          className
        )}
        role="alert"
      >
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">{title}</p>
          {message && (
            <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
          )}
        </div>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={cn(
          "min-h-[400px] flex items-center justify-center p-8",
          className
        )}
        role="alert"
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>
          {errorMessage && (
            <pre className="text-left text-xs bg-muted p-4 rounded-lg overflow-auto max-h-24 text-muted-foreground">
              {errorMessage}
            </pre>
          )}
          <div className="flex items-center justify-center gap-3">
            {onGoBack && (
              <Button variant="outline" onClick={onGoBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
            {onRetry && (
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            {onReport && (
              <Button variant="ghost" onClick={onReport} className="gap-2">
                <Bug className="h-4 w-4" />
                Report Issue
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/20 bg-destructive/5 p-6",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
          {errorMessage && (
            <pre className="text-xs bg-background/50 p-2 rounded mt-3 overflow-auto max-h-20 text-muted-foreground">
              {errorMessage}
            </pre>
          )}
          <div className="flex items-center gap-2 mt-4">
            {onRetry && (
              <Button size="sm" onClick={onRetry} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            )}
            {onReport && (
              <Button size="sm" variant="ghost" onClick={onReport} className="gap-1.5">
                <Bug className="h-3.5 w-3.5" />
                Report
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
