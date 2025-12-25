import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DEPTH_LAYERS_3D, COLORS_3D, ANIMATION_SPEEDS } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

export function ParticleSystem3D() {
  const { settings, shouldAnimate } = useAdaptiveQuality();
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = settings.particleCount;

  // Initialize particles
  const particles = useMemo(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 300,
          DEPTH_LAYERS_3D.PARTICLES + (Math.random() - 0.5) * 100
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1 + 0.05, // Slight upward drift
          (Math.random() - 0.5) * 0.1
        ),
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 100,
        size: Math.random() * 2 + 0.5,
      });
    }
    return particles;
  }, [particleCount]);

  // Create geometry
  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color1 = new THREE.Color(COLORS_3D.primary);
    const color2 = new THREE.Color(COLORS_3D.secondary);
    const color3 = new THREE.Color(COLORS_3D.accent);
    const colorOptions = [color1, color2, color3];

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      const color = colorOptions[Math.floor(Math.random() * 3)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = p.size;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return geometry;
  }, [particles, particleCount]);

  // Animation loop
  useFrame(({ clock }) => {
    if (!pointsRef.current || !shouldAnimate) return;

    const time = clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position;
    const sizes = pointsRef.current.geometry.attributes.size;

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      
      // Update life
      p.life += ANIMATION_SPEEDS.particles * 100;
      if (p.life > p.maxLife) {
        // Reset particle
        p.life = 0;
        p.position.set(
          (Math.random() - 0.5) * 400,
          -150,
          DEPTH_LAYERS_3D.PARTICLES + (Math.random() - 0.5) * 100
        );
      }

      // Apply velocity with subtle wave motion
      p.position.add(p.velocity);
      p.position.x += Math.sin(time + i * 0.1) * 0.02;
      p.position.z += Math.cos(time * 0.5 + i * 0.05) * 0.01;

      // Boundary wrap
      if (p.position.y > 150) p.position.y = -150;
      if (Math.abs(p.position.x) > 200) p.position.x *= -0.5;

      // Update geometry
      positions.setXYZ(i, p.position.x, p.position.y, p.position.z);
      
      // Fade based on life
      const lifeRatio = p.life / p.maxLife;
      const fade = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.9 ? (1 - lifeRatio) * 10 : 1;
      sizes.setX(i, p.size * fade);
    }

    positions.needsUpdate = true;
    sizes.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={2}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
