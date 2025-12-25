import { useEffect, useRef, useState } from 'react';
import { GradientMesh } from './GradientMesh';
import { ParticleField } from './ParticleField';
import { AnimatedCodeBlocks } from './AnimatedCodeBlocks';
import { StarConstellation } from './StarConstellation';

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Parallax effect on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = (clientX / innerWidth - 0.5) * 20;
      const yPercent = (clientY / innerHeight - 0.5) * 20;
      
      container.style.setProperty('--mouse-x', `${xPercent}px`);
      container.style.setProperty('--mouse-y', `${yPercent}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate parallax transforms for different layers
  const slowParallax = scrollY * 0.3;
  const mediumParallax = scrollY * 0.5;
  const fastParallax = scrollY * 0.7;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        '--mouse-x': '0px', 
        '--mouse-y': '0px',
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      } as React.CSSProperties}
    >
      {/* 3D Depth Container */}
      <div className="absolute inset-0 preserve-3d">
        
        {/* Northern lights aurora effect - Far depth layer */}
        <div 
          className="absolute inset-x-0 top-0 h-[45%] overflow-hidden motion-reduce:hidden"
          style={{ transform: `translateZ(-150px) translateY(${slowParallax}px) scale(1.15)` }}
        >
          {/* Aurora layer 1 - green/cyan */}
          <div 
            className="absolute inset-x-0 top-0 h-full opacity-25"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, hsl(160 80% 45% / 0.35) 20%, hsl(175 70% 40% / 0.25) 40%, transparent 70%)',
              animation: 'auroraWave1 12s ease-in-out infinite',
              filter: 'blur(40px)',
            }}
          />
          {/* Aurora layer 2 - purple/pink */}
          <div 
            className="absolute inset-x-0 top-0 h-full opacity-20"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, hsl(280 60% 50% / 0.3) 15%, hsl(200 70% 45% / 0.25) 35%, transparent 60%)',
              animation: 'auroraWave2 15s ease-in-out infinite 2s',
              filter: 'blur(50px)',
            }}
          />
          {/* Aurora layer 3 - shifting curtain */}
          <div 
            className="absolute inset-x-0 top-0 h-full opacity-15"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, hsl(140 70% 50% / 0.35) 25%, hsl(185 80% 45% / 0.3) 50%, hsl(260 60% 55% / 0.25) 75%, transparent 100%)',
              animation: 'auroraShift 20s ease-in-out infinite 1s',
              filter: 'blur(35px)',
            }}
          />
        </div>

        {/* Base gradient mesh - Far layer with depth */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(-120px) translateY(${slowParallax}px) scale(1.12)`,
          }}
        >
          <GradientMesh />
        </div>

        {/* Particle system - Mid depth layer */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(-60px) translateY(${mediumParallax * 0.5}px) scale(1.06)`,
          }}
        >
          <ParticleField />
        </div>

        {/* Star constellations - Mid-near layer */}
        <div style={{ transform: `translateZ(-30px) scale(1.03)` }}>
          <StarConstellation scrollY={scrollY} />
        </div>

        {/* Animated code blocks - Near layer */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(0px) translateY(${fastParallax * 0.3}px)`,
          }}
        >
          <AnimatedCodeBlocks />
        </div>

        {/* Terminal cursor blink effect - Front layer */}
        <div 
          className="absolute top-[20%] right-[25%] flex items-center gap-1 opacity-40"
          style={{ 
            transform: `translateZ(30px) translateY(${fastParallax * 0.5}px)`,
          }}
        >
          <span className="font-mono text-primary text-lg drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]">&gt;_</span>
          <span className="w-2 h-5 bg-primary animate-pulse shadow-[0_0_10px_hsl(var(--primary)/0.5)]" style={{ animationDuration: '1s' }} />
        </div>

      </div>

      {/* Grid pattern overlay - stationary */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Radial vignette - stationary */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)',
          opacity: 0.4,
        }}
      />
    </div>
  );
}
