import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

interface CapabilityOrb {
  color: number;
  emissive: number;
  label: string;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  yOffset: number;
}

const CAPABILITIES: CapabilityOrb[] = [
  { color: 0x00d4ff, emissive: 0x00d4ff, label: 'AI Chat', orbitRadius: 35, orbitSpeed: 0.15, size: 2.5, yOffset: 5 },
  { color: 0xa855f7, emissive: 0xa855f7, label: 'Visual Builder', orbitRadius: 40, orbitSpeed: -0.12, size: 2.8, yOffset: -3 },
  { color: 0xfbbf24, emissive: 0xfbbf24, label: 'Design System', orbitRadius: 45, orbitSpeed: 0.1, size: 2.2, yOffset: 8 },
  { color: 0x22c55e, emissive: 0x22c55e, label: 'Components', orbitRadius: 38, orbitSpeed: -0.18, size: 2.6, yOffset: -6 },
  { color: 0xffffff, emissive: 0xffffff, label: 'Deploy', orbitRadius: 42, orbitSpeed: 0.08, size: 2.4, yOffset: 2 },
  { color: 0xf97316, emissive: 0xf97316, label: 'Collaborate', orbitRadius: 48, orbitSpeed: -0.14, size: 2.3, yOffset: -8 },
];

function Orb({ capability, index }: { capability: CapabilityOrb; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const { shouldAnimate } = useAdaptiveQuality();
  
  const startAngle = (index / CAPABILITIES.length) * Math.PI * 2;
  
  // Trail particles
  const trailGeometry = useMemo(() => {
    const positions = new Float32Array(30 * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (!shouldAnimate || !meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const angle = startAngle + time * capability.orbitSpeed;
    
    // Orbital motion with vertical wave
    const x = Math.cos(angle) * capability.orbitRadius;
    const z = Math.sin(angle) * capability.orbitRadius - 50;
    const y = capability.yOffset + Math.sin(time * 0.5 + index) * 3 + 15;
    
    meshRef.current.position.set(x, y, z);
    
    // Gentle rotation
    meshRef.current.rotation.x = time * 0.5;
    meshRef.current.rotation.y = time * 0.3;
    
    // Pulse effect
    const pulse = 1 + Math.sin(time * 2 + index) * 0.1;
    meshRef.current.scale.setScalar(pulse);
    
    // Update trail
    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
      // Shift positions back
      for (let i = positions.length - 3; i >= 3; i -= 3) {
        positions[i] = positions[i - 3];
        positions[i + 1] = positions[i - 2];
        positions[i + 2] = positions[i - 1];
      }
      // Add new position
      positions[0] = x;
      positions[1] = y;
      positions[2] = z;
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Main orb */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[capability.size, 1]} />
        <meshStandardMaterial
          color={capability.color}
          emissive={capability.emissive}
          emissiveIntensity={1.5}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Wireframe shell */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[capability.size * 1.2, 1]} />
        <meshBasicMaterial
          color={capability.color}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Trail particles */}
      <points ref={trailRef} geometry={trailGeometry}>
        <pointsMaterial
          color={capability.color}
          size={0.8}
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export function CapabilityOrbs() {
  return (
    <group>
      {CAPABILITIES.map((capability, index) => (
        <Orb key={capability.label} capability={capability} index={index} />
      ))}
    </group>
  );
}
