import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X, Sparkles, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CapturedError {
  id: string;
  type: 'build' | 'runtime' | 'typescript' | 'lint';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  timestamp: Date;
}

interface ErrorCaptureProps {
  onErrorsChange: (errors: CapturedError[]) => void;
  onTryToFix: (errors: CapturedError[]) => void;
  isFixing?: boolean;
}

// Parse Sandpack error messages
function parseError(errorEvent: MessageEvent): CapturedError | null {
  const data = errorEvent.data;
  
  if (!data) return null;
  
  // Handle Sandpack-specific error formats
  if (data.type === 'console' && data.log) {
    const log = data.log;
    if (log.method === 'error') {
      const message = Array.isArray(log.data) ? log.data.join(' ') : String(log.data);
      
      // Skip React DevTools messages
      if (message.includes('Download the React DevTools')) return null;
      
      return {
        id: crypto.randomUUID(),
        type: 'runtime',
        message,
        timestamp: new Date(),
      };
    }
  }
  
  // Handle compile errors
  if (data.type === 'compile' && data.status === 'error') {
    const errors = data.errors || [];
    if (errors.length > 0) {
      const error = errors[0];
      return {
        id: crypto.randomUUID(),
        type: 'build',
        message: error.message || 'Build error',
        file: error.path || error.fileName,
        line: error.line,
        column: error.column,
        timestamp: new Date(),
      };
    }
  }
  
  // Handle action errors from Sandpack
  if (data.type === 'action' && data.action === 'show-error') {
    return {
      id: crypto.randomUUID(),
      type: 'runtime',
      message: data.message || 'Runtime error',
      stack: data.stack,
      timestamp: new Date(),
    };
  }

  // Parse TypeScript errors from console
  if (typeof data === 'string' && data.includes('TypeScript')) {
    const match = data.match(/(.+?)\((\d+),(\d+)\):\s*(.+)/);
    if (match) {
      return {
        id: crypto.randomUUID(),
        type: 'typescript',
        message: match[4],
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        timestamp: new Date(),
      };
    }
  }
  
  return null;
}

export function ErrorCapture({ onErrorsChange, onTryToFix, isFixing }: ErrorCaptureProps) {
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());

  // Listen for Sandpack iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from Sandpack iframes
      if (!event.origin.includes('sandpack') && !event.origin.includes('codesandbox')) {
        // Still try to parse - might be from embedded iframe
      }
      
      const parsedError = parseError(event);
      if (parsedError) {
        setErrors(prev => {
          // Deduplicate by message
          const isDuplicate = prev.some(e => e.message === parsedError.message);
          if (isDuplicate) return prev;
          
          // Keep last 10 errors
          const newErrors = [...prev, parsedError].slice(-10);
          return newErrors;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Notify parent of error changes
  useEffect(() => {
    onErrorsChange(errors);
  }, [errors, onErrorsChange]);

  // Also listen for console errors in the main window (for development)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      originalError.apply(console, args);
      
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      // Skip React DevTools and internal errors
      if (message.includes('Download the React DevTools')) return;
      if (message.includes('Warning:')) return;
      
      // Check if it's a relevant error
      if (message.includes('Error') || message.includes('failed') || message.includes('Cannot')) {
        setErrors(prev => {
          const isDuplicate = prev.some(e => e.message === message);
          if (isDuplicate) return prev;
          
          return [...prev, {
            id: crypto.randomUUID(),
            type: 'runtime' as const,
            message,
            timestamp: new Date(),
          }].slice(-10);
        });
      }
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
    setSelectedErrors(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setSelectedErrors(new Set());
  }, []);

  const toggleErrorSelection = useCallback((id: string) => {
    setSelectedErrors(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleTryToFix = useCallback(() => {
    const errorsToFix = selectedErrors.size > 0
      ? errors.filter(e => selectedErrors.has(e.id))
      : errors;
    onTryToFix(errorsToFix);
  }, [errors, selectedErrors, onTryToFix]);

  const getErrorTypeColor = (type: CapturedError['type']) => {
    switch (type) {
      case 'build': return 'bg-destructive/20 text-destructive';
      case 'runtime': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400';
      case 'typescript': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'lint': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-destructive/30 bg-destructive/5">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-destructive/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            {errors.length} Error{errors.length !== 1 ? 's' : ''} Detected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              handleTryToFix();
            }}
            disabled={isFixing}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isFixing ? 'Fixing...' : 'Try to Fix'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              clearAllErrors();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Error List */}
      {isExpanded && (
        <ScrollArea className="max-h-48">
          <div className="px-3 pb-3 space-y-2">
            {errors.map(error => (
              <div
                key={error.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-md border transition-colors cursor-pointer",
                  selectedErrors.has(error.id) 
                    ? "border-primary bg-primary/5" 
                    : "border-border/50 hover:border-border"
                )}
                onClick={() => toggleErrorSelection(error.id)}
              >
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", getErrorTypeColor(error.type))}>
                      {error.type}
                    </Badge>
                    {error.file && (
                      <span className="text-xs text-muted-foreground font-mono truncate">
                        {error.file}{error.line ? `:${error.line}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground break-words">
                    {error.message.length > 200 
                      ? error.message.slice(0, 200) + '...' 
                      : error.message
                    }
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearError(error.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
