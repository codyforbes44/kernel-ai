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
  brightness: number;
  flickerSpeed: number;
}

interface EnergyPulse {
  active: boolean;
  lineIndex: number;
  progress: number;
  speed: number;
  direction: 1 | -1;
  size: number;
  color: THREE.Color;
}

// Pulse colors
const PULSE_COLORS = [
  new THREE.Color(0x00ffff), // Cyan
  new THREE.Color(0x00ffff), // Cyan (more frequent)
  new THREE.Color(0xaa88ff), // Pale purple
  new THREE.Color(0xffffff), // White
];

// Generate star colors with variety
function getStarColor(): THREE.Color {
  const rand = Math.random();
  if (rand < 0.70) return new THREE.Color(0xffffff);
  if (rand < 0.85) return new THREE.Color(0xaaddff);
  if (rand < 0.95) return new THREE.Color(0xddaaff);
  return new THREE.Color(0xffeedd);
}

// Generate constellation lines between nearby stars
function generateConstellationLines(
  positions: Float32Array,
  maxConnections: number,
  maxDistance: number
): { linePositions: Float32Array; lineCount: number; lineEndpoints: [THREE.Vector3, THREE.Vector3][] } {
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
        connections.push([star.clone(), neighbor.clone()]);
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

  return { linePositions, lineCount: connections.length, lineEndpoints: connections };
}

// Create a new shooting star
function createShootingStar(): ShootingStar {
  // Start from upper area, can come from either side
  const fromLeft = Math.random() > 0.5;
  const startX = fromLeft 
    ? -200 - Math.random() * 100 
    : 200 + Math.random() * 100;
  const startY = 120 + Math.random() * 80;
  const startZ = DEPTH_LAYERS_3D.CONSTELLATION_MID + (Math.random() - 0.5) * 50;
  
  // Angle: steep diagonal descent (more realistic)
  const baseAngle = fromLeft ? -Math.PI / 5 : -Math.PI + Math.PI / 5;
  const angle = baseAngle + (Math.random() - 0.5) * 0.3;
  const speed = 350 + Math.random() * 200; // Faster for realism
  
  return {
    active: true,
    position: new THREE.Vector3(startX, startY, startZ),
    velocity: new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, 0),
    life: 0,
    maxLife: 0.6 + Math.random() * 0.5, // Shorter, more intense
    trail: [],
    trailLength: 25 + Math.floor(Math.random() * 15), // Longer trail
    brightness: 0.8 + Math.random() * 0.2,
    flickerSpeed: 15 + Math.random() * 10,
  };
}

// Create a new energy pulse
function createEnergyPulse(lineIndex: number): EnergyPulse {
  const direction = Math.random() > 0.5 ? 1 : -1;
  return {
    active: true,
    lineIndex,
    progress: direction === 1 ? 0 : 1,
    speed: 0.3 + Math.random() * 0.4,
    direction,
    size: 2.5 + Math.random() * 2,
    color: PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)].clone(),
  };
}

