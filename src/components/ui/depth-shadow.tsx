import * as React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface DepthShadowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Z-depth of the element (affects shadow size and offset) */
  depth?: number;
  /** Base shadow color (defaults to primary) */
  color?: 'primary' | 'accent' | 'foreground';
  /** Shadow intensity multiplier */
  intensity?: number;
  /** Enable gyroscope-based shadow movement */
  gyroscopeEnabled?: boolean;
  /** Children to render with shadow */
  children: React.ReactNode;
}

export function DepthShadow({
  depth = 50,
  color = 'primary',
  intensity = 1,
  gyroscopeEnabled = true,
  children,
  className,
  style,
  ...props
}: DepthShadowProps) {
  const { normalizedTilt, isSupported } = useDeviceOrientation();
  const [smoothTilt, setSmoothTilt] = React.useState({ x: 0, y: 0 });

  // Smooth interpolation for tilt values
  React.useEffect(() => {
    if (!gyroscopeEnabled || !isSupported) return;

    const lerp = 0.08;
    const animate = () => {
      setSmoothTilt(prev => ({
        x: prev.x + (normalizedTilt.x - prev.x) * lerp,
        y: prev.y + (normalizedTilt.y - prev.y) * lerp,
      }));
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [normalizedTilt.x, normalizedTilt.y, gyroscopeEnabled, isSupported]);

  // Calculate shadow based on depth and tilt
  const depthFactor = depth / 50; // Normalize to 1 at depth=50
  const baseBlur = 20 * depthFactor * intensity;
  const baseSpread = 5 * depthFactor * intensity;
  const baseOffset = 10 * depthFactor;

  // Tilt-based shadow offset (simulates light source movement)
  const tiltOffsetX = gyroscopeEnabled && isSupported ? smoothTilt.x * 15 * depthFactor : 0;
  const tiltOffsetY = gyroscopeEnabled && isSupported ? smoothTilt.y * 15 * depthFactor : 0;

  const colorVar = {
    primary: 'var(--primary)',
    accent: 'var(--accent)',
    foreground: 'var(--foreground)',
  }[color];

  const shadowStyle: React.CSSProperties = {
    ...style,
    boxShadow: `
      ${tiltOffsetX + baseOffset}px ${tiltOffsetY + baseOffset}px ${baseBlur}px ${baseSpread}px hsl(${colorVar} / ${0.15 * intensity}),
      ${tiltOffsetX}px ${tiltOffsetY + 5}px ${baseBlur * 0.5}px 0px hsl(${colorVar} / ${0.1 * intensity}),
      0 0 ${baseBlur * 0.3}px hsl(${colorVar} / ${0.05 * intensity})
    `,
    transform: `translateZ(${depth}px)`,
    transition: 'box-shadow 0.15s ease-out',
  };

  return (
    <div className={cn('relative', className)} style={shadowStyle} {...props}>
      {children}
    </div>
  );
}

// Floating shadow that appears beneath an element
interface FloatingShadowProps {
  /** Z-depth affecting shadow distance */
  depth?: number;
  /** Shadow opacity */
  opacity?: number;
  /** Enable gyroscope tracking */
  gyroscopeEnabled?: boolean;
}

export function FloatingShadow({
  depth = 30,
  opacity = 0.2,
  gyroscopeEnabled = true,
}: FloatingShadowProps) {
  const { normalizedTilt, isSupported } = useDeviceOrientation();
  const [smoothTilt, setSmoothTilt] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!gyroscopeEnabled || !isSupported) return;

    const lerp = 0.06;
    let rafId: number;
    
    const animate = () => {
      setSmoothTilt(prev => ({
        x: prev.x + (normalizedTilt.x - prev.x) * lerp,
        y: prev.y + (normalizedTilt.y - prev.y) * lerp,
      }));
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [normalizedTilt.x, normalizedTilt.y, gyroscopeEnabled, isSupported]);

  const offsetX = smoothTilt.x * 20;
  const offsetY = depth + smoothTilt.y * 10;
  const blur = depth * 1.5;
  const scaleX = 1 - Math.abs(smoothTilt.x) * 0.1;
  const scaleY = 0.3 - Math.abs(smoothTilt.y) * 0.05;

  return (
    <div
      className="absolute inset-x-4 -bottom-2 h-8 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, hsl(var(--primary) / ${opacity}) 0%, transparent 70%)`,
        transform: `translateX(${offsetX}px) translateY(${offsetY}px) scaleX(${scaleX}) scaleY(${scaleY})`,
        filter: `blur(${blur}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
}

// Grid projection shadow for 3D effect
interface GridProjectionShadowProps {
  /** Enable animation */
  animated?: boolean;
}

export function GridProjectionShadow({ animated = true }: GridProjectionShadowProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        background: `
          linear-gradient(
            to bottom,
            transparent 0%,
            hsl(var(--primary) / 0.02) 50%,
            hsl(var(--primary) / 0.05) 100%
          )
        `,
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
      }}
    >
      {/* Animated scan line */}
      {animated && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)',
            backgroundSize: '100% 200%',
            animation: 'scanlineMove 4s linear infinite',
          }}
        />
      )}
    </div>
  );
}
