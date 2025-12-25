// 2100-Era - Clean 3D World Units for React Three Fiber
// Z-depth values for stable WebGL space

export const DEPTH_LAYERS_3D = {
  GRID: -150,           // Deep infinite perspective grid
  GRID_MID: -300,       // Mid-depth layer
  GRID_FAR: -500,       // Far horizon layer
  PARTICLES: -80,       // Ambient floating particles (closer than grid)
} as const;

// Camera configuration - eye-level for forward-looking perspective
export const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 2000,
  POSITION: [0, 0, 50] as [number, number, number],
} as const;

// Performance tiers based on device capability
export const PERFORMANCE_TIERS = {
  ULTRA: {
    postProcessing: true,
    rayMarching: true,
    bloomIntensity: 1.5,
    chromaticAberration: true,
  },
  HIGH: {
    postProcessing: true,
    rayMarching: true,
    bloomIntensity: 1.2,
    chromaticAberration: true,
  },
  MEDIUM: {
    postProcessing: true,
    rayMarching: false,
    bloomIntensity: 0.8,
    chromaticAberration: false,
  },
  LOW: {
    postProcessing: false,
    rayMarching: false,
    bloomIntensity: 0,
    chromaticAberration: false,
  },
} as const;

// Color palette for Tron-era effects (in Three.js hex format)
export const COLORS_3D = {
  primary: 0x00ffff,          // Electric Cyan
  secondary: 0xff6600,        // Tron Orange (classic antagonist color)
  accent: 0x00ff88,           // Neon green
  grid: 0x00d4ff,             // Bright cyan
  pulse: 0x00ffff,            // Pulse effect color
  trail: 0xff3300,            // Energy trail color
} as const;

// Animation speeds
export const ANIMATION_SPEEDS = {
  grid: 0.001,
} as const;

// Performance-scaled particle and pulse configurations
export const getScaledPulseConfig = (tier: PerformanceTier) => {
  const counts = { ULTRA: 6, HIGH: 4, MEDIUM: 3, LOW: 2 };
  return {
    count: counts[tier],
    speed: 0.3,
    size: 6,
    glowIntensity: 1.5,
  };
};

export const getScaledParticleConfig = (tier: PerformanceTier) => {
  const counts = { ULTRA: 80, HIGH: 50, MEDIUM: 25, LOW: 10 };
  return {
    count: counts[tier],
    speedMin: 0.08,
    speedMax: 0.25,
    sizeMin: 2,
    sizeMax: 5,
    heightMin: 5,
    heightMax: 50,
    spreadX: 500,
  };
};

export const getScaledFogSegments = (tier: PerformanceTier) => {
  const segments = { ULTRA: 32, HIGH: 24, MEDIUM: 16, LOW: 8 };
  return segments[tier];
};

export type PerformanceTier = keyof typeof PERFORMANCE_TIERS;
export type DepthLayer3D = keyof typeof DEPTH_LAYERS_3D;
