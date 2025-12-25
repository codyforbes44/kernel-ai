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

