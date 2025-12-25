import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DepthContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  perspective?: number;
  enableMouseTilt?: boolean;
  tiltIntensity?: number;
  enableScrollParallax?: boolean;
  scrollIntensity?: number;
}

export function DepthContainer({
  children,
  className,
  perspective = 1000,
  enableMouseTilt = false,
  tiltIntensity = 10,
  enableScrollParallax = false,
  scrollIntensity = 0.1,
  ...props
}: DepthContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, translateY: 0 });

  useEffect(() => {
    if (!enableMouseTilt) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * tiltIntensity;
      const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * tiltIntensity;

      setTransform(prev => ({ ...prev, rotateX, rotateY }));
    };

    const handleMouseLeave = () => {
      setTransform(prev => ({ ...prev, rotateX: 0, rotateY: 0 }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    containerRef.current?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enableMouseTilt, tiltIntensity]);

  useEffect(() => {
    if (!enableScrollParallax) return;

    const handleScroll = () => {
      const translateY = window.scrollY * scrollIntensity;
      setTransform(prev => ({ ...prev, translateY }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollParallax, scrollIntensity]);

  return (
    <div
      ref={containerRef}
      className={cn('perspective-container', className)}
      style={{
        perspective: `${perspective}px`,
      }}
      {...props}
    >
      <div
        className="preserve-3d transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translateY(${transform.translateY}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Depth Layer components for easy z-positioning
interface DepthLayerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  depth?: 'far' | 'mid' | 'near' | 'front';
  z?: number;
}

const depthValues = {
  far: -100,
  mid: -50,
  near: 0,
  front: 50,
};

export function DepthLayer({
  children,
  className,
  depth = 'near',
  z,
  ...props
}: DepthLayerProps) {
  const zValue = z ?? depthValues[depth];

  return (
    <div
      className={cn('transition-transform duration-300', className)}
      style={{
        transform: `translateZ(${zValue}px)`,
        transformStyle: 'preserve-3d',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
