// Animation cycle timing (in seconds) - single source of truth
export const ANIMATION_TIMING = {
  CYCLE_DURATION: 25,        // Total cycle length
  ACCUMULATE_PHASE: 15,      // Snow accumulates (0-60%)
  BLOWER_ACTIVE_START: 0.62, // 62% - blower starts crossing
  BLOWER_ACTIVE_END: 0.92,   // 92% - blower exits
  BLOWER_PHASE: 8,           // Duration of blower crossing
} as const;

// Z-index layer system for consistent stacking
export const CHRISTMAS_LAYERS = {
  AURORA: 1,
  STARS: 2,
  SHOOTING_STARS: 3,
  NORTH_STAR: 5,
  SANTA: 8,
  ATMOSPHERIC_HAZE: 9,
  SNOWFLAKES_FAR: 10,
  SNOWFLAKES_MID: 11,
  SNOWFLAKES_CLOSE: 12,
  SNOW_PILE: 15,
} as const;

// 5-layer depth configuration for snowflakes
export const DEPTH_LAYERS = {
  0: { // Very distant
    sizeMin: 1, sizeMax: 2,
    durationMin: 18, durationMax: 22,
    opacityMin: 0.1, opacityMax: 0.2,
    blur: 2.5,
    translateZ: -300,
    parallaxFactor: -0.3,
  },
  1: { // Far
    sizeMin: 2, sizeMax: 3.5,
    durationMin: 14, durationMax: 18,
    opacityMin: 0.2, opacityMax: 0.35,
    blur: 1.5,
    translateZ: -150,
    parallaxFactor: -0.15,
  },
  2: { // Mid
    sizeMin: 3.5, sizeMax: 5,
    durationMin: 10, durationMax: 14,
    opacityMin: 0.4, opacityMax: 0.55,
    blur: 0.5,
    translateZ: 0,
    parallaxFactor: 0,
  },
  3: { // Close
    sizeMin: 5, sizeMax: 7,
    durationMin: 7, durationMax: 10,
    opacityMin: 0.6, opacityMax: 0.8,
    blur: 0,
    translateZ: 100,
    parallaxFactor: 0.2,
  },
  4: { // Very close (sparse)
    sizeMin: 7, sizeMax: 10,
    durationMin: 4, durationMax: 7,
    opacityMin: 0.8, opacityMax: 0.95,
    blur: 0,
    translateZ: 200,
    parallaxFactor: 0.4,
  },
} as const;

// Desktop particle configuration - optimized counts
export const PARTICLE_CONFIG = {
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
} as const;

// Mobile-optimized configuration (50% of desktop)
export const MOBILE_CONFIG = {
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
} as const;

// Snow configuration - production optimized
export const SNOW_CONFIG = {
  SNOWFLAKES: 60,
  STARS: 25,
  SHOOTING_STARS: 0, // Handled by MeteorShower
} as const;

// Mobile snow configuration
export const MOBILE_SNOW_CONFIG = {
  SNOWFLAKES: 30,
  STARS: 15,
  SHOOTING_STARS: 0,
} as const;
