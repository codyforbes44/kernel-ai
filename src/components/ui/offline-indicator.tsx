import { WifiOff, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  isOnline: boolean;
  queueLength: number;
  isSyncing: boolean;
  className?: string;
}

export function OfflineIndicator({
  isOnline,
  queueLength,
  isSyncing,
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
