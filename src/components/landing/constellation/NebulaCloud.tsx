import { memo } from 'react';
import type { Nebula } from './types';

interface NebulaCloudProps {
  nebula: Nebula;
  simplified: boolean;
}

export const NebulaCloud = memo(function NebulaCloud({ nebula, simplified }: NebulaCloudProps) {
  if (simplified) return null;
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${nebula.x}%`,
        top: `${nebula.y}%`,
        width: nebula.width,
        height: nebula.height,
        transform: `translate(-50%, -50%) rotate(${nebula.rotation}deg)`,
        background: `radial-gradient(ellipse, ${nebula.color.replace(')', ` / ${nebula.opacity})`)}, transparent 70%)`,
        filter: 'blur(6px)',
        animation: 'constellationPulse 12s ease-in-out infinite',
      }}
    />
  );
});
