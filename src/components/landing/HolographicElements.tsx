import { useMemo } from 'react';

interface HoloPanel {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  delay: number;
  variant: 'panel' | 'graph' | 'hexagon' | 'data';
}

export function HolographicElements() {
  const panels = useMemo<HoloPanel[]>(() => [
    { id: 1, x: 8, y: 25, width: 80, height: 50, rotation: -8, delay: 0, variant: 'panel' },
    { id: 2, x: 85, y: 40, width: 70, height: 45, rotation: 12, delay: 2, variant: 'graph' },
    { id: 3, x: 12, y: 70, width: 60, height: 60, rotation: 5, delay: 1, variant: 'hexagon' },
    { id: 4, x: 78, y: 75, width: 75, height: 40, rotation: -5, delay: 3, variant: 'data' },
    { id: 5, x: 50, y: 15, width: 90, height: 35, rotation: 3, delay: 1.5, variant: 'panel' },
  ], []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {panels.map((panel) => (
        <HoloFragment key={panel.id} panel={panel} />
      ))}
    </div>
  );
}

function HoloFragment({ panel }: { panel: HoloPanel }) {
  const baseStyle = {
    left: `${panel.x}%`,
    top: `${panel.y}%`,
    width: panel.width,
    height: panel.height,
    transform: `translate(-50%, -50%) rotate(${panel.rotation}deg)`,
    animationDelay: `${panel.delay}s`,
  };

  if (panel.variant === 'hexagon') {
    return (
      <div
        className="absolute"
        style={{
          ...baseStyle,
          animation: 'holoFloat 8s ease-in-out infinite, holoGlow 4s ease-in-out infinite alternate',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
          <defs>
            <linearGradient id={`holo-hex-${panel.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(185 80% 65%)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <polygon 
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
            fill="none"
            stroke={`url(#holo-hex-${panel.id})`}
            strokeWidth="0.5"
            className="animate-[holoRotate_20s_linear_infinite]"
            style={{ transformOrigin: 'center' }}
          />
          <polygon 
            points="50,20 80,35 80,65 50,80 20,65 20,35" 
            fill="none"
            stroke="hsl(var(--primary) / 0.3)"
            strokeWidth="0.3"
            className="animate-[holoRotate_15s_linear_infinite_reverse]"
            style={{ transformOrigin: 'center' }}
          />
        </svg>
      </div>
    );
  }

  if (panel.variant === 'graph') {
    return (
      <div
        className="absolute rounded-sm overflow-hidden"
        style={{
          ...baseStyle,
          background: 'hsl(var(--background) / 0.3)',
          border: '1px solid hsl(var(--primary) / 0.15)',
          backdropFilter: 'blur(4px)',
          animation: 'holoFloat 10s ease-in-out infinite, holoGlow 5s ease-in-out infinite alternate',
        }}
      >
        <div className="absolute inset-0 opacity-25">
          {/* Scanlines */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.1) 2px, hsl(var(--primary) / 0.1) 3px)',
              animation: 'scanlineMove 3s linear infinite',
            }}
          />
          {/* Mini bar chart */}
          <div className="absolute bottom-1 left-1 right-1 h-[60%] flex items-end gap-0.5">
            {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.75].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-primary/40 to-accent/30 rounded-t-sm"
                style={{
                  height: `${h * 100}%`,
                  animation: `barPulse 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (panel.variant === 'data') {
    return (
      <div
        className="absolute rounded-sm overflow-hidden"
        style={{
          ...baseStyle,
          background: 'hsl(var(--background) / 0.25)',
          border: '1px solid hsl(185 80% 65% / 0.12)',
          backdropFilter: 'blur(3px)',
          animation: 'holoFloat 12s ease-in-out infinite, holoGlow 6s ease-in-out infinite alternate',
        }}
      >
        <div className="absolute inset-0 p-1.5 opacity-30">
          {/* Data lines */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 mb-1 rounded-full overflow-hidden"
              style={{ background: 'hsl(var(--foreground) / 0.1)' }}
            >
              <div
                className="h-full bg-gradient-to-r from-primary/50 to-accent/40 rounded-full"
                style={{
                  width: `${30 + Math.random() * 60}%`,
                  animation: `dataFlow 3s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default panel variant
  return (
    <div
      className="absolute rounded-sm"
      style={{
        ...baseStyle,
        background: 'hsl(var(--background) / 0.2)',
        border: '1px solid hsl(var(--primary) / 0.1)',
        backdropFilter: 'blur(2px)',
        boxShadow: '0 0 20px hsl(var(--primary) / 0.05), inset 0 0 20px hsl(var(--primary) / 0.03)',
        animation: 'holoFloat 9s ease-in-out infinite, holoGlow 4.5s ease-in-out infinite alternate',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/30" />
      
      {/* Scanlines */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(var(--primary) / 0.08) 3px, hsl(var(--primary) / 0.08) 4px)',
        }}
      />
    </div>
  );
}
