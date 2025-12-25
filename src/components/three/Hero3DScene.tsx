import { ThreeCanvas } from './ThreeCanvas';
import { SceneEnvironment } from './SceneEnvironment';
import { GridPlane3D } from './GridPlane3D';
import { PostProcessingEffects } from './PostProcessingEffects';
import { HeroAICore } from './HeroAICore';
import { CapabilityOrbs } from './CapabilityOrbs';
import { DataStreams } from './DataStreams';
import { HolographicLayers } from './HolographicLayers';

export function Hero3DScene() {
  return (
    <ThreeCanvas className="z-0">
      <SceneEnvironment />
      
      {/* Background layers */}
      <HolographicLayers />
      
      {/* Foundation grid */}
      <GridPlane3D />
      
      {/* Data flow particles */}
      <DataStreams />
      
      {/* Orbiting capability nodes */}
      <CapabilityOrbs />
      
      {/* Central AI core crystal */}
      <HeroAICore />
      
      {/* Post-processing effects */}
      <PostProcessingEffects />
    </ThreeCanvas>
  );
}
