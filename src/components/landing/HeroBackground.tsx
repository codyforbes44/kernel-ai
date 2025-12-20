import { useEffect, useRef } from 'react';
import { GradientMesh } from './GradientMesh';
import { ParticleField } from './ParticleField';
import { AnimatedCodeBlocks } from './AnimatedCodeBlocks';

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ '--mouse-x': '0px', '--mouse-y': '0px' } as React.CSSProperties}
    >
      {/* Base gradient mesh */}
      <GradientMesh />

      {/* Particle system */}
      <ParticleField />

      {/* Animated code blocks */}
      <AnimatedCodeBlocks />

      {/* Floating geometric shapes */}
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

      {/* Terminal cursor blink effect - cyan themed */}
      <div className="absolute top-[20%] right-[25%] flex items-center gap-1 opacity-40">
        <span className="font-mono text-primary text-lg drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]">&gt;_</span>
        <span className="w-2 h-5 bg-primary animate-pulse shadow-[0_0_10px_hsl(var(--primary)/0.5)]" style={{ animationDuration: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
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

      {/* Radial vignette */}
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
