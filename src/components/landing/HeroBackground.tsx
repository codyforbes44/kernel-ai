import { GradientMesh } from './GradientMesh';
import { ParticleField } from './ParticleField';
import { AnimatedCodeBlocks } from './AnimatedCodeBlocks';
import { StarConstellation } from './StarConstellation';
import { HolographicElements } from './HolographicElements';
import { CosmicBackground } from './CosmicBackground';
import { AuroraEffect } from './AuroraEffect';
import { PerspectiveGrid } from './PerspectiveGrid';
import { TerminalCursors } from './TerminalCursors';
import { useParallaxEffect } from '@/hooks/useParallaxEffect';
import { DEPTH_LAYERS, DEPTH_SCALES, PERSPECTIVE } from '@/constants/depthLayers';

export function HeroBackground() {
  const { 
    containerRef, 
    scrollY, 
    slowParallax, 
    mediumParallax, 
    fastParallax 
  } = useParallaxEffect({ mouseIntensity: 50 });

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        '--mouse-x': '0px', 
        '--mouse-y': '0px',
        perspective: `${PERSPECTIVE.MAIN}px`,
        perspectiveOrigin: '50% 50%',
      } as React.CSSProperties}
    >
      {/* 3D Depth Container - Extreme Futuristic Layers */}
      <div className="absolute inset-0 preserve-3d">
        
        {/* LAYER 1: Cosmic deep space background - Deepest layer */}
        <div 
          className="absolute inset-0 motion-reduce:hidden"
          style={{ 
            transform: `translateZ(${DEPTH_LAYERS.ABYSS}px) translateY(${slowParallax * 0.3}px) scale(${DEPTH_SCALES[DEPTH_LAYERS.ABYSS]})`,
          }}
        >
          <CosmicBackground />
        </div>

        {/* LAYER 2: Northern lights aurora effect - Far depth layer */}
        <AuroraEffect parallaxOffset={slowParallax * 0.4} />

        {/* LAYER 3: Base gradient mesh - Deep layer */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(${DEPTH_LAYERS.FAR}px) translateY(${slowParallax * 0.5}px) scale(${DEPTH_SCALES[DEPTH_LAYERS.FAR]})`,
          }}
        >
          <GradientMesh />
        </div>

        {/* LAYER 4: Particle system - Mid depth layer */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(${DEPTH_LAYERS.MID_FAR}px) translateY(${mediumParallax * 0.4}px) scale(${DEPTH_SCALES[DEPTH_LAYERS.MID_FAR]})`,
          }}
        >
          <ParticleField />
        </div>

        {/* LAYER 5: Star constellations - Mid-near layer */}
        <div 
          className="absolute inset-0"
          style={{ transform: `translateZ(${DEPTH_LAYERS.MID}px) scale(${DEPTH_SCALES[DEPTH_LAYERS.MID]})` }}
        >
          <StarConstellation scrollY={scrollY} />
        </div>

        {/* LAYER 6: Animated code blocks - Near layer */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(${DEPTH_LAYERS.NEAR}px) translateY(${fastParallax * 0.3}px) scale(${DEPTH_SCALES[DEPTH_LAYERS.NEAR]})`,
          }}
        >
          <AnimatedCodeBlocks />
        </div>

        {/* LAYER 7: Holographic UI Elements - Front floating layer */}
        <div 
          className="absolute inset-0 motion-reduce:hidden"
          style={{ 
            transform: `translateZ(${DEPTH_LAYERS.FRONT}px) translateY(${fastParallax * 0.5}px) scale(${DEPTH_SCALES[DEPTH_LAYERS.FRONT]})`,
          }}
        >
          <HolographicElements />
        </div>

        {/* LAYER 8: Terminal cursors - Extreme front layer */}
        <TerminalCursors fastParallax={fastParallax} />
      </div>

      {/* Grid overlays and vignettes */}
      <PerspectiveGrid />
    </div>
  );
}
