// Shared AI model configuration and constants for Kernel
// This module provides consistent model references across all edge functions

// ============================================================================
// LOVABLE AI GATEWAY MODELS
// ============================================================================

export const LOVABLE_AI_MODELS = {
  // Google Gemini Models
  GEMINI_FLASH: 'google/gemini-2.5-flash',
  GEMINI_FLASH_LITE: 'google/gemini-2.5-flash-lite',
  GEMINI_PRO: 'google/gemini-2.5-pro',
  GEMINI_3_PRO: 'google/gemini-3-pro-preview',
  GEMINI_IMAGE: 'google/gemini-2.5-flash-image-preview',
  GEMINI_3_IMAGE: 'google/gemini-3-pro-image-preview',
  
  // OpenAI Models
  GPT5: 'openai/gpt-5',
  GPT5_MINI: 'openai/gpt-5-mini',
  GPT5_NANO: 'openai/gpt-5-nano',
} as const;

export type LovableAIModel = typeof LOVABLE_AI_MODELS[keyof typeof LOVABLE_AI_MODELS];

// Default model for general use
export const DEFAULT_MODEL = LOVABLE_AI_MODELS.GEMINI_FLASH;

// Model for complex reasoning tasks
export const REASONING_MODEL = LOVABLE_AI_MODELS.GEMINI_PRO;

// Model for fast, simple tasks
export const FAST_MODEL = LOVABLE_AI_MODELS.GEMINI_FLASH_LITE;

// ============================================================================
// REPLICATE MODELS (Image/Video Generation)
// ============================================================================

export const REPLICATE_MODELS = {
  // Image Generation
  FLUX_SCHNELL: 'black-forest-labs/flux-schnell',
  FLUX_DEV: 'black-forest-labs/flux-dev',
  FLUX_PRO: 'black-forest-labs/flux-1.1-pro',
  SDXL: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  
  // Image Upscaling
  REAL_ESRGAN: 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
  
  // ControlNet Models
  CONTROLNET_CANNY: 'jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613',
  CONTROLNET_DEPTH: 'jagilley/controlnet-depth:922c7bb67b87ec32cbc2fd11b1d5f94f0ba4f5519c4dbd02856376444127cc60',
  CONTROLNET_POSE: 'jagilley/controlnet-pose:0304f7f774ba7341ef754231f794b1ba3c9a4e059673e4fdd4b6d4e4e1b6ff2a',
  CONTROLNET_SCRIBBLE: 'jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117',
  CONTROLNET_SOFTEDGE: 'jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56f33f3b1e',
  
  // Video Generation
  STABLE_VIDEO: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
} as const;

export type ReplicateModel = typeof REPLICATE_MODELS[keyof typeof REPLICATE_MODELS];

// ============================================================================
// VIDEO GENERATION MODELS (External APIs)
// ============================================================================

export const VIDEO_MODELS = {
  LUMA: 'luma',
  KLING: 'kling',
  MINIMAX: 'minimax',
  STABLE_VIDEO: 'stable-video',
} as const;

export type VideoModel = typeof VIDEO_MODELS[keyof typeof VIDEO_MODELS];

// ============================================================================
// MODEL CAPABILITIES
// ============================================================================

export interface ModelCapabilities {
  streaming: boolean;
  vision: boolean;
  tools: boolean;
  maxTokens: number;
  contextWindow: number;
}

