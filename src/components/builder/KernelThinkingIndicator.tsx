import { useState, useEffect, useMemo } from 'react';
import { Brain } from 'lucide-react';

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

export function KernelThinkingIndicator({ prompt }: KernelThinkingIndicatorProps) {
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

  return (
    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="relative">
        <Brain className="h-4 w-4 text-primary animate-pulse" />
        <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded-full blur-md animate-pulse" />
      </div>
      
      <span 
        key={messageIndex}
        className="text-muted-foreground text-sm animate-in fade-in duration-300"
      >
        {messages[messageIndex]}
      </span>
      
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      {elapsedSeconds >= 3 && (
        <span className="text-xs text-muted-foreground/50 animate-in fade-in duration-300">
          {formatTime(elapsedSeconds)}
        </span>
      )}
    </div>
  );
}
