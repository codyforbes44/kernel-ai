import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface LiveTranscriptProps {
  entries: TranscriptEntry[];
  isListening: boolean;
  companionName: string;
  className?: string;
  maxHeight?: number;
}

export function LiveTranscript({
  entries,
  isListening,
  companionName,
  className,
  maxHeight = 200,
}: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <ScrollArea 
      className={cn("w-full rounded-lg", className)}
      style={{ maxHeight }}
    >
      <div ref={scrollRef} className="space-y-2 p-2">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex gap-2 p-2 rounded-lg text-sm",
                entry.role === 'user' 
                  ? "bg-primary/10" 
                  : "bg-muted"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                entry.role === 'user' ? "bg-primary/20" : "bg-muted-foreground/20"
              )}>
                {entry.role === 'user' ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Bot className="h-3 w-3" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {entry.role === 'user' ? 'You' : companionName}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {entry.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                
                <p className="text-foreground break-words">
                  {entry.text}
                  {entry.isStreaming && (
                    <motion.span
                      className="inline-block w-1.5 h-4 ml-0.5 bg-primary rounded-sm"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Listening indicator */}
        <AnimatePresence>
          {isListening && entries.length > 0 && entries[entries.length - 1].role !== 'user' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Listening...</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {entries.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Start speaking to see the transcript
          </div>
        )}
      </div>
    </ScrollArea>
  );
}