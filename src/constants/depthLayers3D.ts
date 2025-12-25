// 2100 Era - True 3D World Units for React Three Fiber
// Z-depth values for immersive WebGL space

export const DEPTH_LAYERS_3D = {
  // Deep space layers (far from camera)
  HYPERSPACE: -1000,    // Warp tunnel background effect
  VOID: -500,           // Deep cosmic void with ray-marched nebulae
  NEBULA: -300,         // Volumetric gas clouds
  STARS: -200,          // Massive instanced star field
  AURORA: -100,         // Animated aurora plane
  
  // Mid-range layers
  PARTICLES: -50,       // GPU particle system
  GRID: -30,            // Infinite perspective grid
  
  // Near layers
  CODE_BLOCKS: 0,       // Floating code panels
  HOLOGRAPHIC: 20,      // Holographic UI elements
  PROJECTION: 50,       // Closest projections to camera
} as const;

// Camera configuration
export const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 2000,
  POSITION: [0, 0, 100] as [number, number, number],
} as const;

// Performance tiers based on device capability
export const PERFORMANCE_TIERS = {
  ULTRA: {
    particleCount: 10000,
    starCount: 50000,
    postProcessing: true,
    rayMarching: true,
    bloomIntensity: 1.5,
    chromaticAberration: true,
  },
  HIGH: {
    particleCount: 5000,
    starCount: 25000,
    postProcessing: true,
    rayMarching: true,
    bloomIntensity: 1.2,
    chromaticAberration: true,
  },
  MEDIUM: {
    particleCount: 2000,
    starCount: 10000,
    postProcessing: true,
    rayMarching: false,
    bloomIntensity: 0.8,
    chromaticAberration: false,
  },
  LOW: {
    particleCount: 500,
    starCount: 2000,
    postProcessing: false,
    rayMarching: false,
    bloomIntensity: 0,
    chromaticAberration: false,
  },
} as const;

// Color palette for 2100-era effects (in Three.js hex format)
export const COLORS_3D = {
  primary: 0x00ffff,          // Cyan
  secondary: 0xff00ff,        // Magenta
  accent: 0x00ff88,           // Neon green
  aurora1: 0x00ffcc,          // Teal
  aurora2: 0xff00aa,          // Pink
  aurora3: 0x8800ff,          // Purple
  nebula1: 0x1a0033,          // Deep purple
  nebula2: 0x003355,          // Deep blue
  star: 0xffffff,             // White
  grid: 0x00ffff,             // Cyan
  void: 0x000011,             // Near black
} as const;

// Animation speeds
export const ANIMATION_SPEEDS = {
  particles: 0.0005,
  aurora: 0.001,
  stars: 0.0001,
  warp: 0.002,
  nebula: 0.0003,
} as const;

export type PerformanceTier = keyof typeof PERFORMANCE_TIERS;
export type DepthLayer3D = keyof typeof DEPTH_LAYERS_3D;
