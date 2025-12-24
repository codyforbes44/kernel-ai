// Shared TypeScript interfaces for Christmas components

export interface Snowflake {
  id: number;
  x: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftDuration: number;
}

export interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  twinkleDuration: number;
  delay: number;
}

export interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  delay: number;
  duration: number;
}

export interface Particle {
  id: number;
  size: number | string;
  delay: number;
}

export interface ArcParticle extends Particle {
  angle: number;
  speed: number;
  offsetY: number;
}

export interface MistParticle extends Particle {
  x: number;
  y: number;
  duration: number;
}

export interface GroundChunk extends Particle {
  startX: number;
  arcHeight: number;
  arcDistance: number;
  duration: number;
  rotation: number;
}

export interface Sparkle {
  id: number;
  angle: number;
  delay: number;
  size: number;
  orbitRadius: number;
}

export interface LightRay {
  id: number;
  rotation: number;
  length: number;
  width: number;
  delay: number;
}

export interface Reindeer {
  id: number;
  isRudolph: boolean;
  animationDelay: number;
}

export interface PerformanceConfig {
  particleScale: number;
  enableComplexEffects: boolean;
  enableShadows: boolean;
}
