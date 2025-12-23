import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  loading?: boolean;
  autoRefreshInterval?: number; // in seconds, 0 to disable
  className?: string;
}

export function RefreshButton({ 
  onRefresh, 
  loading, 
  autoRefreshInterval = 0,
  className 
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(autoRefreshInterval > 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!autoRefresh || autoRefreshInterval === 0) return;

    const interval = setInterval(handleRefresh, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, autoRefreshInterval]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      disabled={loading || isRefreshing}
      className={cn('relative', className)}
      title={autoRefresh ? `Auto-refresh every ${autoRefreshInterval}s` : 'Refresh'}
    >
      <RefreshCw className={cn('h-4 w-4', (loading || isRefreshing) && 'animate-spin')} />
      {autoRefresh && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
      )}
    </Button>
  );
}
