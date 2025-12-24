import { useEffect, useRef, useState } from 'react';
import { GradientMesh } from './GradientMesh';
import { ParticleField } from './ParticleField';
import { AnimatedCodeBlocks } from './AnimatedCodeBlocks';
import { Snowfall } from './Snowfall';

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
      } as React.CSSProperties}
    >
      {/* Northern lights aurora effect */}
      <div className="absolute inset-x-0 top-0 h-[45%] overflow-hidden motion-reduce:hidden">
        {/* Aurora layer 1 - green/cyan */}
        <div 
          className="absolute inset-x-0 top-0 h-full opacity-20"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, hsl(160 80% 45% / 0.3) 20%, hsl(175 70% 40% / 0.2) 40%, transparent 70%)',
            animation: 'auroraWave1 12s ease-in-out infinite',
            filter: 'blur(40px)',
          }}
        />
        {/* Aurora layer 2 - purple/pink */}
        <div 
          className="absolute inset-x-0 top-0 h-full opacity-15"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, hsl(280 60% 50% / 0.25) 15%, hsl(200 70% 45% / 0.2) 35%, transparent 60%)',
            animation: 'auroraWave2 15s ease-in-out infinite 2s',
            filter: 'blur(50px)',
          }}
        />
        {/* Aurora layer 3 - shifting curtain */}
        <div 
          className="absolute inset-x-0 top-0 h-full opacity-10"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, hsl(140 70% 50% / 0.3) 25%, hsl(185 80% 45% / 0.25) 50%, hsl(260 60% 55% / 0.2) 75%, transparent 100%)',
            animation: 'auroraShift 20s ease-in-out infinite 1s',
            filter: 'blur(35px)',
          }}
        />
      </div>

      {/* Base gradient mesh - slowest layer */}
      <div style={{ transform: `translateY(${slowParallax}px)` }}>
        <GradientMesh />
      </div>

      {/* Particle system - medium speed */}
      <div style={{ transform: `translateY(${mediumParallax * 0.5}px)` }}>
        <ParticleField />
      </div>

      {/* Animated code blocks - fast layer */}
      <div style={{ transform: `translateY(${fastParallax * 0.3}px)` }}>
        <AnimatedCodeBlocks />
      </div>

      {/* Floating geometric shapes - varied parallax speeds */}
      <div style={{ transform: `translateY(${fastParallax * 0.4}px)` }}>
        <FloatingShape 
          className="top-[15%] left-[10%]" 
          size={60} 
          duration={20} 
          delay={0}
          shape="hexagon"
        />
        <FloatingShape 
          className="top-[25%] right-[15%]" 
          size={40} 
          duration={25} 
          delay={2}
          shape="triangle"
        />
      </div>
      
      <div style={{ transform: `translateY(${mediumParallax * 0.6}px)` }}>
        <FloatingShape 
          className="top-[60%] left-[5%]" 
          size={30} 
          duration={18} 
          delay={4}
          shape="circle"
        />
        <FloatingShape 
          className="top-[70%] right-[10%]" 
          size={50} 
          duration={22} 
          delay={1}
          shape="square"
        />
      </div>
      
      <div style={{ transform: `translateY(${slowParallax * 0.8}px)` }}>
        <FloatingShape 
          className="top-[40%] left-[20%]" 
          size={25} 
          duration={30} 
          delay={3}
          shape="circle"
        />
        <FloatingShape 
          className="top-[80%] left-[40%]" 
          size={35} 
          duration={24} 
          delay={5}
          shape="triangle"
        />
        <FloatingShape 
          className="top-[10%] right-[30%]" 
          size={45} 
          duration={28} 
          delay={2}
          shape="hexagon"
        />
      </div>

      {/* Terminal cursor blink effect - cyan themed */}
      <div 
        className="absolute top-[20%] right-[25%] flex items-center gap-1 opacity-40"
        style={{ transform: `translateY(${fastParallax * 0.5}px)` }}
      >
        <span className="font-mono text-primary text-lg drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]">&gt;_</span>
        <span className="w-2 h-5 bg-primary animate-pulse shadow-[0_0_10px_hsl(var(--primary)/0.5)]" style={{ animationDuration: '1s' }} />
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

      {/* Cozy fireplace glow - left corner */}
      <div 
        className="absolute bottom-0 left-0 w-80 h-64 motion-reduce:hidden"
        style={{
          background: 'radial-gradient(ellipse at bottom left, hsl(25 95% 53% / 0.15) 0%, hsl(15 90% 45% / 0.08) 40%, transparent 70%)',
          animation: 'fireplaceFlicker 3s ease-in-out infinite',
          filter: 'blur(20px)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-48 h-40 motion-reduce:hidden"
        style={{
          background: 'radial-gradient(ellipse at bottom left, hsl(35 100% 60% / 0.12) 0%, hsl(25 90% 50% / 0.06) 50%, transparent 80%)',
          animation: 'fireplaceFlicker 2.5s ease-in-out infinite 0.5s',
          filter: 'blur(15px)',
        }}
      />

      {/* Cozy fireplace glow - right corner */}
      <div 
        className="absolute bottom-0 right-0 w-80 h-64 motion-reduce:hidden"
        style={{
          background: 'radial-gradient(ellipse at bottom right, hsl(25 95% 53% / 0.15) 0%, hsl(15 90% 45% / 0.08) 40%, transparent 70%)',
          animation: 'fireplaceFlicker 3.5s ease-in-out infinite 0.8s',
          filter: 'blur(20px)',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-48 h-40 motion-reduce:hidden"
        style={{
          background: 'radial-gradient(ellipse at bottom right, hsl(35 100% 60% / 0.12) 0%, hsl(25 90% 50% / 0.06) 50%, transparent 80%)',
          animation: 'fireplaceFlicker 2s ease-in-out infinite 1.2s',
          filter: 'blur(15px)',
        }}
      />

      {/* Festive snowfall overlay */}
      <Snowfall />
    </div>
  );
}

interface FloatingShapeProps {
  className?: string;
  size: number;
  duration: number;
  delay: number;
  shape: 'circle' | 'square' | 'triangle' | 'hexagon';
}

function FloatingShape({ className, size, duration, delay, shape }: FloatingShapeProps) {
  const getShapeStyles = () => {
    switch (shape) {
      case 'circle':
        return { borderRadius: '50%' };
      case 'square':
        return { borderRadius: '4px', transform: 'rotate(45deg)' };
      case 'triangle':
        return { 
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          borderRadius: '0'
        };
      case 'hexagon':
        return { 
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          borderRadius: '0'
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={`absolute ${className}`}
      style={{
        width: size,
        height: size,
        ...getShapeStyles(),
        border: '1px solid hsl(185 100% 50% / 0.2)',
        background: 'hsl(185 100% 50% / 0.04)',
        boxShadow: '0 0 15px hsl(185 100% 50% / 0.08)',
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        willChange: 'transform',
      }}
    />
  );
}
