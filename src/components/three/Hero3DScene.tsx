import { ThreeCanvas } from './ThreeCanvas';
import { SceneEnvironment } from './SceneEnvironment';
import { GridPlane3D } from './GridPlane3D';
import { PostProcessingEffects } from './PostProcessingEffects';

export function Hero3DScene() {
  return (
    <ThreeCanvas className="z-0">
      <SceneEnvironment />
      
      {/* Minimalist grid background */}
      <GridPlane3D />
      
      {/* Subtle post-processing */}
      <PostProcessingEffects />
    </ThreeCanvas>
  );
}
