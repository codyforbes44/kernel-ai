import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS_3D, getScaledPulseConfig, getScaledParticleConfig, getScaledFogSegments } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

// Shared color instances to avoid per-frame allocations
const sharedColors = {
  cyan: new THREE.Color(COLORS_3D.primary),
  grid: new THREE.Color(COLORS_3D.grid),
  accent: new THREE.Color(COLORS_3D.accent),
  magenta: new THREE.Color('#ff00ff'),
  white: new THREE.Color('#ffffff'),
  purple: new THREE.Color('#8844ff'),
};

// Build a perspective grid where vertical lines converge to vanishing point
const createPerspectiveGrid = () => {
  const positions: number[] = [];
  const colors: number[] = [];
  
  const gridWidth = 1200;
  const gridDepth = 600;
  const numVerticalLines = 81;
  const numHorizontalLines = 50;
  
  const cyan = sharedColors.grid.clone();
  const fadedCyan = sharedColors.grid.clone().multiplyScalar(0.3);
  
  const halfLines = Math.floor(numVerticalLines / 2);
  
  for (let i = -halfLines; i <= halfLines; i++) {
    const xBottom = (i / halfLines) * (gridWidth / 2);
    const convergeFactor = 0.15;
    const xTop = xBottom * convergeFactor;
    
    positions.push(xBottom, 0, 0);
    positions.push(xTop, gridDepth, 0);
    
    const distFromCenter = Math.abs(i) / halfLines;
    const intensity = 1 - distFromCenter * 0.6;
    const lineColor = cyan.clone().multiplyScalar(intensity);
    
    colors.push(lineColor.r, lineColor.g, lineColor.b);
    colors.push(fadedCyan.r * 0.2, fadedCyan.g * 0.2, fadedCyan.b * 0.2);
  }
  
  for (let i = 0; i < numHorizontalLines; i++) {
    const t = i / (numHorizontalLines - 1);
    const y = Math.pow(t, 1.8) * gridDepth;
    
    const perspectiveScale = 1 - t * (1 - 0.15);
    const xExtent = (gridWidth / 2) * perspectiveScale;
    
    positions.push(-xExtent, y, 0);
    positions.push(xExtent, y, 0);
    
    const fadeIntensity = 1 - Math.pow(t, 0.8);
    const lineColor = cyan.clone().multiplyScalar(fadeIntensity * 0.8);
    
    colors.push(lineColor.r, lineColor.g, lineColor.b);
    colors.push(lineColor.r, lineColor.g, lineColor.b);
  }
  
  return { positions, colors };
};

// Create horizon glow line
const createHorizonLine = () => {
  const positions: number[] = [];
  const colors: number[] = [];
  
  const width = 1500;
  const segments = 100;
  const cyan = sharedColors.cyan;
  
  for (let i = 0; i < segments; i++) {
    const t1 = i / segments;
    const t2 = (i + 1) / segments;
    const x1 = (t1 - 0.5) * width;
    const x2 = (t2 - 0.5) * width;
    
    positions.push(x1, 0, 0);
    positions.push(x2, 0, 0);
    
    const centerDist1 = Math.abs(t1 - 0.5) * 2;
    const centerDist2 = Math.abs(t2 - 0.5) * 2;
    const intensity1 = Math.pow(1 - centerDist1, 2);
    const intensity2 = Math.pow(1 - centerDist2, 2);
    
    colors.push(cyan.r * intensity1, cyan.g * intensity1, cyan.b * intensity1);
    colors.push(cyan.r * intensity2, cyan.g * intensity2, cyan.b * intensity2);
  }
  
  return { positions, colors };
};

