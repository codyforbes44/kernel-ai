import { ThreeCanvas } from './ThreeCanvas';
import { SceneEnvironment } from './SceneEnvironment';
import { StarField3D } from './StarField3D';
import { ParticleSystem3D } from './ParticleSystem3D';
import { CosmicVoid } from './CosmicVoid';
import { AuroraPlane3D } from './AuroraPlane3D';
import { GridPlane3D } from './GridPlane3D';
import { WarpTunnel } from './WarpTunnel';
import { PostProcessingEffects } from './PostProcessingEffects';

export function Hero3DScene() {
  return (
    <ThreeCanvas className="z-0">
      <SceneEnvironment />
      <WarpTunnel />
      <CosmicVoid />
      <StarField3D />
      <AuroraPlane3D />
      <ParticleSystem3D />
      <GridPlane3D />
      <PostProcessingEffects />
    </ThreeCanvas>
  );
}
