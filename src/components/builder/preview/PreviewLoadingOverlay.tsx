import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewLoadingOverlayProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export function PreviewLoadingOverlay({ 
  isLoading, 
  progress,
  message = 'Building preview...'
}: PreviewLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-fade-in">
      {/* Animated loader */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
      
      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      
      {/* Message */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">This may take a few seconds</p>
      </div>

      {/* Animated skeleton content hint */}
      <div className="mt-4 w-64 space-y-3 opacity-40">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" style={{ animationDelay: '100ms' }} />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" style={{ animationDelay: '200ms' }} />
      </div>
    </div>
  );
}
