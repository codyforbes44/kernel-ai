// AI Model configurations - single source of truth
export const AI_MODELS = {
  'google/gemini-2.5-flash': {
    name: 'Gemini Flash',
    description: 'Fast & balanced',
    speed: 'fast',
  },
  'google/gemini-2.5-pro': {
    name: 'Gemini Pro',
    description: 'Most capable',
    speed: 'slow',
  },
  'google/gemini-2.5-flash-lite': {
    name: 'Gemini Lite',
    description: 'Fastest & cheapest',
    speed: 'fastest',
  },
} as const;

export type AIModel = keyof typeof AI_MODELS;

// Maximum messages to send as context (prevents token overflow)
export const MAX_CONTEXT_MESSAGES = 20;
