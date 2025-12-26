import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useThreePerformance';
import { DEPTH_LAYERS_3D, COLORS_3D } from '@/constants/depthLayers3D';

interface ConstellationFieldProps {
  isPaused?: boolean;
  tiltX?: number;
  tiltY?: number;
}

interface StarLayer {
  positions: Float32Array;
  sizes: Float32Array;
  colors: Float32Array;
  twinkleOffsets: Float32Array;
  depth: number;
  parallaxFactor: number;
}

interface ShootingStar {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  trail: THREE.Vector3[];
  trailLength: number;
}

// Generate star colors with variety
function getStarColor(): THREE.Color {
  const rand = Math.random();
  if (rand < 0.70) return new THREE.Color(0xffffff); // White
  if (rand < 0.85) return new THREE.Color(0xaaddff); // Pale cyan
  if (rand < 0.95) return new THREE.Color(0xddaaff); // Pale purple
  return new THREE.Color(0xffeedd); // Warm white
}

// Generate constellation lines between nearby stars
function generateConstellationLines(
  positions: Float32Array,
  maxConnections: number,
  maxDistance: number
): { linePositions: Float32Array; lineCount: number } {
  const stars: THREE.Vector3[] = [];
  for (let i = 0; i < positions.length; i += 3) {
    stars.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
  }

  const connections: [THREE.Vector3, THREE.Vector3][] = [];
  const usedConnections = new Set<string>();

  for (let i = 0; i < stars.length && connections.length < maxConnections; i++) {
    const star = stars[i];
    const nearby = stars
      .map((s, idx) => ({ star: s, idx, dist: star.distanceTo(s) }))
      .filter(({ idx, dist }) => idx !== i && dist < maxDistance && dist > 0)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2);

    for (const { star: neighbor, idx } of nearby) {
      const key = [Math.min(i, idx), Math.max(i, idx)].join('-');
      if (!usedConnections.has(key) && connections.length < maxConnections) {
        usedConnections.add(key);
        connections.push([star, neighbor]);
      }
    }
  }

  const linePositions = new Float32Array(connections.length * 6);
  connections.forEach(([a, b], i) => {
    linePositions[i * 6] = a.x;
    linePositions[i * 6 + 1] = a.y;
    linePositions[i * 6 + 2] = a.z;
    linePositions[i * 6 + 3] = b.x;
    linePositions[i * 6 + 4] = b.y;
    linePositions[i * 6 + 5] = b.z;
  });

  return { linePositions, lineCount: connections.length };
}

// Create a new shooting star
function createShootingStar(): ShootingStar {
  const startX = (Math.random() - 0.3) * 400;
  const startY = 150 + Math.random() * 100;
  const startZ = DEPTH_LAYERS_3D.CONSTELLATION_MID + (Math.random() - 0.5) * 100;
  
  // Angle downward and to the right (with variation)
  const angle = -Math.PI / 6 + (Math.random() - 0.5) * 0.4;
  const speed = 250 + Math.random() * 150;
  
  return {
    active: true,
    position: new THREE.Vector3(startX, startY, startZ),
    velocity: new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, 0),
    life: 0,
    maxLife: 0.8 + Math.random() * 0.6,
    trail: [],
    trailLength: 12 + Math.floor(Math.random() * 8),
  };
}

