import { Brain } from 'lucide-react';

export function KernelThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="relative">
        <Brain className="h-4 w-4 text-primary animate-pulse" />
        <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded-full blur-md animate-pulse" />
      </div>
      
      <span className="text-muted-foreground text-sm">Kernel is thinking</span>
      
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
