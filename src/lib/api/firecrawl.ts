import { supabase } from '@/integrations/supabase/client';

export interface ProjectAnalysis {
  platform: string | null;
  platformConfidence: 'high' | 'medium' | 'low';
  framework: string | null;
  features: string[];
  techStack: string[];
  hasDatabase: boolean;
  hasAuth: boolean;
  hasAPI: boolean;
  pageType: string;
  description: string;
  suggestedProjectName: string;
}

export interface AnalyzeUrlResponse {
  success: boolean;
  data?: ProjectAnalysis;
  partial?: boolean;
  error?: string;
}

export interface ScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    links?: string[];
    metadata?: {
      title?: string;
      description?: string;
      language?: string;
      sourceURL?: string;
      statusCode?: number;
    };
  };
  error?: string;
}

export const firecrawlApi = {
  /**
   * Analyze a competitor URL to detect platform, framework, and features
   */
  async analyzeCompetitorUrl(url: string): Promise<AnalyzeUrlResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-competitor-url', {
        body: { url },
      });

      if (error) {
        console.error('Error analyzing URL:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error analyzing URL:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze URL' 
      };
    }
  },

  /**
   * Scrape a single URL for content
   */
  async scrape(url: string, options?: {
    formats?: string[];
    onlyMainContent?: boolean;
    waitFor?: number;
  }): Promise<ScrapeResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
        body: { url, ...options },
      });

      if (error) {
        console.error('Error scraping:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape' 
      };
    }
  },
};
