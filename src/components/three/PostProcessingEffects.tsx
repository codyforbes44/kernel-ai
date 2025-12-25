import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function PostProcessingEffects() {
  const { settings, enablePostProcessing } = useAdaptiveQuality();

  if (!enablePostProcessing) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={settings.bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      {settings.chromaticAberration && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.002, 0.002)}
          radialModulation={true}
          modulationOffset={0.5}
        />
      )}
      <Vignette darkness={0.5} offset={0.3} />
      <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
