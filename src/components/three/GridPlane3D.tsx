import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS_3D, getScaledPulseConfig, getScaledParticleConfig, getScaledFogSegments } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';
import { VanishingPointGlow } from './VanishingPointGlow';
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
  const numVerticalLines = 41;
  const numHorizontalLines = 25;
  
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
  tiltX?: number; // -1 to 1 for gyroscope left/right tilt
  tiltY?: number; // -1 to 1 for gyroscope forward/back tilt
}

export function GridPlane3D({ isPaused = false, tiltX = 0, tiltY = 0 }: GridPlane3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  
  // Get performance tier for scaling
  const { tier, shouldAnimate } = useAdaptiveQuality();
  
  // Don't animate if paused
  const canAnimate = shouldAnimate && !isPaused;
  
  // Scale counts based on performance tier
  const pulseConfig = useMemo(() => getScaledPulseConfig(tier), [tier]);
  const particleConfig = useMemo(() => getScaledParticleConfig(tier), [tier]);
  
  
  const gridGeometry = useMemo(() => {
    const { positions, colors } = createPerspectiveGrid();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);
  
  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      gridGeometry.dispose();
    };
  }, [gridGeometry]);
  
  // Target rotation based on gyroscope tilt (subtle effect)
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  
  // Subtle animation + gyroscope parallax
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Update material opacity animations
    if (canAnimate) {
      if (materialRef.current) {
        materialRef.current.opacity = 0.7 + Math.sin(time * 0.5) * 0.1;
      }
      
    }
    
    // Apply gyroscope-based parallax rotation (subtle, max ±3 degrees)
    if (groupRef.current) {
      const maxTilt = 0.05; // ~3 degrees in radians
      targetRotation.current.x = tiltY * maxTilt;
      targetRotation.current.y = tiltX * maxTilt;
      
      // Smooth lerp to target rotation
      const lerpFactor = 0.05;
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerpFactor;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerpFactor;
      
      // Base rotation + gyroscope offset
      groupRef.current.rotation.x = -Math.PI * 0.42 + currentRotation.current.x;
      groupRef.current.rotation.y = currentRotation.current.y;
    }
  });
  
  return (
    <group 
      ref={groupRef}
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
      
      {/* Vanishing point star glow - Apple Vision inspired */}
      {canAnimate && <VanishingPointGlow intensity={0.8} pulse godRays />}
    </group>
  );
}
