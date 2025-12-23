// AI Model configurations - single source of truth
export const AI_MODELS = {
  // Gemini Models
  'google/gemini-2.5-flash': {
    name: 'Gemini Flash',
    description: 'Fast & balanced',
    speed: 'fast',
  },
  'google/gemini-2.5-pro': {
    name: 'Gemini Pro',
    description: 'Most capable reasoning',
    speed: 'slow',
  },
  'google/gemini-3-pro-preview': {
    name: 'Gemini 3 Pro',
    description: 'Next-gen capabilities',
    speed: 'slow',
  },
  'google/gemini-2.5-flash-lite': {
    name: 'Gemini Lite',
    description: 'Fastest & cheapest',
    speed: 'fastest',
  },
  // OpenAI Models
  'openai/gpt-5': {
    name: 'GPT-5',
    description: 'Most powerful reasoning',
    speed: 'slow',
  },
  'openai/gpt-5-mini': {
    name: 'GPT-5 Mini',
    description: 'Fast with strong reasoning',
    speed: 'fast',
  },
  'openai/gpt-5-nano': {
    name: 'GPT-5 Nano',
    description: 'Ultra-fast for simple tasks',
    speed: 'fastest',
  },
} as const;

export type AIModel = keyof typeof AI_MODELS;

// Maximum messages to send as context (prevents token overflow)
export const MAX_CONTEXT_MESSAGES = 20;
