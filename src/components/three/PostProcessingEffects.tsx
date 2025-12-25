import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function PostProcessingEffects() {
  const { enablePostProcessing } = useAdaptiveQuality();

  if (!enablePostProcessing) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.6}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette darkness={0.4} offset={0.4} />
    </EffectComposer>
  );
}
