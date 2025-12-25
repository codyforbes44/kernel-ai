import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

const STREAM_COUNT = 8;
const PARTICLES_PER_STREAM = 50;

export function DataStreams() {
  const pointsRef = useRef<THREE.Points>(null);
  const { shouldAnimate, tier } = useAdaptiveQuality();
  
  // Reduce particles on lower tiers
  const particleCount = tier === 'ULTRA' ? STREAM_COUNT * PARTICLES_PER_STREAM : 
                        tier === 'HIGH' ? STREAM_COUNT * 30 : 
                        STREAM_COUNT * 15;

  const { positions, colors, velocities, streamIndices } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);
    const streamIndices = new Float32Array(particleCount);
    
    const colorPalette = [
      new THREE.Color(0x00ffff), // Cyan
      new THREE.Color(0xff00ff), // Magenta
      new THREE.Color(0x00ff88), // Green
      new THREE.Color(0xfbbf24), // Amber
    ];
    
    for (let i = 0; i < particleCount; i++) {
      const streamIndex = i % STREAM_COUNT;
      const t = (i % (particleCount / STREAM_COUNT)) / (particleCount / STREAM_COUNT);
      
      // Spiral paths emanating from center
      const angle = (streamIndex / STREAM_COUNT) * Math.PI * 2;
      const radius = 20 + t * 60;
      const heightVar = Math.sin(t * Math.PI * 4) * 15;
      
      positions[i * 3] = Math.cos(angle + t * 2) * radius;
      positions[i * 3 + 1] = heightVar + 15;
      positions[i * 3 + 2] = Math.sin(angle + t * 2) * radius - 50;
      
      const color = colorPalette[streamIndex % colorPalette.length];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      velocities[i] = 0.5 + Math.random() * 1.5;
      streamIndices[i] = streamIndex;
    }
    
    return { positions, colors, velocities, streamIndices };
  }, [particleCount]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame((state) => {
    if (!shouldAnimate || !pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionAttr = pointsRef.current.geometry.attributes.position;
    const posArray = positionAttr.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const streamIndex = streamIndices[i];
      const velocity = velocities[i];
      const baseAngle = (streamIndex / STREAM_COUNT) * Math.PI * 2;
      
      // Progress along the stream
      let t = ((time * velocity * 0.1) + (i / particleCount)) % 1;
      
      // Spiral motion
      const radius = 15 + t * 65;
      const angle = baseAngle + t * 3 + Math.sin(time * 0.5) * 0.2;
      const heightWave = Math.sin(t * Math.PI * 3 + time) * 12;
      
      posArray[i * 3] = Math.cos(angle) * radius;
      posArray[i * 3 + 1] = heightWave + 15 + Math.sin(time + i) * 2;
      posArray[i * 3 + 2] = Math.sin(angle) * radius - 50;
    }
    
    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={1.2}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
