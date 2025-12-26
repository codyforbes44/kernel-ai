import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

interface TranscriptEntryProps {
  role: 'user' | 'agent';
  text: string;
  showCopyButton?: boolean;
  compact?: boolean;
}

export function TranscriptEntry({ 
  role, 
  text, 
  showCopyButton = true,
  compact = false,
}: TranscriptEntryProps) {
  const { copied, copy } = useClipboard({ resetDelay: 1500 });

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(text, 'Response copied!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative rounded-lg touch-manipulation",
        compact ? "p-2" : "p-3",
        role === 'agent' 
          ? "bg-primary/10 text-foreground" 
          : "bg-muted text-muted-foreground ml-4"
      )}
    >
      {/* Role label */}
      <span className={cn(
        "font-medium uppercase tracking-wider opacity-60",
        compact ? "text-[10px]" : "text-xs"
      )}>
        {role === 'agent' ? 'Kernel' : 'You'}
      </span>
      
      {/* Message text - selectable */}
      <p className={cn(
        "mt-0.5 select-text",
        compact ? "text-xs" : "text-sm"
      )}>
        {text}
      </p>

      {/* Copy button - always visible on mobile, hover on desktop */}
      {showCopyButton && role === 'agent' && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity",
            "bg-background/80 hover:bg-background"
          )}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </motion.div>
  );
}
