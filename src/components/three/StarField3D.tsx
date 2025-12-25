import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DEPTH_LAYERS_3D, COLORS_3D, ANIMATION_SPEEDS } from '@/constants/depthLayers3D';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';

export function StarField3D() {
  const { settings, shouldAnimate } = useAdaptiveQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const starCount = settings.starCount;

  // Generate star positions
  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const scales = new Float32Array(starCount);

    const color = new THREE.Color();
    const starColors = [0xffffff, 0xaaddff, 0xffddaa, 0xddddff, 0x00ffff];

    for (let i = 0; i < starCount; i++) {
      // Distribute in a sphere around camera
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = DEPTH_LAYERS_3D.STARS + Math.random() * 400 - 200;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random star colors
      color.set(starColors[Math.floor(Math.random() * starColors.length)]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Random scales with some larger "bright" stars
      scales[i] = Math.random() < 0.1 ? Math.random() * 2 + 1 : Math.random() * 0.5 + 0.2;
    }

    return { positions, colors, scales };
  }, [starCount]);

  // Animation
  useFrame(({ clock }) => {
    if (!meshRef.current || !shouldAnimate) return;

    const time = clock.getElapsedTime();
    const dummy = new THREE.Object3D();

    // Subtle rotation of entire star field
    meshRef.current.rotation.y = time * ANIMATION_SPEEDS.stars;
    meshRef.current.rotation.x = Math.sin(time * ANIMATION_SPEEDS.stars * 0.5) * 0.1;

    // Update individual stars with twinkle effect
    for (let i = 0; i < Math.min(starCount, 1000); i++) {
      const twinkle = 0.8 + Math.sin(time * 3 + i * 0.1) * 0.2;
      
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      dummy.scale.setScalar(scales[i] * twinkle);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, starCount]}>
      <sphereGeometry args={[0.5, 6, 6]} />
      <meshBasicMaterial
        color={COLORS_3D.star}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}
