import { cn } from '@/lib/utils';

interface HeroSkeletonProps {
  className?: string;
}

export function HeroSkeleton({ className }: HeroSkeletonProps) {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center", className)}>
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, hsl(var(--primary) / 0.08) 0%, transparent 50%), linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(195 100% 3%) 100%)'
        }}
      />
      
      {/* Animated grid skeleton */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-pulse">
          {/* Horizon line */}
          <div 
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            style={{ top: '60%' }}
          />
          
          {/* Perspective grid lines - horizontal */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              style={{ 
                top: `${60 + (i + 1) * 5}%`,
                opacity: 1 - i * 0.1,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
          
          {/* Perspective grid lines - vertical (converging) */}
          {[...Array(12)].map((_, i) => {
            const offset = (i - 5.5) * 8;
            return (
              <div
                key={`v-${i}`}
                className="absolute w-px bg-gradient-to-b from-primary/5 via-primary/10 to-transparent"
                style={{
                  left: '50%',
                  top: '60%',
                  height: '40%',
                  transform: `translateX(${offset}%) skewX(${-offset * 0.8}deg)`,
                  opacity: 0.5 - Math.abs(offset) * 0.02,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            );
          })}
        </div>
        
        {/* Floating particles skeleton */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={`p-${i}`}
              className="absolute rounded-full bg-primary/20 animate-pulse"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${10 + Math.random() * 80}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Loading indicator */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">
          Initializing
        </span>
      </div>
    </div>
  );
}
