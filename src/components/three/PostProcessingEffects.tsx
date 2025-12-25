import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';
import { Vector2 } from 'three';

export function PostProcessingEffects() {
  const { settings, enablePostProcessing, tier } = useAdaptiveQuality();

  if (!enablePostProcessing) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={settings.bloomIntensity * 1.2}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      {settings.chromaticAberration && tier !== 'MEDIUM' && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new Vector2(0.0008, 0.0008)}
          radialModulation={false}
          modulationOffset={0.5}
        />
      )}
      <Vignette darkness={0.5} offset={0.35} />
    </EffectComposer>
  );
}
