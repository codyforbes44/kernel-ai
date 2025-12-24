import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X, Sparkles, ChevronUp, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/hooks/useHaptic';
import type { CapturedError } from '../ErrorCapture';

interface MobileErrorCaptureProps {
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

export function MobileErrorCapture({ onErrorsChange, onTryToFix, isFixing }: MobileErrorCaptureProps) {
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());

  // Listen for Sandpack iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const parsedError = parseError(event);
      if (parsedError) {
        hapticFeedback('warning');
        setErrors(prev => {
          const isDuplicate = prev.some(e => e.message === parsedError.message);
          if (isDuplicate) return prev;
          return [...prev, parsedError].slice(-10);
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

  // Also listen for console errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      originalError.apply(console, args);
      
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (message.includes('Download the React DevTools')) return;
      if (message.includes('Warning:')) return;
      
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
    setIsDrawerOpen(false);
  }, []);

  const toggleErrorSelection = useCallback((id: string) => {
    hapticFeedback('light');
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
    hapticFeedback('medium');
    const errorsToFix = selectedErrors.size > 0
      ? errors.filter(e => selectedErrors.has(e.id))
      : errors;
    onTryToFix(errorsToFix);
    setIsDrawerOpen(false);
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
    <>
      {/* Floating Error Badge */}
      <button
        onClick={() => { hapticFeedback('medium'); setIsDrawerOpen(true); }}
        className="fixed bottom-24 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-destructive text-destructive-foreground shadow-lg touch-manipulation animate-in slide-in-from-left-2"
      >
        <Bug className="h-4 w-4" />
        <span className="text-sm font-medium">
          {errors.length} Error{errors.length !== 1 ? 's' : ''}
        </span>
        <ChevronUp className="h-4 w-4" />
      </button>

      {/* Error Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-destructive" />
                <span>{errors.length} Error{errors.length !== 1 ? 's' : ''} Detected</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllErrors}
                className="h-8 text-muted-foreground"
              >
                Clear All
              </Button>
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-4">
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-2">
                {errors.map(error => (
                  <div
                    key={error.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors touch-manipulation",
                      selectedErrors.has(error.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-border/50 bg-muted/30"
                    )}
                    onClick={() => toggleErrorSelection(error.id)}
                  >
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-destructive" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs px-2 py-0.5", getErrorTypeColor(error.type))}
                        >
                          {error.type}
                        </Badge>
                        {error.file && (
                          <span className="text-xs text-muted-foreground font-mono truncate">
                            {error.file}{error.line ? `:${error.line}` : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground break-words leading-relaxed">
                        {error.message.length > 150 
                          ? error.message.slice(0, 150) + '...' 
                          : error.message
                        }
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation();
                        hapticFeedback('light');
                        clearError(error.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DrawerFooter className="pt-2">
            <Button
              onClick={handleTryToFix}
              className="w-full h-12 text-base touch-manipulation"
              disabled={isFixing}
            >
              {isFixing ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
                  Fixing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  {selectedErrors.size > 0 
                    ? `Fix ${selectedErrors.size} Selected Error${selectedErrors.size !== 1 ? 's' : ''}`
                    : 'Fix All Errors'
                  }
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Tap errors to select specific ones to fix
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
