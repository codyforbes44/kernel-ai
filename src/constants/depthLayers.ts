// 2100-Era Depth Layer Constants
// Z-depth values for clean 3D depth perception

export const DEPTH_LAYERS = {
  // Background layers (negative Z - behind viewer)
  ABYSS: -400,      // Deepest cosmic background
  DEEP: -300,       // Aurora effects
  FAR: -250,        // Gradient mesh
  GRID: -30,        // Perspective grid
  ORIGIN: 0,        // Base reference point
} as const;

// Perspective settings
export const PERSPECTIVE = {
  MAIN: 800,        // Main container perspective
  GRID: 600,        // Grid overlay perspective
} as const;

// Parallax multipliers for scroll-based depth separation
export const PARALLAX_MULTIPLIERS = {
  SLOW: 0.5,
  MEDIUM: 0.8,
  FAST: 1.2,
} as const;

// Scale factors based on Z-depth
export const DEPTH_SCALES = {
  [DEPTH_LAYERS.ABYSS]: 1.5,
  [DEPTH_LAYERS.DEEP]: 1.4,
  [DEPTH_LAYERS.FAR]: 1.35,
  [DEPTH_LAYERS.GRID]: 1.04,
} as const;

export type DepthLayerKey = keyof typeof DEPTH_LAYERS;
