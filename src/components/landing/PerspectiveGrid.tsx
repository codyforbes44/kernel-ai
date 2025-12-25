import { memo } from 'react';

export const PerspectiveGrid = memo(function PerspectiveGrid() {
  return (
    <>
      {/* Perspective grid overlay - Tron-style */}
      <div 
        className="absolute inset-0 overflow-hidden motion-reduce:hidden"
        style={{
          perspective: '600px',
          perspectiveOrigin: '50% 100%',
        }}
      >
        <div 
          className="absolute inset-x-0 bottom-0 h-[60%] opacity-[0.04]"
          style={{
            background: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 59px,
                hsl(var(--primary) / 0.8) 59px,
                hsl(var(--primary) / 0.8) 60px
              ),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 59px,
                hsl(var(--primary) / 0.6) 59px,
                hsl(var(--primary) / 0.6) 60px
              )
            `,
            backgroundSize: '60px 60px',
            transform: 'rotateX(75deg) translateZ(-100px)',
            transformOrigin: 'center bottom',
            animation: 'gridFlow 20s linear infinite',
          }}
        />
      </div>

      {/* Grid pattern overlay - stationary */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Radial vignette - enhanced for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, hsl(var(--background) / 0.3) 50%, hsl(var(--background)) 100%)',
          opacity: 0.5,
        }}
      />

      {/* Edge depth fade - creates tunnel effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 200px 50px hsl(var(--background))',
        }}
      />
    </>
  );
});
