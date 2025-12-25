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
