import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS_3D } from '@/constants/depthLayers3D';

// Energy pulse configuration
const PULSE_CONFIG = {
  count: 12,
  speed: 0.4,
  size: 8,
  glowIntensity: 2.5,
};

// Floating particles configuration
const PARTICLE_CONFIG = {
  count: 60,
  speedMin: 0.15,
  speedMax: 0.35,
  sizeMin: 2,
  sizeMax: 5,
  heightMin: 5,
  heightMax: 40,
  spreadX: 400,
};

// Build a perspective grid where vertical lines converge to vanishing point
// and horizontal lines stay parallel (like the Tron reference image)
const createPerspectiveGrid = () => {
  const positions: number[] = [];
  const colors: number[] = [];
  
  const gridWidth = 1200;
  const gridDepth = 600;
  const numVerticalLines = 81; // Odd number for center line
  const numHorizontalLines = 50;
  
  const cyan = new THREE.Color(COLORS_3D.grid);
  const fadedCyan = new THREE.Color(COLORS_3D.grid).multiplyScalar(0.3);
  
  // Vertical lines - converge toward center at the top (horizon)
  const halfLines = Math.floor(numVerticalLines / 2);
  
  for (let i = -halfLines; i <= halfLines; i++) {
    const xBottom = (i / halfLines) * (gridWidth / 2);
    // Lines converge toward center at the horizon
    const convergeFactor = 0.15; // How much lines converge (0 = parallel, 1 = all meet at center)
    const xTop = xBottom * convergeFactor;
    
    // Bottom of grid (close to viewer)
    positions.push(xBottom, 0, 0);
    // Top of grid (horizon)
    positions.push(xTop, gridDepth, 0);
    
    // Color: center lines brighter
    const distFromCenter = Math.abs(i) / halfLines;
    const intensity = 1 - distFromCenter * 0.6;
    const lineColor = cyan.clone().multiplyScalar(intensity);
    
    colors.push(lineColor.r, lineColor.g, lineColor.b);
    colors.push(fadedCyan.r * 0.2, fadedCyan.g * 0.2, fadedCyan.b * 0.2); // Fade at horizon
  }
  
  // Horizontal lines - stay parallel, denser at bottom, sparser toward horizon
  for (let i = 0; i < numHorizontalLines; i++) {
    // Exponential spacing: denser at bottom (close), sparser at top (far)
    const t = i / (numHorizontalLines - 1);
    const y = Math.pow(t, 1.8) * gridDepth;
    
    // Calculate x extent based on perspective (narrower at top)
    const perspectiveScale = 1 - t * (1 - 0.15); // Match convergeFactor
    const xExtent = (gridWidth / 2) * perspectiveScale;
    
    positions.push(-xExtent, y, 0);
    positions.push(xExtent, y, 0);
    
    // Color: fade toward horizon
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
  const cyan = new THREE.Color(COLORS_3D.primary);
  
  for (let i = 0; i < segments; i++) {
    const t1 = i / segments;
    const t2 = (i + 1) / segments;
    const x1 = (t1 - 0.5) * width;
    const x2 = (t2 - 0.5) * width;
    
    positions.push(x1, 0, 0);
    positions.push(x2, 0, 0);
    
    // Glow intensity peaks at center
    const centerDist1 = Math.abs(t1 - 0.5) * 2;
    const centerDist2 = Math.abs(t2 - 0.5) * 2;
    const intensity1 = Math.pow(1 - centerDist1, 2);
    const intensity2 = Math.pow(1 - centerDist2, 2);
    
    colors.push(cyan.r * intensity1, cyan.g * intensity1, cyan.b * intensity1);
    colors.push(cyan.r * intensity2, cyan.g * intensity2, cyan.b * intensity2);
  }
  
  return { positions, colors };
};

// Energy Pulse component
function EnergyPulses() {
  const pulsesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const linesRef = useRef<number[]>([]);
  
  const gridWidth = 1200;
  const gridDepth = 600;
  const numVerticalLines = 81;
  const halfLines = Math.floor(numVerticalLines / 2);
  const convergeFactor = 0.15;
  
  const { positions, colors, velocities, lineIndices } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const velocities: number[] = [];
    const lineIndices: number[] = [];
    
    const cyan = new THREE.Color(COLORS_3D.primary);
    
    for (let i = 0; i < PULSE_CONFIG.count; i++) {
      // Pick a random vertical line
      const lineIndex = Math.floor(Math.random() * numVerticalLines) - halfLines;
      lineIndices.push(lineIndex);
      
      // Random starting position along the line (0 = bottom, 1 = top/horizon)
      const t = Math.random();
      
      // Calculate x position based on line and progress
      const xBottom = (lineIndex / halfLines) * (gridWidth / 2);
      const xTop = xBottom * convergeFactor;
      const x = xBottom + (xTop - xBottom) * t;
      const y = t * gridDepth;
      
      positions.push(x, y, 0.1); // Slightly in front of grid
      
      // Bright cyan color
      colors.push(cyan.r * PULSE_CONFIG.glowIntensity, cyan.g * PULSE_CONFIG.glowIntensity, cyan.b * PULSE_CONFIG.glowIntensity);
      
      // Store velocity (varies slightly per pulse)
      velocities.push(PULSE_CONFIG.speed * (0.8 + Math.random() * 0.4));
    }
    
    return { 
      positions: new Float32Array(positions), 
      colors: new Float32Array(colors),
      velocities: new Float32Array(velocities),
      lineIndices
    };
  }, []);
  
  // Store refs for animation
  velocitiesRef.current = velocities;
  linesRef.current = lineIndices;
  
  useFrame((_, delta) => {
    if (!pulsesRef.current || !velocitiesRef.current) return;
    
    const positionAttr = pulsesRef.current.geometry.attributes.position;
    const colorAttr = pulsesRef.current.geometry.attributes.color;
    const positions = positionAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const cyan = new THREE.Color(COLORS_3D.primary);
    
    for (let i = 0; i < PULSE_CONFIG.count; i++) {
      const idx = i * 3;
      const lineIndex = linesRef.current[i];
      
      // Get current t (progress along line, 0-1)
      let t = positions[idx + 1] / gridDepth;
      
      // Move toward horizon
      t += velocitiesRef.current[i] * delta;
      
      // Reset when reaching horizon
      if (t >= 1) {
        t = 0;
        // Optionally pick a new random line
        const newLineIndex = Math.floor(Math.random() * numVerticalLines) - halfLines;
        linesRef.current[i] = newLineIndex;
        velocitiesRef.current[i] = PULSE_CONFIG.speed * (0.8 + Math.random() * 0.4);
      }
      
      // Recalculate position based on new t
      const currentLineIndex = linesRef.current[i];
      const xBottom = (currentLineIndex / halfLines) * (gridWidth / 2);
      const xTop = xBottom * convergeFactor;
      const x = xBottom + (xTop - xBottom) * t;
      const y = t * gridDepth;
      
      positions[idx] = x;
      positions[idx + 1] = y;
      
      // Fade out as approaching horizon, pulse glow
      const fadeOut = 1 - Math.pow(t, 2);
      const pulse = 0.8 + Math.sin(t * Math.PI * 4) * 0.2;
      const intensity = PULSE_CONFIG.glowIntensity * fadeOut * pulse;
      
      colors[idx] = cyan.r * intensity;
      colors[idx + 1] = cyan.g * intensity;
      colors[idx + 2] = cyan.b * intensity;
    }
    
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });
  
  return (
    <points ref={pulsesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PULSE_CONFIG.count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PULSE_CONFIG.count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={PULSE_CONFIG.size}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// Floating Particles component
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleDataRef = useRef<{ velocities: Float32Array; heights: Float32Array; sizes: Float32Array } | null>(null);
  
  const gridDepth = 600;
  const convergeFactor = 0.15;
  
  const { positions, colors, sizes, velocities, heights } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const velocities: number[] = [];
    const heights: number[] = [];
    
    const cyan = new THREE.Color(COLORS_3D.primary);
    const accent = new THREE.Color(COLORS_3D.accent);
    
    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
      // Random x position within spread
      const x = (Math.random() - 0.5) * PARTICLE_CONFIG.spreadX * 2;
      
      // Random progress along depth (0 = near, 1 = horizon)
      const t = Math.random();
      const y = t * gridDepth;
      
      // Random height above grid
      const height = PARTICLE_CONFIG.heightMin + Math.random() * (PARTICLE_CONFIG.heightMax - PARTICLE_CONFIG.heightMin);
      heights.push(height);
      
      positions.push(x, y, height);
      
      // Mix between cyan and accent color randomly
      const colorMix = Math.random();
      const particleColor = cyan.clone().lerp(accent, colorMix * 0.3);
      const intensity = 0.6 + Math.random() * 0.4;
      colors.push(particleColor.r * intensity, particleColor.g * intensity, particleColor.b * intensity);
      
      // Random size
      const size = PARTICLE_CONFIG.sizeMin + Math.random() * (PARTICLE_CONFIG.sizeMax - PARTICLE_CONFIG.sizeMin);
      sizes.push(size);
      
      // Random velocity
      const velocity = PARTICLE_CONFIG.speedMin + Math.random() * (PARTICLE_CONFIG.speedMax - PARTICLE_CONFIG.speedMin);
      velocities.push(velocity);
    }
    
    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes),
      velocities: new Float32Array(velocities),
      heights: new Float32Array(heights),
    };
  }, []);
  
  particleDataRef.current = { velocities, heights, sizes };
  
  useFrame((state, delta) => {
    if (!particlesRef.current || !particleDataRef.current) return;
    
    const positionAttr = particlesRef.current.geometry.attributes.position;
    const colorAttr = particlesRef.current.geometry.attributes.color;
    const positionsArr = positionAttr.array as Float32Array;
    const colorsArr = colorAttr.array as Float32Array;
    const { velocities, heights } = particleDataRef.current;
    
    const time = state.clock.getElapsedTime();
    const cyan = new THREE.Color(COLORS_3D.primary);
    
    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
      const idx = i * 3;
      
      // Get current t (progress toward horizon)
      let t = positionsArr[idx + 1] / gridDepth;
      
      // Move toward horizon
      t += velocities[i] * delta;
      
      // Reset when reaching horizon
      if (t >= 1) {
        t = 0;
        // Reset x position
        positionsArr[idx] = (Math.random() - 0.5) * PARTICLE_CONFIG.spreadX * 2;
        heights[i] = PARTICLE_CONFIG.heightMin + Math.random() * (PARTICLE_CONFIG.heightMax - PARTICLE_CONFIG.heightMin);
        velocities[i] = PARTICLE_CONFIG.speedMin + Math.random() * (PARTICLE_CONFIG.speedMax - PARTICLE_CONFIG.speedMin);
      }
      
      // Apply perspective convergence to x
      const perspectiveScale = 1 - t * (1 - convergeFactor);
      const originalX = positionsArr[idx] / (1 - (positionsArr[idx + 1] / gridDepth) * (1 - convergeFactor) || 1);
      
      // Update position
      positionsArr[idx] = positionsArr[idx] * 0.998; // Slight x convergence
      positionsArr[idx + 1] = t * gridDepth;
      
      // Gentle floating motion
      const floatOffset = Math.sin(time * 2 + i * 0.5) * 2;
      positionsArr[idx + 2] = heights[i] + floatOffset;
      
      // Fade out toward horizon, twinkle effect
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
          count={PARTICLE_CONFIG.count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_CONFIG.count}
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

export function GridPlane3D() {
  const gridRef = useRef<THREE.LineSegments>(null);
  const horizonRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const horizonMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  
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
  
  // Subtle animation
  useFrame(({ clock }) => {
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
      rotation={[-Math.PI * 0.42, 0, 0]} // Tilt away from camera
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
      <EnergyPulses />
      
      {/* Floating particles above the grid */}
      <FloatingParticles />
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
