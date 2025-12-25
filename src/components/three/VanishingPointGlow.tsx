import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VanishingPointGlowProps {
  /** Position of the vanishing point */
  position?: [number, number, number];
  /** Base color of the glow */
  color?: string;
  /** Intensity of the glow */
  intensity?: number;
  /** Enable pulsing animation */
  pulse?: boolean;
  /** Enable god rays effect */
  godRays?: boolean;
}

export function VanishingPointGlow({
  position = [0, 600, -50],
  color = '#00ffff',
  intensity = 1,
  pulse = true,
  godRays = true,
}: VanishingPointGlowProps) {
  const glowRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);
  
  const baseColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Pulse the main glow
    if (glowRef.current && pulse) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      const pulseIntensity = 0.3 + Math.sin(time * 0.5) * 0.15 + Math.sin(time * 1.3) * 0.05;
      material.opacity = pulseIntensity * intensity;
      
      // Subtle scale pulse
      const scale = 1 + Math.sin(time * 0.3) * 0.1;
      glowRef.current.scale.setScalar(scale);
    }
    
    // Animate god rays
    if (raysRef.current && godRays) {
      raysRef.current.rotation.z = time * 0.02;
      
      // Pulse ray opacity
      raysRef.current.children.forEach((ray, i) => {
        const mesh = ray as THREE.Mesh;
        const material = mesh.material as THREE.MeshBasicMaterial;
        const offset = i * 0.5;
        material.opacity = (0.05 + Math.sin(time * 0.4 + offset) * 0.03) * intensity;
      });
    }
  });

  // Create god ray geometry
  const rayGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(-30, 800);
    shape.lineTo(30, 800);
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <group position={position}>
      {/* Central star glow */}
      <mesh ref={glowRef}>
        <circleGeometry args={[80, 32]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.3 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Inner bright core */}
      <mesh position={[0, 0, 1]}>
        <circleGeometry args={[20, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.5 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* God rays emanating from center */}
      {godRays && (
        <group ref={raysRef} position={[0, 0, -5]}>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <mesh
                key={i}
                geometry={rayGeometry}
                rotation={[0, 0, angle]}
              >
                <meshBasicMaterial
                  color={baseColor}
                  transparent
                  opacity={0.05 * intensity}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
            );
          })}
        </group>
      )}
      
      {/* Outer halo */}
      <mesh position={[0, 0, -2]}>
        <ringGeometry args={[100, 250, 64]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.08 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Layered fog planes for atmospheric depth
interface LayeredFogProps {
  /** Number of fog layers */
  layers?: number;
  /** Base opacity */
  opacity?: number;
}

export function LayeredFog({ layers = 5, opacity = 0.1 }: LayeredFogProps) {
  const fogRefs = useRef<(THREE.Mesh | null)[]>([]);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    fogRefs.current.forEach((fog, i) => {
      if (!fog) return;
      
      const material = fog.material as THREE.MeshBasicMaterial;
      const offset = i * 0.3;
      
      // Subtle opacity breathing
      material.opacity = opacity * (0.8 + Math.sin(time * 0.2 + offset) * 0.2);
      
      // Very subtle drift
      fog.position.x = Math.sin(time * 0.05 + offset) * 20;
    });
  });

  return (
    <group position={[0, 500, 0]}>
      {Array.from({ length: layers }).map((_, i) => {
        const depth = -i * 30;
        const scale = 1 + i * 0.15;
        const fadeOpacity = opacity * (1 - i / layers);
        
        return (
          <mesh
            key={i}
            ref={(el) => (fogRefs.current[i] = el)}
            position={[0, i * 20, depth]}
            scale={[scale, 0.3, 1]}
          >
            <planeGeometry args={[2000, 200]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={fadeOpacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Color-shifting grid lines based on depth
interface DepthColorGridProps {
  /** Enable color shifting */
  enabled?: boolean;
}

export function DepthColorGradient({ enabled = true }: DepthColorGridProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    colorNear: { value: new THREE.Color('#00ffff') },
    colorFar: { value: new THREE.Color('#8844ff') },
  }), []);

  useFrame(({ clock }) => {
    if (materialRef.current && enabled) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying float vDepth;
    
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vDepth = -mvPosition.z / 1000.0;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 colorNear;
    uniform vec3 colorFar;
    varying vec2 vUv;
    varying float vDepth;
    
    void main() {
      float depth = clamp(vDepth, 0.0, 1.0);
      vec3 color = mix(colorNear, colorFar, depth);
      
      // Add time-based color shift
      color += vec3(sin(time * 0.5) * 0.1, 0.0, cos(time * 0.3) * 0.1);
      
      // Fade out at edges
      float alpha = 1.0 - depth * 0.5;
      
      gl_FragColor = vec4(color, alpha * 0.5);
    }
  `;

  if (!enabled) return null;

  return (
    <mesh position={[0, 300, -100]}>
      <planeGeometry args={[1000, 600]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
