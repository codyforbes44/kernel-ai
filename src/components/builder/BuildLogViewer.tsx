import { useEffect, useRef, useState } from 'react';
import { Terminal, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface BuildLogViewerProps {
  deploymentId: string;
  initialLog?: string | null;
  onClose?: () => void;
}

export function BuildLogViewer({ deploymentId, initialLog, onClose }: BuildLogViewerProps) {
  const [log, setLog] = useState(initialLog || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Subscribe to realtime updates for this deployment's build_log
  useEffect(() => {
    if (!deploymentId) return;

    const channel = supabase
      .channel(`build-log-${deploymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deployments',
          filter: `id=eq.${deploymentId}`,
        },
        (payload) => {
          const newLog = payload.new?.build_log;
          if (newLog && typeof newLog === 'string') {
            setLog(newLog);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deploymentId]);

  // Auto-scroll to bottom when log updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // Parse log lines and add styling
  const renderLogLines = () => {
    if (!log) {
      return (
        <div className="text-muted-foreground animate-pulse">
          Waiting for build output...
        </div>
      );
    }

    return log.split('\n').map((line, index) => {
      let lineClass = 'text-muted-foreground';
      
      if (line.startsWith('✓')) {
        lineClass = 'text-success';
      } else if (line.startsWith('✗') || line.toLowerCase().includes('error')) {
        lineClass = 'text-destructive';
      } else if (line.includes('═══')) {
        lineClass = 'text-primary font-medium';
      } else if (line.startsWith('[')) {
        lineClass = 'text-foreground';
      } else if (line.includes('Uploaded:') || line.includes('Generated')) {
        lineClass = 'text-muted-foreground';
      } else if (line.includes('Deploy URL:')) {
        lineClass = 'text-primary';
      }

      return (
        <div key={index} className={cn('font-mono text-xs leading-relaxed', lineClass)}>
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div 
      className={cn(
        "bg-background border border-border rounded-lg overflow-hidden transition-all duration-200",
        isExpanded ? "fixed inset-4 z-50" : "relative"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Build Output</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-success" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Log Content */}
      <ScrollArea 
        ref={scrollRef}
        className={cn(
          "bg-zinc-950 p-3",
          isExpanded ? "h-[calc(100%-40px)]" : "h-48"
        )}
      >
        <div className="space-y-0.5">
          {renderLogLines()}
          <div ref={endRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
