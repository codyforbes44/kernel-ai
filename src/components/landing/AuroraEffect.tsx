import { memo } from 'react';

interface AuroraEffectProps {
  parallaxOffset?: number;
}

export const AuroraEffect = memo(function AuroraEffect({ parallaxOffset = 0 }: AuroraEffectProps) {
  return (
    <div 
      className="absolute inset-x-0 top-0 h-[50%] overflow-hidden motion-reduce:hidden"
      style={{ transform: `translateZ(-300px) translateY(${parallaxOffset}px) scale(1.4)` }}
    >
      {/* Aurora layer 1 - green/cyan */}
      <div 
        className="absolute inset-x-0 top-0 h-full opacity-30"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(160 80% 45% / 0.4) 20%, hsl(175 70% 40% / 0.3) 40%, transparent 70%)',
          animation: 'auroraWave1 12s ease-in-out infinite',
          filter: 'blur(50px)',
        }}
      />
      {/* Aurora layer 2 - purple/pink */}
      <div 
        className="absolute inset-x-0 top-0 h-full opacity-25"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(280 60% 50% / 0.35) 15%, hsl(200 70% 45% / 0.3) 35%, transparent 60%)',
          animation: 'auroraWave2 15s ease-in-out infinite 2s',
          filter: 'blur(60px)',
        }}
      />
      {/* Aurora layer 3 - shifting curtain */}
      <div 
        className="absolute inset-x-0 top-0 h-full opacity-20"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, hsl(140 70% 50% / 0.4) 25%, hsl(185 80% 45% / 0.35) 50%, hsl(260 60% 55% / 0.3) 75%, transparent 100%)',
          animation: 'auroraShift 20s ease-in-out infinite 1s',
          filter: 'blur(45px)',
        }}
      />
    </div>
  );
});
