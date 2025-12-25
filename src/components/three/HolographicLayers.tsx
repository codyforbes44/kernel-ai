import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

function HoloPlane({ 
  position, 
  rotation, 
  scale, 
  color, 
  opacity 
}: { 
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: number;
  opacity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { shouldAnimate } = useAdaptiveQuality();
  
  // Create grid texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 256, 256);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < 256; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < 256; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    
    // Add some "code" dots
    ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);

  useFrame((state) => {
    if (!shouldAnimate || !meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Gentle floating motion
    meshRef.current.position.y = position[1] + Math.sin(time * 0.3 + position[0]) * 2;
    
    // Subtle rotation
    meshRef.current.rotation.z = rotation[2] + Math.sin(time * 0.2) * 0.02;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[40, 30]} />
      <meshBasicMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function ScanLine() {
  const lineRef = useRef<THREE.Mesh>(null);
  const { shouldAnimate } = useAdaptiveQuality();

  useFrame((state) => {
    if (!shouldAnimate || !lineRef.current) return;
    
    const time = state.clock.getElapsedTime();
    // Scan up and down
    lineRef.current.position.y = Math.sin(time * 0.5) * 30 + 15;
  });

  return (
    <mesh ref={lineRef} position={[0, 0, -30]}>
      <planeGeometry args={[120, 0.5]} />
      <meshBasicMaterial
        color={0x00ffff}
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export function HolographicLayers() {
  const { tier } = useAdaptiveQuality();
  
  // Reduce complexity on lower tiers
  if (tier === 'LOW') return null;

  return (
    <group>
      {/* Background holographic planes */}
      <HoloPlane
        position={[-50, 10, -80]}
        rotation={[0.1, 0.3, 0.05]}
        scale={[1.5, 1.2, 1]}
        color={0x00ffff}
        opacity={0.08}
      />
      <HoloPlane
        position={[50, 20, -90]}
        rotation={[-0.1, -0.2, -0.03]}
        scale={[1.3, 1, 1]}
        color={0xff00ff}
        opacity={0.06}
      />
      <HoloPlane
        position={[0, -10, -100]}
        rotation={[0.2, 0, 0.02]}
        scale={[2, 0.8, 1]}
        color={0x00ff88}
        opacity={0.05}
      />
      
      {/* Scan line effect */}
      {tier !== 'MEDIUM' && <ScanLine />}
    </group>
  );
}
