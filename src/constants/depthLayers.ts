// 2100-Era Depth Layer Constants
// Z-depth values for clean 3D depth perception

export const DEPTH_LAYERS = {
  GRID: -30,        // Perspective grid
  ORIGIN: 0,        // Base reference point
} as const;

// Perspective settings
export const PERSPECTIVE = {
  MAIN: 800,        // Main container perspective
  GRID: 600,        // Grid overlay perspective
} as const;

export type DepthLayerKey = keyof typeof DEPTH_LAYERS;
