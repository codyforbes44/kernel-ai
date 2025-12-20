import { useEffect, useRef } from 'react';

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
      {/* Gradient orbs */}
      <div 
        className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-[100px] animate-pulse"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
          transform: 'translate(calc(var(--mouse-x) * 0.5), calc(var(--mouse-y) * 0.5))',
          transition: 'transform 0.3s ease-out'
        }}
      />
      <div 
        className="absolute top-1/2 -right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
          transform: 'translate(calc(var(--mouse-x) * -0.3), calc(var(--mouse-y) * -0.3))',
          transition: 'transform 0.3s ease-out',
          animationDelay: '1s'
        }}
      />
      <div 
        className="absolute -bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--accent-foreground)) 0%, transparent 70%)',
          transform: 'translate(calc(var(--mouse-x) * 0.2), calc(var(--mouse-y) * 0.2))',
          transition: 'transform 0.3s ease-out'
        }}
      />

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

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
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
        border: '1px solid hsl(var(--primary) / 0.2)',
        background: 'hsl(var(--primary) / 0.05)',
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}
