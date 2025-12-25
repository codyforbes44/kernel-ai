import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEFAULT_MESSAGES = [
  'Kernel is thinking',
  'Processing your request',
  'Analyzing context',
  'Crafting solution',
];

const DATABASE_MESSAGES = [
  'Analyzing schema requirements',
  'Designing database structure',
  'Generating migrations',
  'Optimizing relationships',
];

const UI_MESSAGES = [
  'Designing components',
  'Styling elements',
  'Building layout',
  'Polishing interface',
];

const CODE_MESSAGES = [
  'Analyzing codebase',
  'Reviewing patterns',
  'Generating code',
  'Optimizing solution',
];

const FIX_MESSAGES = [
  'Analyzing errors',
  'Identifying root cause',
  'Generating fix',
  'Validating solution',
];

const API_MESSAGES = [
  'Designing endpoints',
  'Structuring API',
  'Generating handlers',
  'Setting up routes',
];

interface KernelThinkingIndicatorProps {
  prompt?: string;
  onCancel?: () => void;
}

function getContextualMessages(prompt?: string): string[] {
  if (!prompt) return DEFAULT_MESSAGES;
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Database/schema related
  if (
    lowerPrompt.includes('database') ||
    lowerPrompt.includes('schema') ||
    lowerPrompt.includes('table') ||
    lowerPrompt.includes('migration') ||
    lowerPrompt.includes('supabase')
  ) {
    return DATABASE_MESSAGES;
  }
  
  // UI/styling related
  if (
    lowerPrompt.includes('button') ||
    lowerPrompt.includes('component') ||
    lowerPrompt.includes('style') ||
    lowerPrompt.includes('design') ||
    lowerPrompt.includes('layout') ||
    lowerPrompt.includes('ui') ||
    lowerPrompt.includes('page')
  ) {
    return UI_MESSAGES;
  }
  
  // Fix/debug related
  if (
    lowerPrompt.includes('fix') ||
    lowerPrompt.includes('error') ||
    lowerPrompt.includes('bug') ||
    lowerPrompt.includes('debug') ||
    lowerPrompt.includes('issue')
  ) {
    return FIX_MESSAGES;
  }
  
  // API related
  if (
    lowerPrompt.includes('api') ||
    lowerPrompt.includes('endpoint') ||
    lowerPrompt.includes('function') ||
    lowerPrompt.includes('edge')
  ) {
    return API_MESSAGES;
  }
  
  // Code-related (general)
  if (
    lowerPrompt.includes('code') ||
    lowerPrompt.includes('implement') ||
    lowerPrompt.includes('create') ||
    lowerPrompt.includes('add') ||
    lowerPrompt.includes('build')
  ) {
    return CODE_MESSAGES;
  }
  
  return DEFAULT_MESSAGES;
}

// Pulsing orb component for 2100-era visual
function ThinkingOrb() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.2, 0.5]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ width: 24, height: 24 }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/30"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.6, 0.3, 0.6]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3
        }}
        style={{ width: 24, height: 24 }}
      />
      
      {/* Core orb */}
      <motion.div
        className="relative w-6 h-6 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg"
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          boxShadow: '0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)'
        }}
      >
        <Brain className="h-3.5 w-3.5 text-primary-foreground" />
        
        {/* Sparkle effect */}
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-2.5 w-2.5 text-primary" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Streaming text effect for message transitions
function StreamingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsStreaming(true);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 30); // 30ms per character for smooth streaming

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="relative">
      {displayedText}
      {isStreaming && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  );
}

// Progress ring component
function ProgressRing({ progress, size = 32 }: { progress: number; size?: number }) {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

export function KernelThinkingIndicator({ prompt, onCancel }: KernelThinkingIndicatorProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = useMemo(() => getContextualMessages(prompt), [prompt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMessageIndex(0);
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Calculate progress as percentage of typical response time (30s = 100%)
  const progressPercent = Math.min((elapsedSeconds / 30) * 100, 100);

  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Animated orb */}
      <ThinkingOrb />
      
      {/* Streaming message text */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-muted-foreground"
          >
            <StreamingText text={messages[messageIndex]} />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Progress ring with time */}
      {elapsedSeconds >= 3 && (
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative flex items-center justify-center">
            <ProgressRing progress={progressPercent} size={28} />
            <span className="absolute text-[9px] font-medium text-muted-foreground">
              {formatTime(elapsedSeconds).replace('s', '').replace('m ', ':')}
            </span>
          </div>
        </motion.div>
      )}

      {/* Cancel button */}
      {onCancel && elapsedSeconds >= 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
