import * as React from 'react';
import { cn } from '@/lib/utils';
import { useParallaxLayers, ParallaxConfig } from '@/hooks/useParallaxLayers';

type LayerPreset = 'background' | 'far' | 'mid' | 'near' | 'foreground' | 'ui';

interface PerspectiveLayerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Predefined layer depth preset */
  layer?: LayerPreset;
  /** Custom depth value (overrides layer preset) */
  depth?: number;
  /** Custom parallax configuration */
  config?: ParallaxConfig;
  /** Enable/disable transforms */
  enabled?: boolean;
  /** Apply perspective container to this element */
  asPerspectiveRoot?: boolean;
  children: React.ReactNode;
}

export function PerspectiveLayer({
  layer = 'near',
  depth,
  config,
  enabled = true,
  asPerspectiveRoot = false,
  children,
  className,
  style,
  ...props
}: PerspectiveLayerProps) {
  const { layers, getLayer } = useParallaxLayers(config);

  // Get layer data based on preset or custom depth
  const layerData = React.useMemo(() => {
    if (depth !== undefined) {
      return getLayer(depth);
    }
    return layers[layer];
  }, [layers, layer, depth, getLayer]);

  if (!enabled) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'will-change-transform',
        asPerspectiveRoot && 'perspective-container',
        className
      )}
      style={{
        ...style,
        transform: layerData.transform,
        transformStyle: 'preserve-3d',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Wrapper that applies perspective to children
interface PerspectiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Perspective distance in pixels */
  perspective?: number;
  /** Perspective origin */
  origin?: string;
  children: React.ReactNode;
}

export function PerspectiveContainer({
  perspective = 1200,
  origin = '50% 50%',
  children,
  className,
  style,
  ...props
}: PerspectiveContainerProps) {
  return (
    <div
      className={cn('relative', className)}
      style={{
        ...style,
        perspective: `${perspective}px`,
        perspectiveOrigin: origin,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Gyroscope-aware UI element wrapper
interface GyroscopeUIProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tilt intensity multiplier */
  tiltIntensity?: number;
  /** Enable shadow that moves with tilt */
  dynamicShadow?: boolean;
  children: React.ReactNode;
}

export function GyroscopeUI({
  tiltIntensity = 1,
  dynamicShadow = true,
  children,
  className,
  style,
  ...props
}: GyroscopeUIProps) {
  const { layers, normalizedTilt, hasGyroscope } = useParallaxLayers({
    tiltStrength: tiltIntensity,
  });

  const uiLayer = layers.ui;

  // Dynamic shadow based on tilt
  const shadowX = normalizedTilt.x * 10;
  const shadowY = normalizedTilt.y * 10 + 5;

  const dynamicShadowStyle = dynamicShadow && hasGyroscope ? {
    boxShadow: `
      ${shadowX}px ${shadowY}px 20px hsl(var(--primary) / 0.1),
      ${shadowX * 0.5}px ${shadowY * 0.5}px 10px hsl(var(--background) / 0.5)
    `,
  } : {};

  return (
    <div
      className={cn('will-change-transform', className)}
      style={{
        ...style,
        transform: uiLayer.transform,
        transformStyle: 'preserve-3d',
        ...dynamicShadowStyle,
        transition: 'box-shadow 0.15s ease-out',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Text with dynamic shadow based on device orientation
interface DynamicTextShadowProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Shadow color */
  shadowColor?: 'primary' | 'accent' | 'foreground';
  /** Shadow intensity */
  intensity?: number;
  children: React.ReactNode;
}

export function DynamicTextShadow({
  shadowColor = 'primary',
  intensity = 1,
  children,
  className,
  style,
  ...props
}: DynamicTextShadowProps) {
  const { normalizedTilt, hasGyroscope } = useParallaxLayers();
  const [smoothTilt, setSmoothTilt] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!hasGyroscope) return;
    
    const lerp = 0.08;
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
  }, [normalizedTilt.x, normalizedTilt.y, hasGyroscope]);

  const shadowX = smoothTilt.x * 4 * intensity;
  const shadowY = smoothTilt.y * 4 * intensity + 2;

  const colorVar = {
    primary: 'var(--primary)',
    accent: 'var(--accent)',
    foreground: 'var(--foreground)',
  }[shadowColor];

  return (
    <span
      className={className}
      style={{
        ...style,
        textShadow: `
          ${shadowX}px ${shadowY}px 10px hsl(${colorVar} / ${0.3 * intensity}),
          ${shadowX * 0.5}px ${shadowY * 0.5}px 5px hsl(${colorVar} / ${0.2 * intensity})
        `,
        transition: 'text-shadow 0.1s ease-out',
      }}
      {...props}
    >
      {children}
    </span>
  );
}
