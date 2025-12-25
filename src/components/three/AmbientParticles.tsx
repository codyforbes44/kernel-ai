import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';
import { DEPTH_LAYERS_3D, COLORS_3D } from '@/constants/depthLayers3D';

export function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { tier, shouldAnimate } = useAdaptiveQuality();
  
  // Particle count based on performance tier
  const particleCount = useMemo(() => {
    switch (tier) {
      case 'ULTRA': return 50;
      case 'HIGH': return 40;
      case 'MEDIUM': return 25;
      case 'LOW': return 15;
      default: return 30;
    }
  }, [tier]);

  // Generate particle positions and attributes
  const { positions, colors, sizes, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    const cyanColor = new THREE.Color(COLORS_3D.primary);
    const magentaColor = new THREE.Color(COLORS_3D.secondary);
    const accentColor = new THREE.Color(COLORS_3D.accent);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Spread particles across the scene, biased toward back
      positions[i3] = (Math.random() - 0.5) * 400;
      positions[i3 + 1] = (Math.random() - 0.5) * 300 - 50;
      positions[i3 + 2] = DEPTH_LAYERS_3D.PARTICLES + Math.random() * 200;
      
      // Slow drift velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.015 + 0.005; // Gentle upward drift
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
      
      // Color variation: mostly cyan, some magenta and accent
      const colorChoice = Math.random();
      let color: THREE.Color;
      if (colorChoice < 0.6) {
        color = cyanColor;
      } else if (colorChoice < 0.85) {
        color = magentaColor;
      } else {
        color = accentColor;
      }
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Small, subtle sizes
      sizes[i] = Math.random() * 0.4 + 0.2;
    }
    
    return { positions, colors, sizes, velocities };
  }, [particleCount]);

  // Animate particles
  useFrame((state) => {
    if (!pointsRef.current || !shouldAnimate) return;
    
    const geometry = pointsRef.current.geometry;
    const positionAttr = geometry.attributes.position;
    const positions = positionAttr.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Apply velocities with subtle wave motion
      positions[i3] += velocities[i3] + Math.sin(time * 0.3 + i) * 0.005;
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      // Wrap particles that drift too far
      if (positions[i3 + 1] > 150) {
        positions[i3 + 1] = -150;
        positions[i3] = (Math.random() - 0.5) * 400;
        positions[i3 + 2] = DEPTH_LAYERS_3D.PARTICLES + Math.random() * 200;
      }
      
      // Horizontal bounds
      if (Math.abs(positions[i3]) > 250) {
        positions[i3] *= -0.5;
      }
    }
    
    positionAttr.needsUpdate = true;
    
    // Subtle rotation of entire particle system
    pointsRef.current.rotation.y = Math.sin(time * 0.05) * 0.02;
  });

  return (
    <points ref={pointsRef} key={`ambient-particles-${particleCount}`}>
      <bufferGeometry key={`ambient-geo-${particleCount}`}>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
