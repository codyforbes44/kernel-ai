// Shared TypeScript interfaces for Christmas components

export interface Snowflake {
  id: number;
  x: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftDuration: number;
  layer: number;        // 0-6 depth layer (7 layers total)
  blur: number;         // blur amount in px
  translateZ: number;   // z-axis position for 3D depth
  parallaxFactor: number; // mouse parallax multiplier
  colorShift: number;   // atmospheric blue shift (0-1)
}

export interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  twinkleDuration: number;
  delay: number;
}

export interface DetailedStar {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;      // 0-1
  points: number;          // 4, 6, or 8 point star
  color: StarColor;
  twinkleDuration: number;
  delay: number;
  layer: number;           // depth layer
  blur: number;
  hasDiffractionSpikes: boolean;
}

export type StarColor = 'white' | 'gold' | 'blue-white' | 'red-orange' | 'cyan';

export interface ConstellationStar {
  id: string;
  x: number;
  y: number;
  size: number;
  brightness: number;
  name?: string;           // e.g., "Betelgeuse", "Polaris"
  isConnectionPoint: boolean;
  color: StarColor;
}

export interface ConstellationLine {
  from: string;
  to: string;
  opacity: number;
  pulseDelay: number;
}

export interface Nebula {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color: string;
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

// Device capability tiers for performance optimization
export type DeviceTier = 'high' | 'medium' | 'low';

// Constellation detail levels
export type ConstellationDetail = 'full' | 'simplified' | 'minimal';

export interface PerformanceConfig {
  particleScale: number;
  enableComplexEffects: boolean;
  enableShadows: boolean;
  prefersReducedMotion: boolean;
  isSmallScreen: boolean;
  isVerySmallScreen: boolean;
  // Enhanced properties
  enableBlur: boolean;
  enable3DTransforms: boolean;
  maxParticles: number;
  enableGyroscope: boolean;
  constellationDetail: ConstellationDetail;
  deviceTier: DeviceTier;
  enableAtmosphericEffects: boolean;
}

// Depth layer configuration for 7-layer system
export interface DepthLayerConfig {
  sizeMin: number;
  sizeMax: number;
  durationMin: number;
  durationMax: number;
  opacityMin: number;
  opacityMax: number;
  blur: number;
  translateZ: number;
  parallaxFactor: number;
  colorShift: number;      // Blue shift for atmospheric perspective
  zIndex: number;
}
