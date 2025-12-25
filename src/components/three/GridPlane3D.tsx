import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS_3D } from '@/constants/depthLayers3D';

// Build a perspective grid where vertical lines converge to vanishing point
// and horizontal lines stay parallel (like the Tron reference image)
const createPerspectiveGrid = () => {
  const positions: number[] = [];
  const colors: number[] = [];
  
  const gridWidth = 400;
  const gridDepth = 600;
  const numVerticalLines = 41; // Odd number for center line
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
  
  const width = 800;
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
      position={[0, -60, -150]}
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
