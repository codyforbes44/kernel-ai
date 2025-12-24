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
  // Mid layers - REMOVED ATMOSPHERIC HAZE
  SNOWFLAKES_VERY_FAR: 9,
  SNOWFLAKES_FAR: 10,
  SNOWFLAKES_MID: 11,
  // Foreground layers
  SNOWFLAKES_CLOSE: 13,
  SNOWFLAKES_VERY_CLOSE: 14,
  SANTA: 15,
  SNOWFLAKES_FOREGROUND: 16,
  SNOW_PILE: 20,
} as const;

// 7-layer depth configuration for maximum depth perception - DESKTOP
export const DEPTH_LAYERS: Record<number, DepthLayerConfig> = {
  0: { // Very distant - deep background stars
    sizeMin: 0.5, sizeMax: 1.5,
    durationMin: 22, durationMax: 28,
    opacityMin: 0.05, opacityMax: 0.15,
    blur: 2,
    translateZ: -500,
    parallaxFactor: -0.4,
    colorShift: 0.6,
    zIndex: CHRISTMAS_LAYERS.DEEP_STARS,
  },
  1: { // Distant - constellation layer
    sizeMin: 1, sizeMax: 2,
    durationMin: 18, durationMax: 24,
    opacityMin: 0.1, opacityMax: 0.25,
    blur: 1.5,
    translateZ: -350,
    parallaxFactor: -0.3,
    colorShift: 0.4,
    zIndex: CHRISTMAS_LAYERS.CONSTELLATIONS,
  },
  2: { // Far
    sizeMin: 1.5, sizeMax: 3,
    durationMin: 14, durationMax: 20,
    opacityMin: 0.2, opacityMax: 0.35,
    blur: 1,
    translateZ: -200,
    parallaxFactor: -0.15,
    colorShift: 0.25,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_FAR,
  },
  3: { // Mid-far
    sizeMin: 2, sizeMax: 4,
    durationMin: 12, durationMax: 16,
    opacityMin: 0.35, opacityMax: 0.5,
    blur: 0.5,
    translateZ: -80,
    parallaxFactor: -0.05,
    colorShift: 0.1,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_MID,
  },
  4: { // Mid - focal plane
    sizeMin: 3, sizeMax: 5,
    durationMin: 10, durationMax: 14,
    opacityMin: 0.5, opacityMax: 0.7,
    blur: 0,
    translateZ: 0,
    parallaxFactor: 0,
    colorShift: 0,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_CLOSE,
  },
  5: { // Close
    sizeMin: 4, sizeMax: 6,
    durationMin: 7, durationMax: 10,
    opacityMin: 0.7, opacityMax: 0.85,
    blur: 0,
    translateZ: 150,
    parallaxFactor: 0.25,
    colorShift: 0,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_VERY_CLOSE,
  },
  6: { // Very close (sparse foreground)
    sizeMin: 5, sizeMax: 8,
    durationMin: 4, durationMax: 7,
    opacityMin: 0.85, opacityMax: 0.98,
    blur: 0,
    translateZ: 300,
    parallaxFactor: 0.5,
    colorShift: 0,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_FOREGROUND,
  },
} as const;