export function ConstellationField({ isPaused = false, tiltX = 0, tiltY = 0 }: ConstellationFieldProps) {
  const { tier, shouldAnimate } = useAdaptiveQuality();
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<(THREE.Points | null)[]>([]);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const shootingStarRef = useRef<THREE.Points | null>(null);
  const pulsesRef = useRef<THREE.Points | null>(null);
  const timeRef = useRef(0);
  const nextShootingStarTime = useRef(3 + Math.random() * 4);
  const shootingStarData = useRef<ShootingStar | null>(null);
  const pulsesData = useRef<EnergyPulse[]>([]);
  const nextPulseTime = useRef(0.5);

  // Performance-scaled configuration
  const config = useMemo(() => {
    const configs = {
      ULTRA: { starsPerLayer: 80, lineCount: 25, showLines: true, shootingStars: true, maxPulses: 8 },
      HIGH: { starsPerLayer: 60, lineCount: 18, showLines: true, shootingStars: true, maxPulses: 6 },
      MEDIUM: { starsPerLayer: 35, lineCount: 10, showLines: true, shootingStars: true, maxPulses: 4 },
      LOW: { starsPerLayer: 15, lineCount: 0, showLines: false, shootingStars: false, maxPulses: 0 },
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
        positions[i * 3] = (Math.random() - 0.5) * 600;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
        positions[i * 3 + 2] = z + (Math.random() - 0.5) * 50;

        const depthFactor = 1 - (Math.abs(z) - 200) / 300;
        sizes[i] = (0.8 + Math.random() * 3.5) * depthFactor;

        const color = getStarColor();
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

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

  // Shooting star geometry (using points for glowing meteor effect)
  const shootingStarGeometry = useMemo(() => {
    const maxTrailPoints = 40; // More points for smoother trail
    const positions = new Float32Array(maxTrailPoints * 3);
    const colors = new Float32Array(maxTrailPoints * 3);
    const sizes = new Float32Array(maxTrailPoints);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setDrawRange(0, 0);
    return geometry;
  }, []);

  // Shooting star material - glowing points shader
  const shootingStarMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Intense glow with soft falloff
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 2.0);
          
          // Hot bright core
          float core = 1.0 - smoothstep(0.0, 0.15, dist);
          vec3 finalColor = mix(vColor, vec3(1.0), core);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Energy pulse geometry (pre-allocated pool)
  const pulseGeometry = useMemo(() => {
    const maxPulses = 8;
    const positions = new Float32Array(maxPulses * 3);
    const sizes = new Float32Array(maxPulses);
    const colors = new Float32Array(maxPulses * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setDrawRange(0, 0);
    return geometry;
  }, []);

  // Energy pulse shader material
  const pulseMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 1.5);
          
          float core = 1.0 - smoothstep(0.0, 0.2, dist);
          vec3 finalColor = mix(vColor, vec3(1.0), core * 0.8);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

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
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= alpha;
          
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

      points.position.x = tiltY * 15 * layer.parallaxFactor * 10;
      points.position.y = -tiltX * 12 * layer.parallaxFactor * 10;
    });

    // Animate lines with same parallax as near layer
    if (linesRef.current && layers[0]) {
      linesRef.current.position.x = tiltY * 15 * layers[0].parallaxFactor * 10;
      linesRef.current.position.y = -tiltX * 12 * layers[0].parallaxFactor * 10;
    }

    // Apply parallax to pulses
    if (pulsesRef.current && layers[0]) {
      pulsesRef.current.position.x = tiltY * 15 * layers[0].parallaxFactor * 10;
      pulsesRef.current.position.y = -tiltX * 12 * layers[0].parallaxFactor * 10;
    }

    // Shooting star logic
    if (config.shootingStars) {
      if (!shootingStarData.current && timeRef.current >= nextShootingStarTime.current) {
        shootingStarData.current = createShootingStar();
        nextShootingStarTime.current = timeRef.current + 5 + Math.random() * 8;
      }

      if (shootingStarData.current) {
        const star = shootingStarData.current;
        star.life += delta;

        // Slight deceleration for realism (atmospheric drag)
        const drag = 0.995;
        star.velocity.multiplyScalar(drag);
        
        star.position.x += star.velocity.x * delta;
        star.position.y += star.velocity.y * delta;

        star.trail.unshift(star.position.clone());
        if (star.trail.length > star.trailLength) {
          star.trail.pop();
        }

        const posAttr = shootingStarGeometry.attributes.position as THREE.BufferAttribute;
        const colorAttr = shootingStarGeometry.attributes.color as THREE.BufferAttribute;
        const sizeAttr = shootingStarGeometry.attributes.size as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;
        const colors = colorAttr.array as Float32Array;
        const sizes = sizeAttr.array as Float32Array;

        // Flickering brightness
        const flicker = 0.85 + Math.sin(timeRef.current * star.flickerSpeed) * 0.15;
        const lifeProgress = star.life / star.maxLife;
        const lifeFade = lifeProgress < 0.1 
          ? lifeProgress / 0.1  // Fade in
          : lifeProgress > 0.7 
            ? 1 - (lifeProgress - 0.7) / 0.3  // Fade out
            : 1;

        for (let i = 0; i < star.trail.length; i++) {
          const point = star.trail[i];
          positions[i * 3] = point.x;
          positions[i * 3 + 1] = point.y;
          positions[i * 3 + 2] = point.z;

          // Position along trail (0 = head, 1 = tail)
          const t = i / star.trailLength;
          
          // Realistic meteor colors: white-hot head → yellow → orange → red tail
          // Head: bright white (1, 1, 1)
          // Mid: yellow-orange (1, 0.8, 0.3)
          // Tail: dim orange-red (0.8, 0.3, 0.1)
          const headR = 1.0;
          const headG = 1.0;
          const headB = 0.95;
          const tailR = 0.9;
          const tailG = 0.4;
          const tailB = 0.15;
          
          const intensity = (1 - t * t) * lifeFade * flicker * star.brightness;
          colors[i * 3] = (headR + (tailR - headR) * t) * intensity;
          colors[i * 3 + 1] = (headG + (tailG - headG) * t * t) * intensity;
          colors[i * 3 + 2] = (headB + (tailB - headB) * t) * intensity * 0.6;

          // Size: large glowing head, tapering to thin tail
          const baseSize = i === 0 ? 5 : 4 - t * 3;
          sizes[i] = Math.max(0.5, baseSize * (1 - t * 0.8) * lifeFade);
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
        shootingStarGeometry.setDrawRange(0, star.trail.length);

        if (star.life >= star.maxLife || star.position.y < -250 || star.position.x > 400 || star.position.x < -400) {
          shootingStarData.current = null;
          shootingStarGeometry.setDrawRange(0, 0);
        }
      }
    }

    // Energy pulse logic
    if (config.maxPulses > 0 && lineData && lineData.lineCount > 0) {
      // Spawn new pulses
      const activePulses = pulsesData.current.filter(p => p.active).length;
      if (activePulses < config.maxPulses && timeRef.current >= nextPulseTime.current) {
        const randomLineIndex = Math.floor(Math.random() * lineData.lineCount);
        pulsesData.current.push(createEnergyPulse(randomLineIndex));
        nextPulseTime.current = timeRef.current + 0.5 + Math.random() * 1.5;
      }

      // Update pulses
      const posAttr = pulseGeometry.attributes.position as THREE.BufferAttribute;
      const sizeAttr = pulseGeometry.attributes.size as THREE.BufferAttribute;
      const colorAttr = pulseGeometry.attributes.color as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const sizes = sizeAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;

      let activeCount = 0;

      for (let i = 0; i < pulsesData.current.length; i++) {
        const pulse = pulsesData.current[i];
        if (!pulse.active) continue;

        // Update progress
        pulse.progress += pulse.speed * pulse.direction * delta;

        // Check if pulse completed
        if (pulse.progress >= 1 || pulse.progress <= 0) {
          pulse.active = false;
          continue;
        }

        // Get line endpoints
        const endpoints = lineData.lineEndpoints[pulse.lineIndex];
        if (!endpoints) {
          pulse.active = false;
          continue;
        }

        // Interpolate position along line
        const [start, end] = endpoints;
        const x = start.x + (end.x - start.x) * pulse.progress;
        const y = start.y + (end.y - start.y) * pulse.progress;
        const z = start.z + (end.z - start.z) * pulse.progress;

        // Pulse size with breathing effect
        const breathe = 1 + Math.sin(timeRef.current * 8 + i) * 0.2;
        
        positions[activeCount * 3] = x;
        positions[activeCount * 3 + 1] = y;
        positions[activeCount * 3 + 2] = z;
        sizes[activeCount] = pulse.size * breathe;
        colors[activeCount * 3] = pulse.color.r;
        colors[activeCount * 3 + 1] = pulse.color.g;
        colors[activeCount * 3 + 2] = pulse.color.b;

        activeCount++;
      }

      // Clean up inactive pulses
      pulsesData.current = pulsesData.current.filter(p => p.active);

      posAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      pulseGeometry.setDrawRange(0, activeCount);
    }
  });

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

      {/* Energy pulses */}
      {config.maxPulses > 0 && (
        <points
          ref={pulsesRef}
          frustumCulled={false}
        >
          <primitive object={pulseGeometry} attach="geometry" />
          <primitive object={pulseMaterial} attach="material" />
        </points>
      )}

      {/* Shooting star */}
      {config.shootingStars && (
        <points
          ref={shootingStarRef}
          frustumCulled={false}
        >
          <primitive object={shootingStarGeometry} attach="geometry" />
          <primitive object={shootingStarMaterial} attach="material" />
        </points>
      )}
    </group>
  );
}
