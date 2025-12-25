import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { DEPTH_LAYERS_3D, COLORS_3D } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

// Custom aurora shader material
const AuroraShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color(COLORS_3D.aurora1),
    uColor2: new THREE.Color(COLORS_3D.aurora2),
    uColor3: new THREE.Color(COLORS_3D.aurora3),
    uIntensity: 1.0,
  },
  // Vertex shader
  `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      vUv = uv;
      
      // Create wave effect
      float elevation = sin(position.x * 0.02 + uTime) * 10.0;
      elevation += sin(position.y * 0.03 + uTime * 0.5) * 8.0;
      elevation += sin(position.x * 0.01 + position.y * 0.02 + uTime * 0.3) * 15.0;
      
      vElevation = elevation;
      
      vec3 newPosition = position;
      newPosition.z += elevation;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uIntensity;
    
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      // Create flowing aurora pattern
      float pattern = sin(vUv.x * 10.0 + uTime) * cos(vUv.y * 8.0 + uTime * 0.5);
      pattern += sin(vUv.x * 5.0 - uTime * 0.3) * 0.5;
      pattern = pattern * 0.5 + 0.5;
      
      // Color mixing based on pattern and elevation
      vec3 color = mix(uColor1, uColor2, pattern);
      color = mix(color, uColor3, sin(vElevation * 0.1 + uTime) * 0.5 + 0.5);
      
      // Vertical fade
      float alpha = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
      alpha *= (0.3 + pattern * 0.4) * uIntensity;
      
      // Add glow
      color += vec3(0.1, 0.2, 0.3) * pattern * 0.5;
      
      gl_FragColor = vec4(color, alpha * 0.6);
    }
  `
);

extend({ AuroraShaderMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    auroraShaderMaterial: THREE.ShaderMaterial & {
      uTime: number;
      uColor1: THREE.Color;
      uColor2: THREE.Color;
      uColor3: THREE.Color;
      uIntensity: number;
    };
  }
}

export function AuroraPlane3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial & { uTime: number }>(null);
  const { shouldAnimate } = useAdaptiveQuality();

  // Memoize material to prevent recreation on every render
  const material = useMemo(() => {
    const mat = new AuroraShaderMaterial();
    mat.transparent = true;
    mat.side = THREE.DoubleSide;
    mat.depthWrite = false;
    mat.blending = THREE.AdditiveBlending;
    return mat;
  }, []);

  useFrame(({ clock }) => {
    if (!shouldAnimate || !materialRef.current) return;
    materialRef.current.uTime = clock.getElapsedTime() * 0.5;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 50, DEPTH_LAYERS_3D.AURORA]}
      rotation={[-Math.PI * 0.3, 0, 0]}
    >
      <planeGeometry args={[600, 300, 128, 64]} />
      <primitive
        object={material}
        ref={materialRef}
        attach="material"
      />
    </mesh>
  );
}
