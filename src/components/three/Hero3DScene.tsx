import { ThreeCanvas } from './ThreeCanvas';
import { SceneEnvironment } from './SceneEnvironment';
import { GridPlane3D } from './GridPlane3D';
import { ConstellationField } from './ConstellationField';
import { PostProcessingEffects } from './PostProcessingEffects';

interface Hero3DSceneProps {
  isPaused?: boolean;
  tiltX?: number;
  tiltY?: number;
}

export function Hero3DScene({ isPaused = false, tiltX = 0, tiltY = 0 }: Hero3DSceneProps) {
  return (
    <ThreeCanvas className="z-0" isPaused={isPaused}>
      <SceneEnvironment />
      
      {/* 3D Constellation field with multi-layer parallax depth */}
      <ConstellationField isPaused={isPaused} tiltX={tiltX} tiltY={tiltY} />
      
      {/* Deep perspective grid with integrated particles and gyroscope parallax */}
      <GridPlane3D isPaused={isPaused} tiltX={tiltX} tiltY={tiltY} />
      
      {/* Performance-scaled post-processing */}
      <PostProcessingEffects />
    </ThreeCanvas>
  );
}
