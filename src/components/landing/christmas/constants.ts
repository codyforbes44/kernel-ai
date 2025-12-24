// Animation cycle timing (in seconds) - single source of truth
export const ANIMATION_TIMING = {
  CYCLE_DURATION: 25,      // Total cycle length
  ACCUMULATE_PHASE: 15,    // Snow accumulates (0-60%)
  BLOWER_ACTIVE_START: 0.62, // 62% - blower starts crossing
  BLOWER_ACTIVE_END: 0.92,   // 92% - blower exits
  BLOWER_PHASE: 8,         // Duration of blower crossing
} as const;

// Particle configuration - optimized counts
export const PARTICLE_CONFIG = {
  ARC_PARTICLES: 15,       // Reduced from 25
  MIST_PARTICLES: 6,       // Reduced from 12
  EXHAUST_PUFFS: 4,
  GROUND_CHUNKS: 8,        // Reduced from 15
  SPLASH_PARTICLES: 4,     // Reduced from 5
} as const;

// Snow configuration
export const SNOW_CONFIG = {
  SNOWFLAKES: 30,          // Reduced from 35
  STARS: 20,               // Reduced from 25
  SHOOTING_STARS: 2,       // Reduced from 3
} as const;
