import { memo } from 'react';

interface TerminalCursorsProps {
  fastParallax: number;
}

export const TerminalCursors = memo(function TerminalCursors({ fastParallax }: TerminalCursorsProps) {
  return (
    <>
      {/* Terminal cursor blink effect - Extreme front layer (Z: +150px) */}
      <div 
        className="absolute top-[18%] right-[22%] flex items-center gap-1 opacity-50"
        style={{ 
          transform: `translateZ(150px) translateY(${fastParallax * 0.6}px) scale(0.88)`,
        }}
      >
        <span className="font-mono text-primary text-xl drop-shadow-[0_0_12px_hsl(var(--primary)/0.7)]">&gt;_</span>
        <span 
          className="w-2.5 h-6 bg-primary animate-pulse shadow-[0_0_15px_hsl(var(--primary)/0.6)]" 
          style={{ animationDuration: '1s' }} 
        />
      </div>

      {/* Additional floating holographic cursor - Front layer */}
      <div 
        className="absolute bottom-[25%] left-[15%] flex items-center gap-1 opacity-35 motion-reduce:hidden"
        style={{ 
          transform: `translateZ(120px) translateY(${fastParallax * 0.55}px) scale(0.9)`,
        }}
      >
        <span className="font-mono text-accent text-lg drop-shadow-[0_0_10px_hsl(185_80%_65%/0.6)]">$</span>
        <span 
          className="w-2 h-5 bg-accent animate-pulse shadow-[0_0_12px_hsl(185_80%_65%/0.5)]" 
          style={{ animationDuration: '1.2s', animationDelay: '0.5s' }} 
        />
      </div>
    </>
  );
});
