import { useEffect, useRef, useState } from 'react';
import { GradientMesh } from './GradientMesh';
import { ParticleField } from './ParticleField';
import { AnimatedCodeBlocks } from './AnimatedCodeBlocks';
import { StarConstellation } from './StarConstellation';
import { HolographicElements } from './HolographicElements';
import { CosmicBackground } from './CosmicBackground';

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Enhanced parallax effect on mouse move - 2044 level reactivity
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Increased from 20px to 50px for dramatic depth feel
      const xPercent = (clientX / innerWidth - 0.5) * 50;
      const yPercent = (clientY / innerHeight - 0.5) * 50;
      
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

  // Enhanced parallax multipliers for extreme depth separation
  const slowParallax = scrollY * 0.5;
  const mediumParallax = scrollY * 0.8;
  const fastParallax = scrollY * 1.2;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        '--mouse-x': '0px', 
        '--mouse-y': '0px',
        // Reduced perspective from 1200px to 800px for more dramatic depth distortion
        perspective: '800px',
        perspectiveOrigin: '50% 50%',
      } as React.CSSProperties}
    >
      {/* 3D Depth Container - Extreme Futuristic Layers */}
      <div className="absolute inset-0 preserve-3d">
        
        {/* LAYER 1: Cosmic deep space background - Deepest layer (Z: -400px) */}
        <div 
          className="absolute inset-0 motion-reduce:hidden"
          style={{ 
            transform: `translateZ(-400px) translateY(${slowParallax * 0.3}px) scale(1.5)`,
          }}
        >
          <CosmicBackground />
        </div>

        {/* LAYER 2: Northern lights aurora effect - Far depth layer (Z: -300px) */}
        <div 
          className="absolute inset-x-0 top-0 h-[50%] overflow-hidden motion-reduce:hidden"
          style={{ transform: `translateZ(-300px) translateY(${slowParallax * 0.4}px) scale(1.4)` }}
        >
          {/* Aurora layer 1 - green/cyan */}
          <div 
            className="absolute inset-x-0 top-0 h-full opacity-30"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, hsl(160 80% 45% / 0.4) 20%, hsl(175 70% 40% / 0.3) 40%, transparent 70%)',
              animation: 'auroraWave1 12s ease-in-out infinite',
              filter: 'blur(50px)',
            }}
          />
          {/* Aurora layer 2 - purple/pink */}
          <div 
            className="absolute inset-x-0 top-0 h-full opacity-25"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, hsl(280 60% 50% / 0.35) 15%, hsl(200 70% 45% / 0.3) 35%, transparent 60%)',
              animation: 'auroraWave2 15s ease-in-out infinite 2s',
              filter: 'blur(60px)',
            }}
          />
          {/* Aurora layer 3 - shifting curtain */}
          <div 
            className="absolute inset-x-0 top-0 h-full opacity-20"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, hsl(140 70% 50% / 0.4) 25%, hsl(185 80% 45% / 0.35) 50%, hsl(260 60% 55% / 0.3) 75%, transparent 100%)',
              animation: 'auroraShift 20s ease-in-out infinite 1s',
              filter: 'blur(45px)',
            }}
          />
        </div>

        {/* LAYER 3: Base gradient mesh - Deep layer (Z: -250px) */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(-250px) translateY(${slowParallax * 0.5}px) scale(1.35)`,
          }}
        >
          <GradientMesh />
        </div>

        {/* LAYER 4: Particle system - Mid depth layer (Z: -150px) */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(-150px) translateY(${mediumParallax * 0.4}px) scale(1.2)`,
          }}
        >
          <ParticleField />
        </div>

        {/* LAYER 5: Star constellations - Mid-near layer (Z: -80px) */}
        <div 
          className="absolute inset-0"
          style={{ transform: `translateZ(-80px) scale(1.1)` }}
        >
          <StarConstellation scrollY={scrollY} />
        </div>

        {/* LAYER 6: Animated code blocks - Near layer (Z: -30px to +30px, animated) */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(-30px) translateY(${fastParallax * 0.3}px) scale(1.04)`,
          }}
        >
          <AnimatedCodeBlocks />
        </div>

        {/* LAYER 7: Holographic UI Elements - Front floating layer (Z: +80px) */}
        <div 
          className="absolute inset-0 motion-reduce:hidden"
          style={{ 
            transform: `translateZ(80px) translateY(${fastParallax * 0.5}px) scale(0.92)`,
          }}
        >
          <HolographicElements />
        </div>

        {/* LAYER 8: Terminal cursor blink effect - Extreme front layer (Z: +150px) */}
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

      </div>

      {/* Perspective grid overlay - Tron-style (Z: -200px simulated via opacity) */}
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
    </div>
  );
}
