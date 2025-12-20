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
      {/* Primary cyan gradient orb - follows mouse */}
      <div 
        className="absolute w-[900px] h-[900px] rounded-full opacity-25 blur-[140px]"
        style={{ 
          background: 'radial-gradient(circle, hsl(185 100% 50%) 0%, hsl(195 100% 40% / 0.5) 40%, transparent 70%)',
          left: 'calc(var(--gradient-x) - 450px)',
          top: 'calc(var(--gradient-y) - 450px)',
          transition: 'left 0.6s ease-out, top 0.6s ease-out',
        }}
      />
      
      {/* Secondary cyan pulse orb - top right */}
      <div 
        className="absolute top-[10%] right-[5%] w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
        style={{ 
          background: 'radial-gradient(circle, hsl(185 100% 50%) 0%, hsl(190 100% 45% / 0.6) 35%, transparent 70%)',
          animation: 'pulse-orb 5s ease-in-out infinite',
        }}
      />
      
      {/* Tertiary deep teal orb - bottom left */}
      <div 
        className="absolute -bottom-[15%] left-[10%] w-[700px] h-[700px] rounded-full opacity-15 blur-[120px]"
        style={{ 
          background: 'radial-gradient(circle, hsl(195 80% 40%) 0%, hsl(200 70% 35% / 0.4) 40%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite',
        }}
      />
      
      {/* Accent glow - center bottom */}
      <div 
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-10 blur-[80px]"
        style={{ 
          background: 'radial-gradient(ellipse, hsl(185 100% 55%) 0%, transparent 70%)',
          animation: 'breathe 6s ease-in-out infinite',
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Cyan shimmer sweep */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, transparent 35%, hsl(185 100% 50% / 0.04) 50%, transparent 65%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 10s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% 200%; }
          50% { background-position: 0% 0%; }
        }
        @keyframes pulse-orb {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.18; }
        }
      `}</style>
    </div>
  );
}
