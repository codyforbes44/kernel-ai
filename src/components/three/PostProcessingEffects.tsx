import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function PostProcessingEffects() {
  const { enablePostProcessing } = useAdaptiveQuality();

  if (!enablePostProcessing) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.8}
        mipmapBlur
      />
      <Vignette darkness={0.5} offset={0.35} />
    </EffectComposer>
  );
}
