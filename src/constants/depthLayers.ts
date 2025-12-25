// 2044 Futuristic Depth Layer Constants
// Z-depth values for the extreme 3D depth perception system

export const DEPTH_LAYERS = {
  // Background layers (negative Z - behind viewer)
  ABYSS: -400,      // Deepest cosmic background
  DEEP: -300,       // Aurora effects
  FAR: -250,        // Gradient mesh
  MID_FAR: -150,    // Particle field
  MID: -80,         // Star constellations
  
  // Near layers (around origin)
  NEAR: -30,        // Animated code blocks
  ORIGIN: 0,        // Base reference point
  
  // Front layers (positive Z - toward viewer)
  FRONT: 80,        // Holographic UI elements
  EXTREME_FRONT: 120, // Secondary cursors
  CLOSEST: 150,     // Terminal cursor (closest to viewer)
} as const;

// Perspective settings
export const PERSPECTIVE = {
  MAIN: 800,        // Main container perspective (reduced for dramatic depth)
  GRID: 600,        // Grid overlay perspective
  CODE_BLOCKS: 800, // Code blocks container perspective
} as const;

// Parallax multipliers for scroll-based depth separation
export const PARALLAX_MULTIPLIERS = {
  SLOW: 0.5,
  MEDIUM: 0.8,
  FAST: 1.2,
} as const;

// Scale factors based on Z-depth (farther = larger scale to compensate)
export const DEPTH_SCALES = {
  [DEPTH_LAYERS.ABYSS]: 1.5,
  [DEPTH_LAYERS.DEEP]: 1.4,
  [DEPTH_LAYERS.FAR]: 1.35,
  [DEPTH_LAYERS.MID_FAR]: 1.2,
  [DEPTH_LAYERS.MID]: 1.1,
  [DEPTH_LAYERS.NEAR]: 1.04,
  [DEPTH_LAYERS.FRONT]: 0.92,
  [DEPTH_LAYERS.EXTREME_FRONT]: 0.9,
  [DEPTH_LAYERS.CLOSEST]: 0.88,
} as const;

export type DepthLayerKey = keyof typeof DEPTH_LAYERS;
