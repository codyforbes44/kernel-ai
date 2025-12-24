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
  SNOWFLAKES: 10,
  SNOW_PILE: 12,
  SNOWBLOWER: 15,
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

// Snow configuration
export const SNOW_CONFIG = {
  SNOWFLAKES: 30,
  STARS: 20,
  SHOOTING_STARS: 2,
} as const;

// Mobile snow configuration
export const MOBILE_SNOW_CONFIG = {
  SNOWFLAKES: 15,
  STARS: 10,
  SHOOTING_STARS: 1,
} as const;
