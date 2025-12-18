import { WifiOff, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface OfflineIndicatorProps {
  isOnline: boolean;
  queueLength: number;
  isSyncing: boolean;
  isChecking?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function OfflineIndicator({
  isOnline,
  queueLength,
  isSyncing,
  isChecking,
  onRetry,
  className,
}: OfflineIndicatorProps) {
  if (isOnline && queueLength === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        !isOnline
          ? "bg-destructive/10 text-destructive border border-destructive/20"
          : isSyncing
            ? "bg-warning/10 text-warning border border-warning/20"
            : "bg-primary/10 text-primary border border-primary/20",
        className
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
          {queueLength > 0 && (
            <span className="bg-destructive/20 px-1.5 py-0.5 rounded-full">
              {queueLength} queued
            </span>
          )}
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              disabled={isChecking}
              className="h-5 px-1.5 py-0 text-xs hover:bg-destructive/20"
            >
              {isChecking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          )}
        </>
      ) : isSyncing ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : queueLength > 0 ? (
        <>
          <CloudOff className="h-3 w-3" />
          <span>{queueLength} pending</span>
        </>
      ) : null}
    </div>
  );
}
