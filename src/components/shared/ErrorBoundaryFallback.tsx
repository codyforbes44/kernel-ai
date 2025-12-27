import { useCallback, memo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorBoundaryFallbackProps {
  error?: Error | null;
  resetError?: () => void;
  title?: string;
  description?: string;
}

export const ErrorBoundaryFallback = memo(function ErrorBoundaryFallback({
  error,
  resetError,
  title = 'Something went wrong',
  description = 'An error occurred while loading this content.',
}: ErrorBoundaryFallbackProps) {
  const handleRetry = useCallback(() => {
    resetError?.();
  }, [resetError]);

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {description}
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <pre className="text-xs text-destructive bg-destructive/10 p-2 rounded mb-4 max-w-full overflow-auto">
            {error.message}
          </pre>
        )}
        {resetError && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
