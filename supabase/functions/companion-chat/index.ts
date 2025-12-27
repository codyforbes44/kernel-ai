import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

import type { CompanionChatRequest, Message, ChatResponse } from './types.ts';
import { calculateAffinityChange, getAffinityDescription } from './affinity.ts';
import { extractEmotionTags } from './emotions.ts';
import { extractMemoryUpdates } from './memory.ts';
import { checkMilestones } from './milestones.ts';
import { buildApiMessages } from './prompt-builder.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
    if (!XAI_API_KEY) throw new Error('XAI_API_KEY is not configured');

    const authHeader = req.headers.get('authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Authenticate user
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id ?? null;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { companion_id, message, conversation_id, stream = false } = await req.json() as CompanionChatRequest & { stream?: boolean };

    if (!companion_id || !message) {
      return new Response(JSON.stringify({ error: 'companion_id and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get companion profile
    const { data: companion, error: companionError } = await supabase
      .from('companion_profiles')
      .select('*')
      .eq('id', companion_id)
      .eq('is_active', true)
      .single();

    if (companionError || !companion) {
      return new Response(JSON.stringify({ error: 'Companion not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get or create relationship
    let { data: relationship } = await supabase
      .from('companion_relationships')
      .select('*')
      .eq('user_id', userId)
      .eq('companion_id', companion_id)
      .single();

    if (!relationship) {
      const { data: newRel, error: createError } = await supabase
        .from('companion_relationships')
        .insert({
          user_id: userId,
          companion_id: companion_id,
          affinity_level: 0,
          memory_context: {},
          milestones: [],
          current_mood: 'neutral'
        })
        .select()
        .single();

      if (createError) throw new Error('Failed to create relationship');
      relationship = newRel;
    }

    // Get or create conversation
    let activeConversation: { id: string } | null = null;
    
    if (conversation_id) {
      const { data: conv } = await supabase
        .from('companion_conversations')
        .select('id')
        .eq('id', conversation_id)
        .eq('relationship_id', relationship.id)
        .single();
      activeConversation = conv;
    }

    if (!activeConversation) {
      const { data: newConv, error: convError } = await supabase
        .from('companion_conversations')
        .insert({
          relationship_id: relationship.id,
          title: 'Chat with ' + companion.name,
          mood_at_start: relationship.current_mood
        })
        .select('id')
        .single();

      if (convError) throw new Error('Failed to create conversation');
      activeConversation = newConv;
    }

    // Get recent messages for context
    const { data: recentMessages } = await supabase
      .from('companion_messages')
      .select('role, content')
      .eq('conversation_id', activeConversation.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const messageHistory: Message[] = (recentMessages || []).reverse();

    // Build API messages using prompt builder
    const apiMessages = buildApiMessages({
      companion,
      relationship,
      messageHistory,
      userMessage: message
    });

    // Save user message immediately
    await supabase.from('companion_messages').insert({
      conversation_id: activeConversation.id,
      role: 'user',
      content: message,
      emotion_tags: [],
      affinity_change: 0
    });

    // Handle streaming vs non-streaming
    if (stream) {
      console.log('Starting streaming response for companion chat...');
      
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-3-fast',
          messages: apiMessages,
          max_tokens: 500,
          temperature: 0.8,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('xAI API error:', response.status, errorText);
        throw new Error(`xAI API error: ${response.status}`);
      }

      // Create a transform stream to process SSE and add metadata at the end
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let tokensUsed = 0;

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk);
          const lines = text.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                // Process final metadata
                const affinityChange = calculateAffinityChange(message, fullResponse);
                const newAffinity = Math.max(0, Math.min(100, relationship.affinity_level + affinityChange));
                const emotionTags = extractEmotionTags(fullResponse, companion.personality_type);
                const memoryUpdates = extractMemoryUpdates(message, relationship.memory_context);
                const newMessageCount = relationship.total_messages + 2;
                const newMilestones = checkMilestones({ ...relationship, affinity_level: newAffinity }, newMessageCount);
                const newMilestonesAwarded = newMilestones.length > relationship.milestones.length;

                // Save companion message
                await supabase.from('companion_messages').insert({
                  conversation_id: activeConversation!.id,
                  role: 'companion',
                  content: fullResponse,
                  emotion_tags: emotionTags,
                  affinity_change: affinityChange,
                  tokens_used: tokensUsed
                });

                // Update relationship
                await supabase
                  .from('companion_relationships')
                  .update({
                    affinity_level: newAffinity,
                    total_messages: newMessageCount,
                    total_interactions: relationship.total_interactions + 1,
                    memory_context: memoryUpdates,
                    milestones: newMilestones,
                    current_mood: emotionTags[0] || 'neutral',
                    last_interaction: new Date().toISOString()
                  })
                  .eq('id', relationship.id);

                // Update conversation message count
                const { count } = await supabase
                  .from('companion_messages')
                  .select('id', { count: 'exact' })
                  .eq('conversation_id', activeConversation!.id);

                await supabase
                  .from('companion_conversations')
                  .update({ message_count: count || 0, mood_at_end: emotionTags[0] || 'neutral' })
                  .eq('id', activeConversation!.id);

                // Send final metadata event
                const metadata = {
                  type: 'metadata',
                  conversation_id: activeConversation!.id,
                  affinity: {
                    level: newAffinity,
                    change: affinityChange,
                    description: getAffinityDescription(newAffinity)
                  },
                  emotion_tags: emotionTags,
                  milestones: newMilestonesAwarded 
                    ? newMilestones.filter((m: any) => !relationship.milestones.some((rm: any) => rm.id === m.id))
                    : [],
                  tokens_used: tokensUsed
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              } else {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`));
                  }
                  if (parsed.usage) {
                    tokensUsed = parsed.usage.total_tokens || 0;
                  }
                } catch (e) {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        }
      });

      const streamResponse = response.body?.pipeThrough(transformStream);

      return new Response(streamResponse, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
      });
    }

    // Non-streaming response (original behavior)
    console.log('Calling xAI API for companion chat (non-streaming)...');
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-fast',
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      throw new Error(`xAI API error: ${response.status}`);
    }

    const data = await response.json();
    const companionResponse = data.choices?.[0]?.message?.content || 
      "I'm having trouble responding right now. Let's try again?";
    const tokensUsed = data.usage?.total_tokens || 0;

    // Calculate all updates
    const affinityChange = calculateAffinityChange(message, companionResponse);
    const newAffinity = Math.max(0, Math.min(100, relationship.affinity_level + affinityChange));
    const emotionTags = extractEmotionTags(companionResponse, companion.personality_type);
    const memoryUpdates = extractMemoryUpdates(message, relationship.memory_context);
    const newMessageCount = relationship.total_messages + 2;
    const newMilestones = checkMilestones({ ...relationship, affinity_level: newAffinity }, newMessageCount);
    const newMilestonesAwarded = newMilestones.length > relationship.milestones.length;

    // Save companion message
    await supabase.from('companion_messages').insert({
      conversation_id: activeConversation.id,
      role: 'companion',
      content: companionResponse,
      emotion_tags: emotionTags,
      affinity_change: affinityChange,
      tokens_used: tokensUsed
    });

    // Update relationship
    await supabase
      .from('companion_relationships')
      .update({
        affinity_level: newAffinity,
        total_messages: newMessageCount,
        total_interactions: relationship.total_interactions + 1,
        memory_context: memoryUpdates,
        milestones: newMilestones,
        current_mood: emotionTags[0] || 'neutral',
        last_interaction: new Date().toISOString()
      })
      .eq('id', relationship.id);

    // Update conversation
    const { count } = await supabase
      .from('companion_messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', activeConversation.id);

    await supabase
      .from('companion_conversations')
      .update({ message_count: count || 0, mood_at_end: emotionTags[0] || 'neutral' })
      .eq('id', activeConversation.id);

    const responseData: ChatResponse = {
      message: companionResponse,
      companion_name: companion.name,
      conversation_id: activeConversation.id,
      emotion_tags: emotionTags,
      affinity: {
        level: newAffinity,
        change: affinityChange,
        description: getAffinityDescription(newAffinity)
      },
      milestones: newMilestonesAwarded 
        ? newMilestones.filter((m: any) => !relationship.milestones.some((rm: any) => rm.id === m.id)) 
        : [],
      tokens_used: tokensUsed
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Companion chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