// Energy Pulse component with performance scaling
function EnergyPulses({ pulseCount }: { pulseCount: number }) {
  const pulsesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const linesRef = useRef<number[]>([]);
  
  const gridWidth = 1200;
  const gridDepth = 600;
  const numVerticalLines = 81;
  const halfLines = Math.floor(numVerticalLines / 2);
  const convergeFactor = 0.15;
  
  const config = useMemo(() => getScaledPulseConfig('HIGH'), []);
  const count = pulseCount;
  
  const { positions, colors, velocities, lineIndices } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const velocities: number[] = [];
    const lineIndices: number[] = [];
    
    const cyan = sharedColors.cyan;
    
    for (let i = 0; i < count; i++) {
      const lineIndex = Math.floor(Math.random() * numVerticalLines) - halfLines;
      lineIndices.push(lineIndex);
      
      const t = Math.random();
      const xBottom = (lineIndex / halfLines) * (gridWidth / 2);
      const xTop = xBottom * convergeFactor;
      const x = xBottom + (xTop - xBottom) * t;
      const y = t * gridDepth;
      
      positions.push(x, y, 0.1);
      colors.push(cyan.r * config.glowIntensity, cyan.g * config.glowIntensity, cyan.b * config.glowIntensity);
      velocities.push(config.speed * (0.8 + Math.random() * 0.4));
    }
    
    return { 
      positions: new Float32Array(positions), 
      colors: new Float32Array(colors),
      velocities: new Float32Array(velocities),
      lineIndices
    };
  }, [count, config]);
  
  velocitiesRef.current = velocities;
  linesRef.current = lineIndices;
  
  // Reusable color for animation
  const animColorRef = useRef(sharedColors.cyan.clone());
  
  useFrame((_, delta) => {
    if (!pulsesRef.current || !velocitiesRef.current) return;
    
    // Cap delta to prevent jumps after tab backgrounding
    const clampedDelta = Math.min(delta, 0.1);
    
    const positionAttr = pulsesRef.current.geometry.attributes.position;
    const colorAttr = pulsesRef.current.geometry.attributes.color;
    const positionsArr = positionAttr.array as Float32Array;
    const colorsArr = colorAttr.array as Float32Array;
    const cyan = animColorRef.current;
    
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const lineIndex = linesRef.current[i];
      
      let t = positionsArr[idx + 1] / gridDepth;
      t += velocitiesRef.current[i] * clampedDelta;
      
      if (t >= 1) {
        t = 0;
        const newLineIndex = Math.floor(Math.random() * numVerticalLines) - halfLines;
        linesRef.current[i] = newLineIndex;
        velocitiesRef.current[i] = config.speed * (0.8 + Math.random() * 0.4);
      }
      
      const currentLineIndex = linesRef.current[i];
      const xBottom = (currentLineIndex / halfLines) * (gridWidth / 2);
      const xTop = xBottom * convergeFactor;
      const x = xBottom + (xTop - xBottom) * t;
      const y = t * gridDepth;
      
      positionsArr[idx] = x;
      positionsArr[idx + 1] = y;
      
      const fadeOut = 1 - Math.pow(t, 2);
      const pulse = 0.8 + Math.sin(t * Math.PI * 4) * 0.2;
      const intensity = config.glowIntensity * fadeOut * pulse;
      
      colorsArr[idx] = cyan.r * intensity;
      colorsArr[idx + 1] = cyan.g * intensity;
      colorsArr[idx + 2] = cyan.b * intensity;
    }
    
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });
  
  return (
    <points ref={pulsesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={config.size}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// Horizon Fog component with performance scaling
function HorizonFog({ segments }: { segments: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const width = 1600;
    const height = 200;
    
    const geo = new THREE.PlaneGeometry(width, height, segments, segments);
    const colors: number[] = [];
    
    const positions = geo.attributes.position.array;
    const cyan = sharedColors.cyan;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      
      const normalizedY = (y + height / 2) / height;
      const verticalFade = Math.pow(1 - Math.abs(normalizedY - 0.3) * 1.5, 2);
      
      const normalizedX = Math.abs(x) / (width / 2);
      const horizontalFade = Math.pow(1 - normalizedX, 1.5);
      
      const intensity = Math.max(0, verticalFade * horizontalFade * 0.6);
      
      colors.push(cyan.r * intensity, cyan.g * intensity, cyan.b * intensity);
    }
    
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geo;
  }, [segments]);
  
  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.4 + Math.sin(time * 0.3) * 0.1;
    }
  });
  
  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 580, 5]}>
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// Floating Particles component with performance scaling
function FloatingParticles({ particleCount }: { particleCount: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleDataRef = useRef<{ velocities: Float32Array; heights: Float32Array; sizes: Float32Array } | null>(null);
  
  const gridDepth = 600;
  const convergeFactor = 0.15;
  
  const config = useMemo(() => getScaledParticleConfig('HIGH'), []);
  const count = particleCount;
  
  const { positions, colors, sizes, velocities, heights } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const velocities: number[] = [];
    const heights: number[] = [];
    
    const { cyan, accent, magenta, white, purple } = sharedColors;
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * config.spreadX * 2;
      const t = Math.random();
      const y = t * gridDepth;
      
      const height = config.heightMin + Math.random() * (config.heightMax - config.heightMin);
      heights.push(height);
      
      positions.push(x, y, height);
      
      const colorChoice = Math.random();
      let particleColor: THREE.Color;
      if (colorChoice < 0.4) {
        particleColor = cyan.clone();
      } else if (colorChoice < 0.6) {
        particleColor = cyan.clone().lerp(magenta, Math.random() * 0.5);
      } else if (colorChoice < 0.75) {
        particleColor = purple.clone().lerp(cyan, Math.random() * 0.3);
      } else if (colorChoice < 0.9) {
        particleColor = accent.clone().lerp(cyan, Math.random() * 0.4);
      } else {
        particleColor = white.clone().lerp(cyan, 0.3);
      }
      
      const intensity = 0.7 + Math.random() * 0.5;
      colors.push(particleColor.r * intensity, particleColor.g * intensity, particleColor.b * intensity);
      
      const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
      sizes.push(size);
      
      const velocity = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
      velocities.push(velocity);
    }
    
    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes),
      velocities: new Float32Array(velocities),
      heights: new Float32Array(heights),
    };
  }, [count, config]);
  
  particleDataRef.current = { velocities, heights, sizes };
  
  // Reusable color for animation
  const animColorRef = useRef(sharedColors.cyan.clone());
  
  useFrame((state, delta) => {
    if (!particlesRef.current || !particleDataRef.current) return;
    
    // Cap delta to prevent jumps
    const clampedDelta = Math.min(delta, 0.1);
    
    const positionAttr = particlesRef.current.geometry.attributes.position;
    const colorAttr = particlesRef.current.geometry.attributes.color;
    const positionsArr = positionAttr.array as Float32Array;
    const colorsArr = colorAttr.array as Float32Array;
    const { velocities, heights } = particleDataRef.current;
    
    const time = state.clock.getElapsedTime();
    const cyan = animColorRef.current;
    
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      let t = positionsArr[idx + 1] / gridDepth;
      t += velocities[i] * clampedDelta;
      
      if (t >= 1) {
        t = 0;
        positionsArr[idx] = (Math.random() - 0.5) * config.spreadX * 2;
        heights[i] = config.heightMin + Math.random() * (config.heightMax - config.heightMin);
        velocities[i] = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
      }
      
      positionsArr[idx] = positionsArr[idx] * 0.998;
      positionsArr[idx + 1] = t * gridDepth;
      
      const floatOffset = Math.sin(time * 2 + i * 0.5) * 2;
      positionsArr[idx + 2] = heights[i] + floatOffset;
      
      const fadeOut = 1 - Math.pow(t, 1.5);
      const twinkle = 0.7 + Math.sin(time * 3 + i * 1.7) * 0.3;
      const intensity = fadeOut * twinkle * 0.8;
      
      colorsArr[idx] = cyan.r * intensity;
      colorsArr[idx + 1] = cyan.g * intensity;
      colorsArr[idx + 2] = cyan.b * intensity;
    }
    
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

interface GridPlane3DProps {
  isPaused?: boolean;
}

export function GridPlane3D({ isPaused = false }: GridPlane3DProps) {
  const gridRef = useRef<THREE.LineSegments>(null);
  const horizonRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const horizonMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  
  // Get performance tier for scaling
  const { tier, shouldAnimate } = useAdaptiveQuality();
  
  // Don't animate if paused
  const canAnimate = shouldAnimate && !isPaused;
  
  // Scale counts based on performance tier
  const pulseConfig = useMemo(() => getScaledPulseConfig(tier), [tier]);
  const particleConfig = useMemo(() => getScaledParticleConfig(tier), [tier]);
  const fogSegments = useMemo(() => getScaledFogSegments(tier), [tier]);
  
  const gridGeometry = useMemo(() => {
    const { positions, colors } = createPerspectiveGrid();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);
  
  const horizonGeometry = useMemo(() => {
    const { positions, colors } = createHorizonLine();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);
  
  // Cleanup geometries on unmount
  useEffect(() => {
    return () => {
      gridGeometry.dispose();
      horizonGeometry.dispose();
    };
  }, [gridGeometry, horizonGeometry]);
  
  // Subtle animation - skip if reduced motion or paused
  useFrame(({ clock }) => {
    if (!canAnimate) return;
    
    const time = clock.getElapsedTime();
    
    if (materialRef.current) {
      materialRef.current.opacity = 0.7 + Math.sin(time * 0.5) * 0.1;
    }
    
    if (horizonMaterialRef.current) {
      horizonMaterialRef.current.opacity = 0.8 + Math.sin(time * 0.8) * 0.15;
    }
  });
  
  return (
    <group 
      position={[0, -120, -100]}
      rotation={[-Math.PI * 0.42, 0, 0]}
    >
      {/* Main perspective grid */}
      <lineSegments ref={gridRef} geometry={gridGeometry}>
        <lineBasicMaterial
          ref={materialRef}
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      
      {/* Energy pulses traveling along grid lines */}
      {canAnimate && <EnergyPulses pulseCount={pulseConfig.count} />}
      
      {/* Floating particles above the grid */}
      {canAnimate && <FloatingParticles particleCount={particleConfig.count} />}
      
      {/* Horizon fog for atmospheric depth */}
      <HorizonFog segments={fogSegments} />
      
      {/* Horizon glow line */}
      <group position={[0, 600, 0]}>
        <lineSegments ref={horizonRef} geometry={horizonGeometry}>
          <lineBasicMaterial
            ref={horizonMaterialRef}
            vertexColors
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            linewidth={2}
          />
        </lineSegments>
      </group>
    </group>
  );
}
