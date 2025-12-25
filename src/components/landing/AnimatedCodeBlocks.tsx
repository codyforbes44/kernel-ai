import { useEffect, useState, useMemo } from 'react';
import { CODE_SNIPPETS, CODE_BLOCK_CONFIGS } from '@/constants/codeSnippets';
import { PERSPECTIVE } from '@/constants/depthLayers';

interface CodeBlockProps {
  snippet: { code: string; lang: string };
  position: { top: string; left: string };
  delay: number;
  duration: number;
  zDepth: number;
}

function CodeBlock({ snippet, position, delay, duration, zDepth }: CodeBlockProps) {
  const [visible, setVisible] = useState(false);
  const [currentZ, setCurrentZ] = useState(zDepth);

  useEffect(() => {
    const showTimeout = setTimeout(() => setVisible(true), delay * 1000);
    const hideTimeout = setTimeout(() => setVisible(false), (delay + duration) * 1000);
    
    const interval = setInterval(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), duration * 1000);
    }, (delay + duration + 2) * 1000);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearInterval(interval);
    };
  }, [delay, duration]);

  // Z-axis animation - blocks travel through depth
  useEffect(() => {
    if (!visible) {
      setCurrentZ(zDepth - 30);
      return;
    }
    
    const animateZ = () => {
      setCurrentZ(prev => {
        const target = zDepth + 20;
        const step = (target - prev) * 0.02;
        return prev + step;
      });
    };
    
    const zAnimation = setInterval(animateZ, 50);
    return () => clearInterval(zAnimation);
  }, [visible, zDepth]);

  const scale = 0.8 + (currentZ + 50) / 100 * 0.4;
  const glowIntensity = visible ? Math.min(1, (currentZ + 50) / 80) : 0;

  return (
    <div
      className="absolute font-mono text-xs px-3 py-1.5 rounded-md border transition-all"
      style={{
        top: position.top,
        left: position.left,
        background: `hsl(220 30% 8% / ${0.6 + glowIntensity * 0.2})`,
        borderColor: `hsl(185 100% 50% / ${0.2 + glowIntensity * 0.15})`,
        backdropFilter: 'blur(8px)',
        boxShadow: visible 
          ? `0 0 ${20 + glowIntensity * 20}px hsl(185 100% 50% / ${0.1 + glowIntensity * 0.15}),
             inset 0 0 ${10 + glowIntensity * 10}px hsl(185 100% 50% / ${glowIntensity * 0.08})`
          : 'none',
        transform: `
          translateZ(${currentZ}px) 
          scale(${scale}) 
          translateY(${visible ? 0 : 10}px)
          rotateX(${visible ? 0 : 5}deg)
        `,
        opacity: visible ? 0.5 + glowIntensity * 0.3 : 0,
        transition: 'opacity 0.7s ease-out, transform 0.5s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Holographic shimmer overlay */}
      <div 
        className="absolute inset-0 rounded-md overflow-hidden pointer-events-none"
        style={{
          background: visible 
            ? `linear-gradient(105deg, 
                transparent 0%, 
                hsl(185 100% 70% / ${glowIntensity * 0.1}) 45%, 
                hsl(185 100% 80% / ${glowIntensity * 0.15}) 50%, 
                hsl(185 100% 70% / ${glowIntensity * 0.1}) 55%, 
                transparent 100%)`
            : 'none',
          animation: visible ? 'holoShimmer 3s ease-in-out infinite' : 'none',
        }}
      />
      <span className="text-[hsl(185_100%_60%)] relative z-10">{snippet.code}</span>
    </div>
  );
}

export function AnimatedCodeBlocks() {
  const blockConfigs = useMemo(() => CODE_BLOCK_CONFIGS, []);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        perspective: `${PERSPECTIVE.CODE_BLOCKS}px`,
        perspectiveOrigin: '50% 50%',
        transformStyle: 'preserve-3d',
      }}
    >
      {CODE_SNIPPETS.map((snippet, index) => (
        <CodeBlock
          key={index}
          snippet={snippet}
          position={blockConfigs[index].position}
          delay={index * 1.5}
          duration={4}
          zDepth={blockConfigs[index].zDepth}
        />
      ))}
    </div>
  );
}
