import { memo } from 'react';

interface SparkEffectProps {
  size: number;
  color: string;
  delay: number;
}

export const SparkEffect = memo(function SparkEffect({ size, color, delay }: SparkEffectProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 8,
        height: size * 8,
      }}
    >
      {/* Radial spark pulse */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color.includes('var') ? `hsl(${color.replace('hsl(', '').replace(')', '')} / 0.6)` : color.replace(')', ' / 0.6)')}, transparent 60%)`,
          animation: `sparkPulse 4s ease-in-out infinite`,
          animationDelay: `${delay}s`,
        }}
      />
      {/* Cross spark lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{
          animation: `sparkRotate 8s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      >
        <line
          x1="50%"
          y1="15%"
          x2="50%"
          y2="85%"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.4"
          style={{
            animation: `sparkFade 4s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        />
        <line
          x1="15%"
          y1="50%"
          x2="85%"
          y2="50%"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.4"
          style={{
            animation: `sparkFade 4s ease-in-out infinite`,
            animationDelay: `${delay + 0.5}s`,
          }}
        />
      </svg>
    </div>
  );
});