// Mobile depth layers - reduced sizes and blur for performance
export const MOBILE_DEPTH_LAYERS: Record<number, DepthLayerConfig> = {
  0: {
    sizeMin: 0.3, sizeMax: 1,
    durationMin: 20, durationMax: 26,
    opacityMin: 0.05, opacityMax: 0.12,
    blur: 0, // No blur on mobile
    translateZ: -500,
    parallaxFactor: -0.2,
    colorShift: 0.4,
    zIndex: CHRISTMAS_LAYERS.DEEP_STARS,
  },
  1: {
    sizeMin: 0.5, sizeMax: 1.5,
    durationMin: 16, durationMax: 22,
    opacityMin: 0.1, opacityMax: 0.2,
    blur: 0,
    translateZ: -350,
    parallaxFactor: -0.15,
    colorShift: 0.3,
    zIndex: CHRISTMAS_LAYERS.CONSTELLATIONS,
  },
  2: {
    sizeMin: 1, sizeMax: 2,
    durationMin: 12, durationMax: 18,
    opacityMin: 0.18, opacityMax: 0.3,
    blur: 0,
    translateZ: -200,
    parallaxFactor: -0.1,
    colorShift: 0.15,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_FAR,
  },
  3: {
    sizeMin: 1.5, sizeMax: 3,
    durationMin: 10, durationMax: 14,
    opacityMin: 0.3, opacityMax: 0.45,
    blur: 0,
    translateZ: -80,
    parallaxFactor: 0,
    colorShift: 0.05,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_MID,
  },
  4: {
    sizeMin: 2, sizeMax: 4,
    durationMin: 8, durationMax: 12,
    opacityMin: 0.45, opacityMax: 0.65,
    blur: 0,
    translateZ: 0,
    parallaxFactor: 0,
    colorShift: 0,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_CLOSE,
  },
  5: {
    sizeMin: 3, sizeMax: 5,
    durationMin: 6, durationMax: 9,
    opacityMin: 0.6, opacityMax: 0.8,
    blur: 0,
    translateZ: 150,
    parallaxFactor: 0.1,
    colorShift: 0,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_VERY_CLOSE,
  },
  6: {
    sizeMin: 4, sizeMax: 6,
    durationMin: 4, durationMax: 6,
    opacityMin: 0.75, opacityMax: 0.9,
    blur: 0,
    translateZ: 300,
    parallaxFactor: 0.2,
    colorShift: 0,
    zIndex: CHRISTMAS_LAYERS.SNOWFLAKES_FOREGROUND,
  },
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
  // Layer distribution (total ~60 snowflakes on desktop - reduced from 80)
  LAYER_0_PARTICLES: 6,
  LAYER_1_PARTICLES: 8,
  LAYER_2_PARTICLES: 10,
  LAYER_3_PARTICLES: 12,
  LAYER_4_PARTICLES: 10,
  LAYER_5_PARTICLES: 8,
  LAYER_6_PARTICLES: 4,
  // Other particles
  ARC_PARTICLES: 12,
  MIST_PARTICLES: 4,
  EXHAUST_PUFFS: 3,
  GROUND_CHUNKS: 6,
  SPLASH_PARTICLES: 3,
  REINDEER_COUNT: 4,
  MAGIC_TRAIL_PARTICLES: 5,
  SLEIGH_BELLS: 3,
  STAR_RAYS: 8,
  STAR_SPARKLES: 6,
  BACKGROUND_STARS: 40,
  CONSTELLATION_STARS: 35,
} as const;

// Mobile-optimized configuration (reduced for performance)
export const MOBILE_CONFIG = {
  LAYER_0_PARTICLES: 2,
  LAYER_1_PARTICLES: 3,
  LAYER_2_PARTICLES: 5,
  LAYER_3_PARTICLES: 6,
  LAYER_4_PARTICLES: 5,
  LAYER_5_PARTICLES: 3,
  LAYER_6_PARTICLES: 2,
  ARC_PARTICLES: 6,
  MIST_PARTICLES: 2,
  EXHAUST_PUFFS: 2,
  GROUND_CHUNKS: 3,
  SPLASH_PARTICLES: 2,
  REINDEER_COUNT: 4,
  MAGIC_TRAIL_PARTICLES: 3,
  SLEIGH_BELLS: 2,
  STAR_RAYS: 4,
  STAR_SPARKLES: 3,
  BACKGROUND_STARS: 20,
  CONSTELLATION_STARS: 18,
} as const;

// Low-end device configuration (minimal)
export const LOW_END_CONFIG = {
  LAYER_0_PARTICLES: 0,
  LAYER_1_PARTICLES: 1,
  LAYER_2_PARTICLES: 2,
  LAYER_3_PARTICLES: 4,
  LAYER_4_PARTICLES: 3,
  LAYER_5_PARTICLES: 2,
  LAYER_6_PARTICLES: 0,
  ARC_PARTICLES: 3,
  MIST_PARTICLES: 1,
  EXHAUST_PUFFS: 1,
  GROUND_CHUNKS: 2,
  SPLASH_PARTICLES: 1,
  REINDEER_COUNT: 4,
  MAGIC_TRAIL_PARTICLES: 2,
  SLEIGH_BELLS: 1,
  STAR_RAYS: 0,
  STAR_SPARKLES: 2,
  BACKGROUND_STARS: 10,
  CONSTELLATION_STARS: 8,
} as const;

// Snow configuration - production optimized
export const SNOW_CONFIG = {
  SNOWFLAKES: 60,
  STARS: 25,
  SHOOTING_STARS: 0,
} as const;

// Mobile snow configuration
export const MOBILE_SNOW_CONFIG = {
  SNOWFLAKES: 28,
  STARS: 12,
  SHOOTING_STARS: 0,
} as const;

// Perspective configuration for 3D depth
export const PERSPECTIVE_CONFIG = {
  PERSPECTIVE: 1200,
  PERSPECTIVE_ORIGIN: '50% 50%',
  MAX_PARALLAX_DESKTOP: 80,
  MAX_PARALLAX_MOBILE: 30,
  PARALLAX_SMOOTHING: 0.08,
} as const;

// Size caps for mobile devices
export const SIZE_CAPS = {
  DESKTOP_MAX_SNOWFLAKE: 8,
  MOBILE_MAX_SNOWFLAKE: 5,
  VERY_SMALL_MAX_SNOWFLAKE: 4,
  DESKTOP_MAX_STAR_GLOW: 6,
  MOBILE_MAX_STAR_GLOW: 3,
  VERY_SMALL_MAX_STAR_GLOW: 2,
} as const;
