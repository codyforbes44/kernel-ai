import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface XAutomationRequest {
  action: 'generate' | 'analyze' | 'image';
  prompt: string;
  options?: {
    model?: string;
    tone?: 'professional' | 'casual' | 'witty' | 'informative';
    maxLength?: number;
    includeHashtags?: boolean;
    threadCount?: number;
    imageSize?: '1024x1024' | '1024x1792' | '1792x1024';
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY is not configured');
    }

    const { action, prompt, options = {} }: XAutomationRequest = await req.json();

    if (!action || !prompt) {
      throw new Error('Action and prompt are required');
    }

    let result;

    switch (action) {
      case 'generate':
        result = await generateTweetContent(XAI_API_KEY, prompt, options);
        break;
      case 'analyze':
        result = await analyzeTrends(XAI_API_KEY, prompt, options);
        break;
      case 'image':
        result = await generateImage(XAI_API_KEY, prompt, options);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('X Automation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateTweetContent(
  apiKey: string,
  prompt: string,
  options: XAutomationRequest['options']
) {
  const { tone = 'professional', maxLength = 280, includeHashtags = true, threadCount = 1 } = options || {};

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
      model: options?.model || 'grok-3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('xAI API error:', response.status, errorText);
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
      model: options?.model || 'grok-3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this topic/query for X platform strategy: ${prompt}` }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('xAI API error:', response.status, errorText);
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
    console.error('xAI Image API error:', response.status, errorText);
    
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
