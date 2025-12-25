import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function HeroAICore() {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const { shouldAnimate } = useAdaptiveQuality();

  // Create hexagonal prism geometry
  const hexGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = 8;
    
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    
    const extrudeSettings = {
      depth: 12,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 0.5,
      bevelSegments: 3,
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Wireframe ring geometry
  const ringGeometry = useMemo(() => {
    return new THREE.TorusGeometry(12, 0.15, 8, 6);
  }, []);

  useFrame((state) => {
    if (!shouldAnimate) return;
    
    const time = state.clock.getElapsedTime();
    
    // Rotate the entire group slowly
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
      groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }
    
    // Pulse the inner core
    if (innerRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      innerRef.current.scale.setScalar(pulse);
      
      // Update emissive intensity
      const material = innerRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1.5 + Math.sin(time * 3) * 0.5;
    }
    
    // Rotate rings independently
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x = time * (0.3 + i * 0.1);
        ring.rotation.z = time * (0.2 - i * 0.05);
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 15, -50]}>
      {/* Inner glowing core */}
      <mesh ref={innerRef} geometry={hexGeometry} position={[0, 0, -6]}>
        <meshStandardMaterial
          color={0x00ffff}
          emissive={0x00ffff}
          emissiveIntensity={2}
          transparent
          opacity={0.9}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Outer wireframe shell */}
      <mesh ref={outerRef} geometry={hexGeometry} position={[0, 0, -6]} scale={1.1}>
        <meshBasicMaterial
          color={0x00ffff}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Orbiting rings */}
      <group ref={ringsRef}>
        <mesh geometry={ringGeometry} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={0xff00ff} transparent opacity={0.6} />
        </mesh>
        <mesh geometry={ringGeometry} rotation={[Math.PI / 3, Math.PI / 4, 0]} scale={1.3}>
          <meshBasicMaterial color={0x00ffff} transparent opacity={0.4} />
        </mesh>
        <mesh geometry={ringGeometry} rotation={[Math.PI / 4, -Math.PI / 3, 0]} scale={1.6}>
          <meshBasicMaterial color={0x00ff88} transparent opacity={0.3} />
        </mesh>
      </group>
      
      {/* Central point light */}
      <pointLight color={0x00ffff} intensity={2} distance={80} decay={2} />
    </group>
  );
}