export const MODEL_CAPABILITIES: Record<LovableAIModel, ModelCapabilities> = {
  [LOVABLE_AI_MODELS.GEMINI_FLASH]: {
    streaming: true,
    vision: true,
    tools: true,
    maxTokens: 8192,
    contextWindow: 1000000,
  },
  [LOVABLE_AI_MODELS.GEMINI_FLASH_LITE]: {
    streaming: true,
    vision: true,
    tools: true,
    maxTokens: 8192,
    contextWindow: 1000000,
  },
  [LOVABLE_AI_MODELS.GEMINI_PRO]: {
    streaming: true,
    vision: true,
    tools: true,
    maxTokens: 8192,
    contextWindow: 2000000,
  },
  [LOVABLE_AI_MODELS.GEMINI_3_PRO]: {
    streaming: true,
    vision: true,
    tools: true,
    maxTokens: 16384,
    contextWindow: 2000000,
  },
  [LOVABLE_AI_MODELS.GEMINI_IMAGE]: {
    streaming: false,
    vision: true,
    tools: false,
    maxTokens: 8192,
    contextWindow: 1000000,
  },
  [LOVABLE_AI_MODELS.GEMINI_3_IMAGE]: {
    streaming: false,
    vision: true,
    tools: false,
    maxTokens: 8192,
    contextWindow: 1000000,
  },
  [LOVABLE_AI_MODELS.GPT5]: {
    streaming: true,
    vision: true,
    tools: true,
    maxTokens: 16384,
    contextWindow: 128000,
  },
  [LOVABLE_AI_MODELS.GPT5_MINI]: {
    streaming: true,
    vision: true,
    tools: true,
    maxTokens: 16384,
    contextWindow: 128000,
  },
  [LOVABLE_AI_MODELS.GPT5_NANO]: {
    streaming: true,
    vision: true,
    tools: true,
    maxTokens: 8192,
    contextWindow: 128000,
  },
};

// ============================================================================
// ASPECT RATIOS
// ============================================================================

export const ASPECT_RATIOS = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
  '4:3': { width: 1152, height: 896 },
  '3:4': { width: 896, height: 1152 },
  '21:9': { width: 1536, height: 640 },
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;

// ============================================================================
// STYLE PRESETS
// ============================================================================

export const IMAGE_STYLES = {
  realistic: 'Highly detailed photorealistic style with natural lighting',
  illustration: 'Digital illustration style with clean lines and vibrant colors',
  icon: 'Simple, clean icon design with minimal details',
  '3d': '3D rendered style with depth and realistic materials',
  abstract: 'Abstract artistic style with creative compositions',
  minimal: 'Minimalist design with clean aesthetics and limited colors',
} as const;

export type ImageStyle = keyof typeof IMAGE_STYLES;

// ============================================================================
// CONTROLNET TYPES
// ============================================================================

export const CONTROLNET_TYPES = {
  canny: {
    name: 'Canny Edge',
    description: 'Preserves edges and outlines from the reference image',
    model: REPLICATE_MODELS.CONTROLNET_CANNY,
  },
  depth: {
    name: 'Depth Map',
    description: 'Maintains 3D spatial relationships and depth',
    model: REPLICATE_MODELS.CONTROLNET_DEPTH,
  },
  pose: {
    name: 'Pose Detection',
    description: 'Keeps human body poses consistent',
    model: REPLICATE_MODELS.CONTROLNET_POSE,
  },
  scribble: {
    name: 'Scribble',
    description: 'Generates from rough sketches and drawings',
    model: REPLICATE_MODELS.CONTROLNET_SCRIBBLE,
  },
  softedge: {
    name: 'Soft Edge',
    description: 'Softer edge preservation for artistic effects',
    model: REPLICATE_MODELS.CONTROLNET_SOFTEDGE,
  },
} as const;

export type ControlNetType = keyof typeof CONTROLNET_TYPES;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the dimensions for an aspect ratio
 */
export function getAspectRatioDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
  return ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['1:1'];
}

/**
 * Get the style prompt enhancement for an image style
 */
export function getStylePrompt(style: ImageStyle): string {
  return IMAGE_STYLES[style] || '';
}

/**
 * Get the ControlNet model for a control type
 */
export function getControlNetModel(controlType: ControlNetType): string {
  return CONTROLNET_TYPES[controlType]?.model || CONTROLNET_TYPES.canny.model;
}

/**
 * Check if a model supports a specific capability
 */
export function modelSupports(model: LovableAIModel, capability: keyof ModelCapabilities): boolean {
  const caps = MODEL_CAPABILITIES[model];
  if (!caps) return false;
  return !!caps[capability];
}
