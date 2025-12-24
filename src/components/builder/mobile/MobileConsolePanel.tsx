import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { X, Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/hooks/useHaptic';

interface ConsoleLog {
  id: string;
  method: 'log' | 'info' | 'warn' | 'error' | 'debug';
  data: string;
  timestamp: Date;
}

interface MobileConsolePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function parseConsoleLog(event: MessageEvent): ConsoleLog | null {
  const data = event.data;
  
  if (!data) return null;
  
  // Handle Sandpack console messages
  if (data.type === 'console' && data.log) {
    const log = data.log;
    const method = log.method as ConsoleLog['method'];
    
    // Skip React DevTools messages
    const message = Array.isArray(log.data) ? log.data.join(' ') : String(log.data);
    if (message.includes('Download the React DevTools')) return null;
    if (message.includes('[HMR]')) return null; // Skip HMR messages
    
    // Only capture log, info, warn, error, debug
    if (['log', 'info', 'warn', 'error', 'debug'].includes(method)) {
      return {
        id: crypto.randomUUID(),
        method,
        data: message,
        timestamp: new Date(),
      };
    }
  }
  
  return null;
}

export const MobileConsolePanel = memo(function MobileConsolePanel({
  isOpen,
  onToggle,
  onClose,
}: MobileConsolePanelProps) {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Listen for console messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const parsedLog = parseConsoleLog(event);
      if (parsedLog) {
        setLogs(prev => [...prev.slice(-99), parsedLog]); // Keep last 100 logs
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);
  
  const clearLogs = useCallback(() => {
    hapticFeedback('light');
    setLogs([]);
  }, []);
  
  const toggleExpand = useCallback(() => {
    hapticFeedback('light');
    setIsExpanded(prev => !prev);
  }, []);
  
  const handleClose = useCallback(() => {
    hapticFeedback('light');
    onClose();
  }, [onClose]);
  
  const errorCount = logs.filter(l => l.method === 'error').length;
  const warnCount = logs.filter(l => l.method === 'warn').length;
  
  const getMethodColor = (method: ConsoleLog['method']) => {
    switch (method) {
      case 'error': return 'text-destructive';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-400';
      case 'debug': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };
  
  const getMethodBadge = (method: ConsoleLog['method']) => {
    switch (method) {
      case 'error': return 'bg-destructive/20 text-destructive';
      case 'warn': return 'bg-yellow-500/20 text-yellow-500';
      case 'info': return 'bg-blue-500/20 text-blue-400';
      case 'debug': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-foreground';
    }
  };
  
  if (!isOpen) {
    // Show floating toggle button
    return (
      <button
        onClick={() => { hapticFeedback('medium'); onToggle(); }}
        className={cn(
          "fixed bottom-20 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full",
          "bg-card border border-border shadow-lg touch-manipulation",
          "transition-all duration-200 active:scale-95"
        )}
      >
        <Terminal className="h-4 w-4" />
        <span className="text-xs font-medium">Console</span>
        {logs.length > 0 && (
          <span className="flex items-center gap-1 ml-1">
            {errorCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {errorCount}
              </span>
            )}
            {warnCount > 0 && (
              <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {warnCount}
              </span>
            )}
            {errorCount === 0 && warnCount === 0 && (
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {logs.length}
              </span>
            )}
          </span>
        )}
      </button>
    );
  }
  
  return (
    <div 
      className={cn(
        "fixed left-0 right-0 z-40 bg-card border-t border-border",
        "transition-all duration-300 ease-out",
        isExpanded ? "bottom-0 top-[30%]" : "bottom-0 h-[200px]"
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Console</span>
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({logs.length} {logs.length === 1 ? 'entry' : 'entries'})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleExpand}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Log entries */}
      <ScrollArea className="h-[calc(100%-44px)]" ref={scrollRef}>
        <div className="p-2 space-y-1 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground">
              No console output yet
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-2 p-1.5 rounded",
                  log.method === 'error' && "bg-destructive/10",
                  log.method === 'warn' && "bg-yellow-500/10"
                )}
              >
                <span className={cn(
                  "shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                  getMethodBadge(log.method)
                )}>
                  {log.method}
                </span>
                <span className={cn(
                  "flex-1 break-all whitespace-pre-wrap",
                  getMethodColor(log.method)
                )}>
                  {log.data}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
});
