import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

// Core logo geometry that morphs and glows
function LogoCore({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle rotation based on mouse
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mousePosition.y * 0.3,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mousePosition.x * 0.3 + state.clock.elapsedTime * 0.1,
        0.05
      );
    }
    
    if (glowRef.current) {
      // Pulsing glow
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
    
    if (ringRef.current) {
      // Orbiting ring
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group>
      {/* Outer glow sphere */}
      <mesh ref={glowRef} scale={1.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main logo container */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group ref={groupRef}>
          {/* Core dodecahedron */}
          <mesh>
            <dodecahedronGeometry args={[0.8, 0]} />
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.5}
              chromaticAberration={0.2}
              anisotropy={0.3}
              distortion={0.2}
              distortionScale={0.2}
              temporalDistortion={0.1}
              iridescence={1}
              iridescenceIOR={1}
              iridescenceThicknessRange={[0, 1400]}
              color="#00d4ff"
              transmission={0.9}
              roughness={0.1}
              ior={1.5}
            />
          </mesh>

          {/* Inner core energy */}
          <mesh scale={0.4}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#ffd700"
              emissive="#ffd700"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Float>

      {/* Orbiting ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* Particle orbit */}
      <OrbitingParticles />
    </group>
  );
}

// Orbiting particles around the logo
function OrbitingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.8 + Math.random() * 0.4;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
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
        size={0.04}
        color="#00d4ff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Neural network connections
function NeuralNetwork() {
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const nodeCount = 12;
    const nodes: THREE.Vector3[] = [];
    
    // Create nodes on a sphere
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 2.2;
      nodes.push(new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius
      ));
    }
    
    // Connect nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 2.5) {
          points.push(nodes[i], nodes[j]);
        }
      }
    }
    
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#00d4ff" transparent opacity={0.15} />
    </lineSegments>
  );
}

// Scene with mouse tracking
function Scene() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    setMousePosition({
      x: (pointer.x * viewport.width) / 2,
      y: (pointer.y * viewport.height) / 2,
    });
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d4ff" />
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={1}
        intensity={1}
        color="#ffd700"
      />
      
      <LogoCore mousePosition={mousePosition} />
      <NeuralNetwork />
      
      <Environment preset="night" />
    </>
  );
}

interface KernelLogo3DProps {
  className?: string;
}

export function KernelLogo3D({ className }: KernelLogo3DProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
