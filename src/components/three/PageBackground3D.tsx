import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

// Subtle floating particles for content pages
function SubtleParticles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);
  const { getParticleCount, shouldAnimate } = useAdaptiveQuality();
  const actualCount = getParticleCount(count);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(actualCount * 3);
    const col = new Float32Array(actualCount * 3);
    
    for (let i = 0; i < actualCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
      
      // Cyan to teal colors
      col[i * 3] = 0.0 + Math.random() * 0.2;
      col[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      col[i * 3 + 2] = 0.9 + Math.random() * 0.1;
    }
    
    return [pos, col];
  }, [actualCount]);

  useFrame((state) => {
    if (!mesh.current || !shouldAnimate) return;
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime * 0.1;
    
    for (let i = 0; i < actualCount; i++) {
      const idx = i * 3;
      positions[idx + 1] += Math.sin(time + i * 0.1) * 0.002;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y = time * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={actualCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={actualCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Floating glow orbs
function GlowOrbs({ count = 5 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { shouldAnimate } = useAdaptiveQuality();

  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        -15 - Math.random() * 20,
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 1.5,
      speed: 0.2 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
      color: i % 2 === 0 ? '#00ffff' : '#ff00aa',
    }));
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current || !shouldAnimate) return;
    const time = state.clock.elapsedTime;
    
    groupRef.current.children.forEach((child, i) => {
      const orb = orbs[i];
      child.position.y = orb.position[1] + Math.sin(time * orb.speed + orb.offset) * 2;
      child.position.x = orb.position[0] + Math.cos(time * orb.speed * 0.5 + orb.offset) * 1;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position}>
          <sphereGeometry args={[orb.scale, 16, 16]} />
          <meshBasicMaterial
            color={orb.color}
            transparent
            opacity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main scene content
function SceneContent({ intensity = 'low' }: { intensity?: 'low' | 'medium' | 'high' }) {
  const particleCount = intensity === 'high' ? 400 : intensity === 'medium' ? 250 : 150;
  const orbCount = intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 3;

  return (
    <>
      <color attach="background" args={['#000011']} />
      <fog attach="fog" args={['#000011', 30, 80]} />
      <ambientLight intensity={0.1} />
      <SubtleParticles count={particleCount} />
      <GlowOrbs count={orbCount} />
    </>
  );
}

interface PageBackground3DProps {
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function PageBackground3D({ intensity = 'low', className = '' }: PageBackground3DProps) {
  const { tier } = useAdaptiveQuality();

  // Skip 3D on very low-end devices
  if (tier === 'LOW') {
    return (
      <div 
        className={`fixed inset-0 -z-10 bg-gradient-to-b from-background via-background to-background/95 ${className}`}
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.05) 0%, transparent 50%)',
        }}
      />
    );
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
      >
        <SceneContent intensity={intensity} />
      </Canvas>
    </div>
  );
}
