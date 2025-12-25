import { Hero3DScene } from '../three/Hero3DScene';
import { AnimatedCodeBlocks } from './AnimatedCodeBlocks';
import { HolographicElements } from './HolographicElements';
import { TerminalCursors } from './TerminalCursors';
import { useParallaxEffect } from '@/hooks/useParallaxEffect';
import { DEPTH_LAYERS, DEPTH_SCALES, PERSPECTIVE } from '@/constants/depthLayers';

export function HeroBackground() {
  const { containerRef, fastParallax } = useParallaxEffect({ mouseIntensity: 50 });

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        perspective: `${PERSPECTIVE.MAIN}px`,
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* 2100-Era WebGL 3D Scene */}
      <Hero3DScene />
      
      {/* Overlay layers for HTML content integration */}
      <div className="absolute inset-0 preserve-3d" style={{ zIndex: 10 }}>
        {/* Animated code blocks - Near layer */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(${DEPTH_LAYERS.NEAR}px) translateY(${fastParallax * 0.3}px) scale(${DEPTH_SCALES[DEPTH_LAYERS.NEAR]})`,
          }}
        >
          <AnimatedCodeBlocks />
        </div>

        {/* Holographic UI Elements - Front floating layer */}
        <div 
          className="absolute inset-0 motion-reduce:hidden"
          style={{ 
            transform: `translateZ(${DEPTH_LAYERS.FRONT}px) translateY(${fastParallax * 0.5}px) scale(${DEPTH_SCALES[DEPTH_LAYERS.FRONT]})`,
          }}
        >
          <HolographicElements />
        </div>

        {/* Terminal cursors - Extreme front layer */}
        <TerminalCursors fastParallax={fastParallax} />
      </div>
    </div>
  );
}
