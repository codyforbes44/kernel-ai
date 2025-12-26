import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function PostProcessingEffects() {
  const { enablePostProcessing, tier } = useAdaptiveQuality();

  if (!enablePostProcessing) return null;

  // Scale bloom intensity based on performance tier
  const bloomIntensity = {
    ULTRA: 0.9,
    HIGH: 0.7,
    MEDIUM: 0.4,
    LOW: 0.2,
  }[tier];

  // Disable vignette on lower tiers for performance
  const showVignette = tier === 'ULTRA' || tier === 'HIGH';

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.8}
        mipmapBlur
      />
      {showVignette && <Vignette darkness={0.6} offset={0.3} />}
    </EffectComposer>
  );
}
