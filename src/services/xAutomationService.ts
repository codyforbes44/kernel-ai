import { invoke } from '@/lib/serviceWrapper';
import { logger } from '@/lib/logger';

export interface TweetGenerationOptions {
  model?: 'grok-3' | 'grok-3-fast';
  tone?: 'professional' | 'casual' | 'witty' | 'informative';
  maxLength?: number;
  includeHashtags?: boolean;
  threadCount?: number;
}

export interface ImageGenerationOptions {
  imageSize?: '1024x1024' | '1024x1792' | '1792x1024';
}

export interface GeneratedTweet {
  type: 'generate';
  tweets: string[];
  characterCounts: number[];
  hashtags?: string[];
  suggestedPostTime?: string;
  raw?: string;
}

export interface TrendAnalysis {
  type: 'analyze';
  topic: string;
  trendScore?: number;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  keyInsights?: string[];
  recommendedHashtags?: string[];
  bestPostingTimes?: string[];
  contentAngles?: string[];
  competitorAnalysis?: string;
  analysis?: string;
  raw?: string;
}

export interface GeneratedImage {
  type: 'image';
  imageUrl: string | null;
  revisedPrompt?: string;
  error?: string;
  suggestion?: string;
}

type XAutomationAction = 'generate' | 'analyze' | 'image';

async function callXAutomation<T>(
  action: XAutomationAction,
  prompt: string,
  options?: TweetGenerationOptions | ImageGenerationOptions | { model?: string }
): Promise<T> {
  logger.info('[XAutomation] Calling:', { action, prompt: prompt.slice(0, 50) });
  
  return invoke<T>('x-automation', { action, prompt, options }, {
    retries: 1,
    retryDelay: 2000,
  });
}

export const xAutomationService = {
  async generateTweet(
    prompt: string,
    options?: TweetGenerationOptions
  ): Promise<GeneratedTweet> {
    return callXAutomation<GeneratedTweet>('generate', prompt, options);
  },

  async analyzeTrends(
    topic: string, 
    options?: { model?: string }
  ): Promise<TrendAnalysis> {
    return callXAutomation<TrendAnalysis>('analyze', topic, options);
  },

  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<GeneratedImage> {
    return callXAutomation<GeneratedImage>('image', prompt, options);
  },
};
