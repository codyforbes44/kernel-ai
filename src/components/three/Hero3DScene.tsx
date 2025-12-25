import { ThreeCanvas } from './ThreeCanvas';
import { SceneEnvironment } from './SceneEnvironment';
import { GridPlane3D } from './GridPlane3D';
import { PostProcessingEffects } from './PostProcessingEffects';

interface Hero3DSceneProps {
  isPaused?: boolean;
}

export function Hero3DScene({ isPaused = false }: Hero3DSceneProps) {
  return (
    <ThreeCanvas className="z-0" isPaused={isPaused}>
      <SceneEnvironment />
      
      {/* Deep perspective grid with integrated particles */}
      <GridPlane3D isPaused={isPaused} />
      
      {/* Performance-scaled post-processing */}
      <PostProcessingEffects />
    </ThreeCanvas>
  );
}
