// AI Model configurations - single source of truth
export const AI_MODELS = {
  // xAI Grok Models
  'xai/grok-3': {
    name: 'Grok-3',
    description: 'Most capable with live X data',
    speed: 'medium',
    costTier: 'high',
    capabilities: ['Advanced reasoning', 'Live X data access', 'Complex coding', 'Real-time trends'],
    contextWindow: '128K tokens',
    bestFor: 'X platform automation and real-time analysis',
  },
  'xai/grok-3-fast': {
    name: 'Grok-3 Fast',
    description: 'Speed-optimized Grok',
    speed: 'fast',
    costTier: 'medium',
    capabilities: ['Fast responses', 'X data access', 'Content generation', 'Trend analysis'],
    contextWindow: '128K tokens',
    bestFor: 'Quick X content generation and analysis',
  },
  'xai/grok-2-image': {
    name: 'Grok-2 Image',
    description: 'Image generation for social',
    speed: 'medium',
    costTier: 'medium',
    capabilities: ['Image generation', 'Social graphics', 'Visual content'],
    contextWindow: 'N/A',
    bestFor: 'Creating images for X posts',
  },
  // Gemini Models
  'google/gemini-2.5-flash': {
    name: 'Gemini Flash',
    description: 'Fast & balanced',
    speed: 'fast',
    costTier: 'low',
    capabilities: ['Text generation', 'Code assistance', 'Reasoning', 'Multimodal'],
    contextWindow: '1M tokens',
    bestFor: 'General tasks requiring speed and quality balance',
  },
  'google/gemini-2.5-pro': {
    name: 'Gemini Pro',
    description: 'Most capable reasoning',
    speed: 'slow',
    costTier: 'high',
    capabilities: ['Advanced reasoning', 'Complex coding', 'Deep analysis', 'Multimodal', 'Large context'],
    contextWindow: '2M tokens',
    bestFor: 'Complex problems requiring deep reasoning',
  },
  'google/gemini-3-pro-preview': {
    name: 'Gemini 3 Pro',
    description: 'Next-gen capabilities',
    speed: 'slow',
    costTier: 'high',
    capabilities: ['Next-gen reasoning', 'Enhanced coding', 'Advanced multimodal', 'Improved accuracy'],
    contextWindow: '2M tokens',
    bestFor: 'Cutting-edge tasks requiring latest capabilities',
  },
  'google/gemini-2.5-flash-lite': {
    name: 'Gemini Lite',
    description: 'Fastest & cheapest',
    speed: 'fastest',
    costTier: 'lowest',
    capabilities: ['Text generation', 'Simple tasks', 'Classification', 'Summarization'],
    contextWindow: '128K tokens',
    bestFor: 'High-volume simple tasks and quick responses',
  },
  // OpenAI Models
  'openai/gpt-5': {
    name: 'GPT-5',
    description: 'Most powerful reasoning',
    speed: 'slow',
    costTier: 'highest',
    capabilities: ['Supreme reasoning', 'Complex coding', 'Creative writing', 'Multimodal', 'Long context'],
    contextWindow: '256K tokens',
    bestFor: 'Most demanding tasks requiring peak intelligence',
  },
  'openai/gpt-5-mini': {
    name: 'GPT-5 Mini',
    description: 'Fast with strong reasoning',
    speed: 'fast',
    costTier: 'medium',
    capabilities: ['Strong reasoning', 'Code generation', 'Multimodal', 'Balanced performance'],
    contextWindow: '128K tokens',
    bestFor: 'Quality results with reasonable speed and cost',
  },
  'openai/gpt-5-nano': {
    name: 'GPT-5 Nano',
    description: 'Ultra-fast for simple tasks',
    speed: 'fastest',
    costTier: 'low',
    capabilities: ['Fast responses', 'Simple tasks', 'Classification', 'Quick edits'],
    contextWindow: '64K tokens',
    bestFor: 'Speed-critical simple tasks',
  },
} as const;

export type AIModel = keyof typeof AI_MODELS;

// Maximum messages to send as context (prevents token overflow)
export const MAX_CONTEXT_MESSAGES = 20;
