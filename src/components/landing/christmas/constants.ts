import type { DepthLayerConfig } from './types';

// Animation cycle timing (in seconds) - single source of truth
export const ANIMATION_TIMING = {
  CYCLE_DURATION: 25,        // Total cycle length
  ACCUMULATE_PHASE: 15,      // Snow accumulates (0-60%)
  BLOWER_ACTIVE_START: 0.62, // 62% - blower starts crossing
  BLOWER_ACTIVE_END: 0.92,   // 92% - blower exits
  BLOWER_PHASE: 8,           // Duration of blower crossing
} as const;

// Z-index layer system for consistent stacking (7 layers)
export const CHRISTMAS_LAYERS = {
  // Background layers (furthest)
  DEEP_STARS: 1,
  AURORA: 2,
  CONSTELLATIONS: 3,
  STARS: 4,
  SHOOTING_STARS: 5,
  NORTH_STAR: 6,
  MOON: 7,
  // Mid layers
  ATMOSPHERIC_HAZE_FAR: 8,
  SNOWFLAKES_VERY_FAR: 9,
  SNOWFLAKES_FAR: 10,
  SNOWFLAKES_MID: 11,
  ATMOSPHERIC_HAZE_NEAR: 12,
  // Foreground layers
  SNOWFLAKES_CLOSE: 13,
  SNOWFLAKES_VERY_CLOSE: 14,
  SANTA: 15,
  SNOWFLAKES_FOREGROUND: 16,
  SNOW_PILE: 20,
} as const;

// 7-layer depth configuration for maximum depth perception
export const DEPTH_LAYERS: Record<number, DepthLayerConfig> = {
  0: { // Very distant - deep background stars
    sizeMin: 0.5, sizeMax: 1.5,
    durationMin: 22, durationMax: 28,
    opacityMin: 0.05, opacityMax: 0.15,
    blur: 4,
    translateZ: -500,
    parallaxFactor: -0.4,
    colorShift: 0.6,  // Strong blue shift
    zIndex: CHRISTMAS_LAYERS.DEEP_STARS,
  },
  1: { // Distant - constellation layer
    sizeMin: 1, sizeMax: 2,
    durationMin: 18, durationMax: 24,
    opacityMin: 0.1, opacityMax: 0.25,
    blur: 2.5,
    translateZ: -350,
    parallaxFactor: -0.3,
    colorShift: 0.4,
    zIndex: CHRISTMAS_LAYERS.CONSTELLATIONS,
  },
  2: { // Far
    sizeMin: 2, sizeMax: 3.5,
    durationMin: 14, durationMax: 20,
    opacityMin: 0.2, opacityMax: 0.35,
    blur: 1.5,
    translateZ: -200,
    parallaxFactor: -0.15,
    colorShift: 0.25,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_FAR,
  },
  3: { // Mid-far
    sizeMin: 3, sizeMax: 4.5,
    durationMin: 12, durationMax: 16,
    opacityMin: 0.35, opacityMax: 0.5,
    blur: 0.8,
    translateZ: -80,
    parallaxFactor: -0.05,
    colorShift: 0.1,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_MID,
  },
  4: { // Mid - focal plane
    sizeMin: 4, sizeMax: 6,
    durationMin: 10, durationMax: 14,
    opacityMin: 0.5, opacityMax: 0.7,
    blur: 0,
    translateZ: 0,
    parallaxFactor: 0,
    colorShift: 0,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_CLOSE,
  },
  5: { // Close
    sizeMin: 6, sizeMax: 9,
    durationMin: 7, durationMax: 10,
    opacityMin: 0.7, opacityMax: 0.85,
    blur: 0,
    translateZ: 150,
    parallaxFactor: 0.25,
    colorShift: 0,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_VERY_CLOSE,
  },
  6: { // Very close (sparse foreground)
    sizeMin: 10, sizeMax: 16,
    durationMin: 4, durationMax: 7,
    opacityMin: 0.85, opacityMax: 0.98,
    blur: 0,
    translateZ: 300,
    parallaxFactor: 0.5,
    colorShift: 0,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_FOREGROUND,
  },
} as const;

// Atmospheric color palette for depth
export const ATMOSPHERIC_COLORS = {
  FOG_NEAR: 'hsla(210, 30%, 90%, 0.03)',
  FOG_FAR: 'hsla(220, 40%, 70%, 0.08)',
  BLUE_SHIFT: 'hsla(210, 60%, 70%, 1)',
  DEPTH_TINT: 'hsla(215, 50%, 60%, 0.15)',
} as const;

