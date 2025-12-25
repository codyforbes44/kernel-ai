import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { DEPTH_LAYERS_3D, COLORS_3D } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

// Warp tunnel shader
const WarpShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uSpeed: 1.0,
    uColor1: new THREE.Color(COLORS_3D.primary),
    uColor2: new THREE.Color(COLORS_3D.secondary),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform float uSpeed;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Create tunnel effect
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float angle = atan(center.y, center.x);
      
      // Spiral pattern
      float spiral = sin(angle * 8.0 + dist * 20.0 - uTime * uSpeed * 3.0);
      spiral = spiral * 0.5 + 0.5;
      
      // Radial streaks
      float streaks = sin(angle * 32.0 + uTime * 0.5);
      streaks = pow(max(0.0, streaks), 4.0);
      
      // Speed lines
      float speed = sin(dist * 50.0 - uTime * uSpeed * 5.0);
      speed = pow(max(0.0, speed), 8.0);
      
      // Combine effects
      float pattern = spiral * 0.3 + streaks * 0.4 + speed * 0.5;
      
      // Color based on distance
      vec3 color = mix(uColor1, uColor2, dist * 2.0);
      color *= pattern;
      
      // Vignette
      float vignette = 1.0 - smoothstep(0.2, 0.5, dist);
      
      // Center glow
      float centerGlow = smoothstep(0.5, 0.0, dist) * 0.5;
      color += vec3(1.0) * centerGlow;
      
      gl_FragColor = vec4(color, pattern * vignette * 0.4);
    }
  `
);

extend({ WarpShaderMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    warpShaderMaterial: THREE.ShaderMaterial & {
      uTime: number;
      uSpeed: number;
      uColor1: THREE.Color;
      uColor2: THREE.Color;
    };
  }
}

export function WarpTunnel() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial & { uTime: number }>(null);
  const { shouldAnimate, enableRayMarching } = useAdaptiveQuality();

  // Memoize material to prevent recreation on every render
  const material = useMemo(() => {
    const mat = new WarpShaderMaterial();
    mat.transparent = true;
    mat.side = THREE.BackSide;
    mat.depthWrite = false;
    mat.blending = THREE.AdditiveBlending;
    return mat;
  }, []);

  useFrame(({ clock }) => {
    if (!shouldAnimate || !materialRef.current) return;
    materialRef.current.uTime = clock.getElapsedTime();
  });

  if (!enableRayMarching) return null;

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, DEPTH_LAYERS_3D.HYPERSPACE]}
      rotation={[0, 0, 0]}
    >
      <cylinderGeometry args={[500, 200, 1000, 64, 1, true]} />
      <primitive
        object={material}
        ref={materialRef}
        attach="material"
      />
    </mesh>
  );
}
