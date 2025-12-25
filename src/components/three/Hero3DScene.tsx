import { ThreeCanvas } from './ThreeCanvas';
import { SceneEnvironment } from './SceneEnvironment';
import { GridPlane3D } from './GridPlane3D';
import { AmbientParticles } from './AmbientParticles';
import { PostProcessingEffects } from './PostProcessingEffects';

export function Hero3DScene() {
  return (
    <ThreeCanvas className="z-0">
      <SceneEnvironment />
      
      {/* Deep perspective grid */}
      <GridPlane3D />
      
      {/* Subtle ambient floating particles */}
      <AmbientParticles />
      
      {/* Minimal post-processing */}
      <PostProcessingEffects />
    </ThreeCanvas>
  );
}
