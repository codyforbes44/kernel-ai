import { useEffect, useRef } from 'react';

export function GradientMesh() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = clientX / innerWidth;
      const yPercent = clientY / innerHeight;
      
      container.style.setProperty('--gradient-x', `${xPercent * 100}%`);
      container.style.setProperty('--gradient-y', `${yPercent * 100}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        '--gradient-x': '50%', 
        '--gradient-y': '50%' 
      } as React.CSSProperties}
    >
      {/* Primary gradient orb */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
          left: 'calc(var(--gradient-x) - 400px)',
          top: 'calc(var(--gradient-y) - 400px)',
          transition: 'left 0.5s ease-out, top 0.5s ease-out',
        }}
      />
      
      {/* Secondary accent orb */}
      <div 
        className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-[100px] animate-pulse"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.8) 0%, transparent 70%)',
          animationDuration: '4s',
        }}
      />
      
      {/* Tertiary subtle orb */}
      <div 
        className="absolute -bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[80px]"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--accent-foreground) / 0.5) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Shimmer effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, hsl(var(--primary) / 0.03) 50%, transparent 60%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 8s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% 200%; }
          50% { background-position: 0% 0%; }
        }
      `}</style>
    </div>
  );
}
