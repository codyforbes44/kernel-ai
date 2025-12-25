import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

interface LogoCoreProps {
  scrollProgress: number;
  isHovered: boolean;
  isActive: boolean;
}

function LogoCore({ scrollProgress, isHovered, isActive }: LogoCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Base rotation
      const baseRotation = state.clock.elapsedTime * 0.3;
      
      // Scroll-based depth effect - tilts as user scrolls
      const scrollTilt = scrollProgress * 0.5;
      
      // Hover effect
      const hoverScale = isHovered ? 1.1 : 1;
      const activeScale = isActive ? 1.15 : 1;
      
      groupRef.current.rotation.y = baseRotation + (isHovered ? 0.2 : 0);
      groupRef.current.rotation.x = scrollTilt;
      groupRef.current.scale.setScalar(hoverScale * activeScale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.8;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }

    if (coreRef.current) {
      // Pulsing core
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      coreRef.current.scale.setScalar(0.35 * pulse);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={3} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Main crystal */}
        <mesh>
          <dodecahedronGeometry args={[0.5, 0]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.3}
            chromaticAberration={0.15}
            anisotropy={0.2}
            distortion={0.1}
            distortionScale={0.1}
            temporalDistortion={0.05}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color="#00d4ff"
            transmission={0.95}
            roughness={0.05}
            ior={1.5}
          />
        </mesh>

        {/* Inner energy core */}
        <mesh ref={coreRef} scale={0.35}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffd700"
            emissiveIntensity={isActive ? 3 : 2}
            toneMapped={false}
          />
        </mesh>
      </Float>

      {/* Orbital ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.8, 0.015, 16, 64]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={isHovered ? 1.5 : 0.8}
          toneMapped={false}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Micro particles */}
      <MicroParticles />
    </group>
  );
}

function MicroParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 20;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.9 + Math.random() * 0.2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#00d4ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

interface KernelLogoMini3DProps {
  className?: string;
  scrollProgress?: number;
  isHovered?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function KernelLogoMini3D({ 
  className, 
  scrollProgress = 0, 
  isHovered = false,
  isActive = false,
  onClick 
}: KernelLogoMini3DProps) {
  return (
    <div 
      className={className} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-3, -3, -3]} intensity={0.4} color="#00d4ff" />
        
        <LogoCore 
          scrollProgress={scrollProgress} 
          isHovered={isHovered}
          isActive={isActive}
        />
      </Canvas>
    </div>
  );
}