// Star colors with HSL values
export const STAR_COLORS = {
  white: 'hsl(0, 0%, 100%)',
  gold: 'hsl(45, 100%, 70%)',
  'blue-white': 'hsl(210, 80%, 85%)',
  'red-orange': 'hsl(20, 90%, 65%)',
  cyan: 'hsl(185, 80%, 70%)',
} as const;

// Desktop particle configuration - optimized for 7 layers
export const PARTICLE_CONFIG = {
  // Layer distribution (total ~80 snowflakes on desktop)
  LAYER_0_PARTICLES: 8,   // Very distant
  LAYER_1_PARTICLES: 10,  // Distant
  LAYER_2_PARTICLES: 14,  // Far
  LAYER_3_PARTICLES: 16,  // Mid-far
  LAYER_4_PARTICLES: 14,  // Mid (focal)
  LAYER_5_PARTICLES: 12,  // Close
  LAYER_6_PARTICLES: 6,   // Very close (sparse)
  // Other particles
  ARC_PARTICLES: 15,
  MIST_PARTICLES: 6,
  EXHAUST_PUFFS: 4,
  GROUND_CHUNKS: 8,
  SPLASH_PARTICLES: 4,
  REINDEER_COUNT: 4,
  MAGIC_TRAIL_PARTICLES: 6,
  SLEIGH_BELLS: 3,
  STAR_RAYS: 12,
  STAR_SPARKLES: 8,
  BACKGROUND_STARS: 60,
  CONSTELLATION_STARS: 50,
} as const;

// Mobile-optimized configuration (reduced for performance)
export const MOBILE_CONFIG = {
  LAYER_0_PARTICLES: 3,
  LAYER_1_PARTICLES: 4,
  LAYER_2_PARTICLES: 6,
  LAYER_3_PARTICLES: 8,
  LAYER_4_PARTICLES: 6,
  LAYER_5_PARTICLES: 4,
  LAYER_6_PARTICLES: 2,
  ARC_PARTICLES: 8,
  MIST_PARTICLES: 3,
  EXHAUST_PUFFS: 2,
  GROUND_CHUNKS: 4,
  SPLASH_PARTICLES: 2,
  REINDEER_COUNT: 4,
  MAGIC_TRAIL_PARTICLES: 3,
  SLEIGH_BELLS: 2,
  STAR_RAYS: 6,
  STAR_SPARKLES: 4,
  BACKGROUND_STARS: 30,
  CONSTELLATION_STARS: 25,
} as const;

// Low-end device configuration (minimal)
export const LOW_END_CONFIG = {
  LAYER_0_PARTICLES: 0,
  LAYER_1_PARTICLES: 2,
  LAYER_2_PARTICLES: 3,
  LAYER_3_PARTICLES: 5,
  LAYER_4_PARTICLES: 4,
  LAYER_5_PARTICLES: 2,
  LAYER_6_PARTICLES: 0,
  ARC_PARTICLES: 4,
  MIST_PARTICLES: 2,
  EXHAUST_PUFFS: 1,
  GROUND_CHUNKS: 2,
  SPLASH_PARTICLES: 1,
  REINDEER_COUNT: 4,
  MAGIC_TRAIL_PARTICLES: 2,
  SLEIGH_BELLS: 1,
  STAR_RAYS: 4,
  STAR_SPARKLES: 2,
  BACKGROUND_STARS: 15,
  CONSTELLATION_STARS: 12,
} as const;

// Snow configuration - production optimized
export const SNOW_CONFIG = {
  SNOWFLAKES: 80,
  STARS: 30,
  SHOOTING_STARS: 0, // Handled by MeteorShower
} as const;

// Mobile snow configuration
export const MOBILE_SNOW_CONFIG = {
  SNOWFLAKES: 35,
  STARS: 18,
  SHOOTING_STARS: 0,
} as const;

// Perspective configuration for 3D depth
export const PERSPECTIVE_CONFIG = {
  PERSPECTIVE: 1200,          // Increased from 1000 for more dramatic depth
  PERSPECTIVE_ORIGIN: '50% 50%',
  MAX_PARALLAX_DESKTOP: 100,  // Increased from 60
  MAX_PARALLAX_MOBILE: 40,
  PARALLAX_SMOOTHING: 0.08,   // Lerp factor for smooth transitions
} as const;
