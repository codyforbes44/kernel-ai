import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface XAutomationRequest {
  action: 'generate' | 'analyze' | 'image' | 'status';
  prompt?: string;
  options?: {
    model?: string;
    tone?: 'professional' | 'casual' | 'witty' | 'informative';
    maxLength?: number;
    includeHashtags?: boolean;
    threadCount?: number;
    imageSize?: '1024x1024' | '1024x1792' | '1792x1024';
  };
}

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  limit?: number;
  default_model?: string;
  max_tokens?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { action, prompt, options = {} }: XAutomationRequest = await req.json();

    // Handle status check (for admin panel)
    if (action === 'status') {
      const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
      return new Response(
        JSON.stringify({ 
          configured: !!XAI_API_KEY,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Check if xAI is enabled and rate limits
    const rateLimitResult = await checkRateLimit(supabase, userId);
    
    if (!rateLimitResult.allowed) {
      console.log('[xAI] Rate limit or settings check failed:', rateLimitResult.reason);
      return new Response(
        JSON.stringify({ 
          error: rateLimitResult.reason,
          remaining: rateLimitResult.remaining,
          limit: rateLimitResult.limit
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY is not configured');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Use default model from settings if not specified
    const model = options.model || rateLimitResult.default_model || 'grok-3-fast';
    const updatedOptions = { ...options, model };

    let result;
    let tokensUsed = 0;

    switch (action) {
      case 'generate':
        result = await generateTweetContent(XAI_API_KEY, prompt, updatedOptions);
        tokensUsed = estimateTokens(prompt) + estimateTokens(JSON.stringify(result));
        break;
      case 'analyze':
        result = await analyzeTrends(XAI_API_KEY, prompt, updatedOptions);
        tokensUsed = estimateTokens(prompt) + estimateTokens(JSON.stringify(result));
        break;
      case 'image':
        result = await generateImage(XAI_API_KEY, prompt, updatedOptions);
        tokensUsed = 500; // Flat rate for image generation
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log usage
    if (userId) {
      await logUsage(supabase, userId, tokensUsed, action, model);
    }

    console.log(`[xAI] Request completed: action=${action}, user=${userId?.slice(0, 8)}, tokens=${tokensUsed}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[xAI] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Check rate limits and settings
async function checkRateLimit(supabase: any, userId: string | null): Promise<RateLimitResult> {
  try {
    // First check if xAI is enabled
    const { data: settings, error: settingsError } = await supabase
      .from('xai_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError || !settings) {
      // If no settings, allow but with defaults
      return { allowed: true, default_model: 'grok-3-fast', max_tokens: 4000 };
    }

    if (!settings.is_enabled) {
      return { allowed: false, reason: 'xAI features are currently disabled' };
    }

    // If no user ID, allow but can't track
    if (!userId) {
      return { 
        allowed: true, 
        default_model: settings.default_model, 
        max_tokens: settings.max_tokens_per_request 
      };
    }

    // Check user's rate limit using database function
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_xai_rate_limit', { p_user_id: userId });

    if (rateLimitError) {
      console.error('[xAI] Rate limit check error:', rateLimitError);
      // On error, allow but log
      return { 
        allowed: true, 
        default_model: settings.default_model, 
        max_tokens: settings.max_tokens_per_request 
      };
    }

    return rateLimitData as RateLimitResult;
  } catch (error) {
    console.error('[xAI] Rate limit check failed:', error);
    // On error, allow to prevent blocking
    return { allowed: true, default_model: 'grok-3-fast', max_tokens: 4000 };
  }
}

// Log usage to tracking table
async function logUsage(
  supabase: any, 
  userId: string, 
  tokensUsed: number,
  action: string,
  model: string
) {
  try {
    // Increment usage tracking
    await supabase.rpc('increment_xai_usage', { 
      p_user_id: userId, 
      p_tokens: tokensUsed,
      p_credits: Math.ceil(tokensUsed / 100) // 1 credit per 100 tokens
    });

    // Also log to ai_usage_logs for unified tracking
    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      function_name: `x-automation:${action}`,
      model: model,
      tokens_input: Math.floor(tokensUsed * 0.3),
      tokens_output: Math.floor(tokensUsed * 0.7),
      credits_used: Math.ceil(tokensUsed / 100),
    });
  } catch (error) {
    console.error('[xAI] Usage logging error:', error);
    // Don't throw - logging failure shouldn't block the request
  }
}

// Estimate tokens (rough approximation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

async function generateTweetContent(
  apiKey: string,
  prompt: string,
  options: XAutomationRequest['options']
) {
  const { tone = 'professional', maxLength = 280, includeHashtags = true, threadCount = 1, model = 'grok-3-fast' } = options || {};

  const systemPrompt = `You are an expert X (Twitter) content creator. Generate engaging tweet content based on the user's request.

Guidelines:
- Tone: ${tone}
- Maximum length per tweet: ${maxLength} characters
- ${includeHashtags ? 'Include relevant hashtags (2-3 max)' : 'Do not include hashtags'}
- ${threadCount > 1 ? `Create a thread of ${threadCount} tweets, numbered 1/${threadCount}, 2/${threadCount}, etc.` : 'Create a single tweet'}
- Make content engaging, shareable, and optimized for X platform
- Use emojis sparingly but effectively
- Include a call-to-action when appropriate

Return JSON format:
{
  "tweets": ["tweet content 1", "tweet content 2"],
  "characterCounts": [150, 200],
  "hashtags": ["#hashtag1", "#hashtag2"],
  "suggestedPostTime": "Best time suggestion based on content type"
}`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[xAI] API error:', response.status, errorText);
    throw new Error(`xAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  try {
    // Try to parse as JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { type: 'generate', ...JSON.parse(jsonMatch[0]) };
    }
  } catch {
    // If not valid JSON, return as plain text
  }
  
  return { 
    type: 'generate', 
    tweets: [content?.slice(0, maxLength) || ''],
    characterCounts: [content?.length || 0],
    raw: content 
  };
}

async function analyzeTrends(
  apiKey: string,
  prompt: string,
  options: XAutomationRequest['options']
) {
  const { model = 'grok-3-fast' } = options || {};

  const systemPrompt = `You are an expert X (Twitter) trends analyst with real-time access to X platform data. Analyze trends and provide actionable insights.

Analyze the topic/query and provide:
1. Current trending status and relevance
2. Key conversations and sentiment analysis
3. Top influencers discussing this topic
4. Best engagement strategies
5. Optimal posting times
6. Relevant hashtags to use
7. Content angle recommendations

Return JSON format:
{
  "topic": "analyzed topic",
  "trendScore": 0-100,
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "keyInsights": ["insight 1", "insight 2"],
  "recommendedHashtags": ["#tag1", "#tag2"],
  "bestPostingTimes": ["9 AM EST", "2 PM EST"],
  "contentAngles": ["angle 1", "angle 2"],
  "competitorAnalysis": "brief competitor overview"
}`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this topic/query for X platform strategy: ${prompt}` }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[xAI] API error:', response.status, errorText);
    throw new Error(`xAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { type: 'analyze', ...JSON.parse(jsonMatch[0]) };
    }
  } catch {
    // If not valid JSON, return structured response
  }
  
  return { 
    type: 'analyze', 
    topic: prompt,
    analysis: content,
    raw: content 
  };
}

async function generateImage(
  apiKey: string,
  prompt: string,
  options: XAutomationRequest['options']
) {
  const { imageSize = '1024x1024' } = options || {};

  const enhancedPrompt = `Create a professional, eye-catching image for X (Twitter) post: ${prompt}. 
The image should be optimized for social media engagement, with clear visuals and modern aesthetic.`;

  const response = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-2-image',
      prompt: enhancedPrompt,
      n: 1,
      size: imageSize,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[xAI] Image API error:', response.status, errorText);
    
    // Fallback: use text model to describe what image should be created
    return {
      type: 'image',
      error: 'Image generation not available',
      suggestion: `Create an image with: ${prompt}`,
      imageUrl: null,
    };
  }

  const data = await response.json();
  
  return {
    type: 'image',
    imageUrl: data.data?.[0]?.url || null,
    revisedPrompt: data.data?.[0]?.revised_prompt || prompt,
  };
}