export function ConstellationField({ isPaused = false, tiltX = 0, tiltY = 0 }: ConstellationFieldProps) {
  const { tier, shouldAnimate } = useAdaptiveQuality();
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<(THREE.Points | null)[]>([]);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const shootingStarRef = useRef<THREE.Line | null>(null);
  const timeRef = useRef(0);
  const nextShootingStarTime = useRef(3 + Math.random() * 4);
  const shootingStarData = useRef<ShootingStar | null>(null);

  // Performance-scaled configuration
  const config = useMemo(() => {
    const configs = {
      ULTRA: { starsPerLayer: 80, lineCount: 25, showLines: true, shootingStars: true },
      HIGH: { starsPerLayer: 60, lineCount: 18, showLines: true, shootingStars: true },
      MEDIUM: { starsPerLayer: 35, lineCount: 10, showLines: true, shootingStars: true },
      LOW: { starsPerLayer: 15, lineCount: 0, showLines: false, shootingStars: false },
    };
    return configs[tier] || configs.MEDIUM;
  }, [tier]);

  // Generate star layers at different depths
  const layers = useMemo<StarLayer[]>(() => {
    const depths = [
      { z: DEPTH_LAYERS_3D.CONSTELLATION_NEAR, parallax: 0.08 },
      { z: DEPTH_LAYERS_3D.CONSTELLATION_MID, parallax: 0.04 },
      { z: DEPTH_LAYERS_3D.CONSTELLATION_FAR, parallax: 0.02 },
    ];

    return depths.map(({ z, parallax }) => {
      const count = config.starsPerLayer;
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const colors = new Float32Array(count * 3);
      const twinkleOffsets = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        // Spread stars across viewport
        positions[i * 3] = (Math.random() - 0.5) * 600;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
        positions[i * 3 + 2] = z + (Math.random() - 0.5) * 50;

        // Varying sizes - farther = smaller
        const depthFactor = 1 - (Math.abs(z) - 200) / 300;
        sizes[i] = (0.8 + Math.random() * 3.5) * depthFactor;

        // Star colors
        const color = getStarColor();
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Random twinkle phase offset
        twinkleOffsets[i] = Math.random() * Math.PI * 2;
      }

      return { positions, sizes, colors, twinkleOffsets, depth: z, parallaxFactor: parallax };
    });
  }, [config.starsPerLayer]);

  // Generate constellation lines from nearest layer
  const lineData = useMemo(() => {
    if (!config.showLines || config.lineCount === 0) return null;
    const nearLayer = layers[0];
    return generateConstellationLines(nearLayer.positions, config.lineCount, 120);
  }, [layers, config.showLines, config.lineCount]);

  // Shooting star trail geometry (pre-allocated)
  const shootingStarGeometry = useMemo(() => {
    const maxTrailPoints = 20;
    const positions = new Float32Array(maxTrailPoints * 3);
    const colors = new Float32Array(maxTrailPoints * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setDrawRange(0, 0);
    return geometry;
  }, []);

  // Shooting star material
  const shootingStarMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Animation and parallax
  useFrame((_, delta) => {
    if (isPaused || !shouldAnimate) return;

    timeRef.current += delta;

    // Apply parallax based on device tilt
    if (groupRef.current) {
      const targetX = tiltY * 15;
      const targetY = -tiltX * 12;
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;
    }

    // Animate star twinkle
    starsRef.current.forEach((points, layerIdx) => {
      if (!points) return;
      const geometry = points.geometry;
      const sizes = geometry.attributes.size;
      const layer = layers[layerIdx];

      if (sizes && layer) {
        const sizeArray = sizes.array as Float32Array;
        for (let i = 0; i < sizeArray.length; i++) {
          const baseSize = layer.sizes[i];
          const twinkle = Math.sin(timeRef.current * (0.3 + layer.twinkleOffsets[i] * 0.5) + layer.twinkleOffsets[i]);
          sizeArray[i] = baseSize * (0.7 + twinkle * 0.3);
        }
        sizes.needsUpdate = true;
      }

      // Per-layer parallax
      points.position.x = tiltY * 15 * layer.parallaxFactor * 10;
      points.position.y = -tiltX * 12 * layer.parallaxFactor * 10;
    });

    // Animate lines with same parallax as near layer
    if (linesRef.current && layers[0]) {
      linesRef.current.position.x = tiltY * 15 * layers[0].parallaxFactor * 10;
      linesRef.current.position.y = -tiltX * 12 * layers[0].parallaxFactor * 10;
    }

    // Shooting star logic
    if (config.shootingStars) {
      // Spawn new shooting star
      if (!shootingStarData.current && timeRef.current >= nextShootingStarTime.current) {
        shootingStarData.current = createShootingStar();
        nextShootingStarTime.current = timeRef.current + 5 + Math.random() * 8;
      }

      // Update active shooting star
      if (shootingStarData.current) {
        const star = shootingStarData.current;
        star.life += delta;

        // Update position
        star.position.x += star.velocity.x * delta;
        star.position.y += star.velocity.y * delta;

        // Add to trail
        star.trail.unshift(star.position.clone());
        if (star.trail.length > star.trailLength) {
          star.trail.pop();
        }

        // Update geometry
        const posAttr = shootingStarGeometry.attributes.position as THREE.BufferAttribute;
        const colorAttr = shootingStarGeometry.attributes.color as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;
        const colors = colorAttr.array as Float32Array;

        for (let i = 0; i < star.trail.length; i++) {
          const point = star.trail[i];
          positions[i * 3] = point.x;
          positions[i * 3 + 1] = point.y;
          positions[i * 3 + 2] = point.z;

          // Fade color along trail (white to cyan)
          const t = i / star.trailLength;
          const lifeAlpha = 1 - (star.life / star.maxLife);
          const alpha = (1 - t) * lifeAlpha;
          colors[i * 3] = 0.8 + 0.2 * (1 - t);
          colors[i * 3 + 1] = 0.95 + 0.05 * (1 - t);
          colors[i * 3 + 2] = 1.0 * alpha;
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
        shootingStarGeometry.setDrawRange(0, star.trail.length);

        // End shooting star
        if (star.life >= star.maxLife || star.position.y < -250) {
          shootingStarData.current = null;
          shootingStarGeometry.setDrawRange(0, 0);
        }
      }
    }
  });

  // Star shader material
  const starMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vSize;
        
        void main() {
          vColor = color;
          vSize = size;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vSize;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Soft glow falloff
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= alpha;
          
          // Core brightness
          float core = 1.0 - smoothstep(0.0, 0.15, dist);
          vec3 finalColor = mix(vColor, vec3(1.0), core * 0.5);
          
          gl_FragColor = vec4(finalColor, alpha * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Line material
  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: COLORS_3D.grid,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  return (
    <group ref={groupRef}>
      {/* Star layers */}
      {layers.map((layer, idx) => (
        <points
          key={idx}
          ref={(el) => { starsRef.current[idx] = el; }}
          frustumCulled={false}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={layer.positions.length / 3}
              array={layer.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={layer.sizes.length}
              array={layer.sizes}
              itemSize={1}
            />
            <bufferAttribute
              attach="attributes-color"
              count={layer.colors.length / 3}
              array={layer.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={starMaterial} attach="material" />
        </points>
      ))}

      {/* Constellation lines */}
      {lineData && lineData.lineCount > 0 && (
        <lineSegments
          ref={linesRef}
          frustumCulled={false}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={lineData.linePositions.length / 3}
              array={lineData.linePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={lineMaterial} attach="material" />
        </lineSegments>
      )}

      {/* Shooting star */}
      {config.shootingStars && (
        <primitive
          object={new THREE.Line(shootingStarGeometry, shootingStarMaterial)}
          ref={shootingStarRef}
          frustumCulled={false}
        />
      )}
    </group>
  );
}
