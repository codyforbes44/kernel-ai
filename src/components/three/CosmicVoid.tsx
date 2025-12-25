import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { DEPTH_LAYERS_3D, COLORS_3D } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

// Ray-marched nebula shader
const NebulaShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color(COLORS_3D.nebula1),
    uColor2: new THREE.Color(COLORS_3D.nebula2),
    uColor3: new THREE.Color(COLORS_3D.aurora1),
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
  // Fragment shader with simplified ray marching
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
              
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      return value;
    }
    
    void main() {
      vec3 pos = vPosition * 0.01;
      pos.z += uTime * 0.05;
      
      // Layer multiple noise octaves
      float n1 = fbm(pos);
      float n2 = fbm(pos * 2.0 + vec3(100.0));
      float n3 = fbm(pos * 0.5 + vec3(uTime * 0.02));
      
      // Create nebula density
      float density = smoothstep(-0.2, 0.8, n1 + n2 * 0.5);
      
      // Color mixing
      vec3 color = mix(uColor1, uColor2, n2 * 0.5 + 0.5);
      color = mix(color, uColor3, n3 * 0.3);
      
      // Add glow
      float glow = smoothstep(0.0, 1.0, density) * 0.8;
      color += glow * uColor3 * 0.3;
      
      // Edge fade
      float edgeFade = 1.0 - smoothstep(0.3, 0.5, length(vUv - 0.5));
      
      gl_FragColor = vec4(color, density * edgeFade * 0.6);
    }
  `
);

extend({ NebulaShaderMaterial });

// TypeScript declaration
declare module '@react-three/fiber' {
  interface ThreeElements {
    nebulaShaderMaterial: THREE.ShaderMaterial & {
      uTime: number;
      uColor1: THREE.Color;
      uColor2: THREE.Color;
      uColor3: THREE.Color;
    };
  }
}

export function CosmicVoid() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial & { uTime: number }>(null);
  const { enableRayMarching, shouldAnimate } = useAdaptiveQuality();

  useFrame(({ clock }) => {
    if (!shouldAnimate || !materialRef.current) return;
    materialRef.current.uTime = clock.getElapsedTime();
    
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.01;
    }
  });

  if (!enableRayMarching) {
    // Fallback for low performance
    return (
      <mesh position={[0, 0, DEPTH_LAYERS_3D.VOID]}>
        <sphereGeometry args={[400, 32, 32]} />
        <meshBasicMaterial
          color={COLORS_3D.nebula1}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    );
  }

  return (
    <mesh ref={meshRef} position={[0, 0, DEPTH_LAYERS_3D.VOID]}>
      <sphereGeometry args={[400, 64, 64]} />
      <primitive
        object={new NebulaShaderMaterial()}
        ref={materialRef}
        attach="material"
        transparent
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
