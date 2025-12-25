import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

const STATUS_MESSAGES = [
  'Kernel is thinking',
  'Analyzing your request',
  'Reviewing files',
  'Generating code',
  'Processing context',
  'Crafting solution',
];

export function KernelThinkingIndicator() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
        {STATUS_MESSAGES[messageIndex]}
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
