import { supabase } from '@/integrations/supabase/client';

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

class XAutomationService {
  private async callEdgeFunction<T>(
    action: 'generate' | 'analyze' | 'image',
    prompt: string,
    options?: TweetGenerationOptions | ImageGenerationOptions | { model?: string }
  ): Promise<T> {
    const { data, error } = await supabase.functions.invoke('x-automation', {
      body: { action, prompt, options },
    });

    if (error) {
      console.error('X Automation error:', error);
      throw new Error(error.message || 'Failed to call X automation service');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data as T;
  }

  async generateTweet(
    prompt: string,
    options?: TweetGenerationOptions
  ): Promise<GeneratedTweet> {
    return this.callEdgeFunction<GeneratedTweet>('generate', prompt, options);
  }

  async analyzeTrends(topic: string, options?: { model?: string }): Promise<TrendAnalysis> {
    return this.callEdgeFunction<TrendAnalysis>('analyze', topic, options);
  }

  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<GeneratedImage> {
    return this.callEdgeFunction<GeneratedImage>('image', prompt, options);
  }
}

export const xAutomationService = new XAutomationService();
