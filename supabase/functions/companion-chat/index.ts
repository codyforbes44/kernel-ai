import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompanionChatRequest {
  companion_id: string;
  message: string;
  conversation_id?: string;
}

interface CompanionProfile {
  id: string;
  name: string;
  personality_type: string;
  personality_traits: Record<string, number>;
  system_prompt: string;
  default_greeting: string;
}

interface Relationship {
  id: string;
  affinity_level: number;
  memory_context: Record<string, any>;
  milestones: any[];
  nickname: string | null;
  current_mood: string;
  total_messages: number;
  total_interactions: number;
}

interface Message {
  role: 'user' | 'companion';
  content: string;
}

// Calculate affinity change based on message sentiment and context
function calculateAffinityChange(userMessage: string, companionResponse: string): number {
  const positivePatterns = /thank|love|great|awesome|amazing|helpful|appreciate|perfect|wonderful|excellent/i;
  const negativePatterns = /hate|terrible|awful|useless|stupid|wrong|bad|worst|annoying|frustrated/i;
  const questionPatterns = /\?|how|what|why|when|where|who/i;
  
  let change = 1; // Base change for interaction
  
  if (positivePatterns.test(userMessage)) change += 1;
  if (negativePatterns.test(userMessage)) change -= 2;
  if (questionPatterns.test(userMessage)) change += 0; // Neutral for questions
  if (userMessage.length > 100) change += 1; // Longer messages show engagement
  
  return Math.max(-2, Math.min(3, change));
}

// Extract emotion tags from companion response
function extractEmotionTags(response: string, personalityType: string): string[] {
  const emotions: string[] = [];
  
  // Common emotion patterns
  if (/😊|happy|glad|joy|wonderful|excited/i.test(response)) emotions.push('happy');
  if (/🤔|hmm|interesting|curious|wonder/i.test(response)) emotions.push('curious');
  if (/sorry|sad|unfortunate|difficult/i.test(response)) emotions.push('empathetic');
  if (/!{2,}|amazing|incredible|wow/i.test(response)) emotions.push('excited');
  if (/\?.*\?|really\?|tell me more/i.test(response)) emotions.push('inquisitive');
  if (/😄|haha|lol|funny|joke/i.test(response)) emotions.push('playful');
  
  // Personality-specific defaults
  if (emotions.length === 0) {
    switch (personalityType) {
      case 'mentor': emotions.push('thoughtful'); break;
      case 'creative': emotions.push('playful'); break;
      case 'analytical': emotions.push('focused'); break;
      case 'supportive': emotions.push('warm'); break;
      default: emotions.push('neutral');
    }
  }
  
  return emotions;
}

// Extract memorable facts from conversation for memory context
function extractMemoryUpdates(userMessage: string, existingMemory: Record<string, any>): Record<string, any> {
  const updates: Record<string, any> = { ...existingMemory };
  
  // Name patterns
  const nameMatch = userMessage.match(/(?:my name is|i'm called|call me) (\w+)/i);
  if (nameMatch) updates.user_name = nameMatch[1];
  
  // Goal patterns
  const goalMatch = userMessage.match(/(?:i want to|my goal is|i'm trying to|i need to) (.+?)(?:\.|$)/i);
  if (goalMatch) {
    updates.goals = updates.goals || [];
    if (!updates.goals.includes(goalMatch[1])) {
      updates.goals = [...updates.goals.slice(-4), goalMatch[1]];
    }
  }
  
  // Interest patterns
  const interestMatch = userMessage.match(/(?:i love|i like|i enjoy|interested in) (.+?)(?:\.|$)/i);
  if (interestMatch) {
    updates.interests = updates.interests || [];
    if (!updates.interests.includes(interestMatch[1])) {
      updates.interests = [...updates.interests.slice(-4), interestMatch[1]];
    }
  }
  
  // Update last topics discussed
  updates.last_topics = updates.last_topics || [];
  const words = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 5);
  if (words.length > 0) {
    updates.last_topics = [...new Set([...words.slice(0, 3), ...updates.last_topics])].slice(0, 10);
  }
  
  return updates;
}

// Get affinity level description for system prompt
function getAffinityDescription(level: number): string {
  if (level >= 91) return "Soulmate level - extremely close, share inside jokes, deep personal connection";
  if (level >= 76) return "Best Friend - very comfortable, proactive about user's wellbeing, remembers everything";
  if (level >= 56) return "Close Friend - uses nickname, shares personal opinions, warm and familiar";
  if (level >= 36) return "Friend - more open and casual, occasional humor, building trust";
  if (level >= 16) return "Acquaintance - friendly but still getting to know each other";
  return "New connection - polite and welcoming, learning about the user";
}

// Check and award milestones
function checkMilestones(relationship: Relationship, newMessageCount: number): any[] {
  const milestones = [...relationship.milestones];
  const existingIds = new Set(milestones.map(m => m.id));
  
  const potentialMilestones = [
    { id: 'first_message', trigger: 1, title: 'First Words', description: 'Started your journey together' },
    { id: 'messages_10', trigger: 10, title: 'Getting Acquainted', description: 'Exchanged 10 messages' },
    { id: 'messages_50', trigger: 50, title: 'Building Connection', description: 'Reached 50 messages' },
    { id: 'messages_100', trigger: 100, title: 'Strong Bond', description: 'Shared 100 messages together' },
    { id: 'messages_500', trigger: 500, title: 'True Companion', description: 'An incredible 500 message milestone' },
  ];
  
  for (const milestone of potentialMilestones) {
    if (!existingIds.has(milestone.id) && newMessageCount >= milestone.trigger) {
      milestones.push({
        ...milestone,
        achieved_at: new Date().toISOString()
      });
    }
  }
  
  // Affinity milestones
  const affinityMilestones = [
    { id: 'affinity_25', trigger: 25, title: 'Friendly Connection', description: 'Reached 25 affinity' },
    { id: 'affinity_50', trigger: 50, title: 'True Friend', description: 'Reached 50 affinity' },
    { id: 'affinity_75', trigger: 75, title: 'Close Bond', description: 'Reached 75 affinity' },
    { id: 'affinity_100', trigger: 100, title: 'Soulmate', description: 'Maximum affinity achieved!' },
  ];
  
  for (const milestone of affinityMilestones) {
    if (!existingIds.has(milestone.id) && relationship.affinity_level >= milestone.trigger) {
      milestones.push({
        ...milestone,
        achieved_at: new Date().toISOString()
      });
    }
  }
  
  return milestones;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY is not configured');
    }

    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { companion_id, message, conversation_id } = await req.json() as CompanionChatRequest;

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
    let { data: relationship, error: relError } = await supabase
      .from('companion_relationships')
      .select('*')
      .eq('user_id', userId)
      .eq('companion_id', companion_id)
      .single();

    if (relError || !relationship) {
      // Create new relationship
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

      if (createError) {
        console.error('Error creating relationship:', createError);
        throw new Error('Failed to create relationship');
      }
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

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw new Error('Failed to create conversation');
      }
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

    // Build system prompt with context
    const affinityDescription = getAffinityDescription(relationship.affinity_level);
    const memoryString = Object.entries(relationship.memory_context || {})
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('; ') || 'No specific memories yet';

    let systemPrompt = companion.system_prompt
      .replace('{{affinity_level}}', `${relationship.affinity_level}/100 (${affinityDescription})`)
      .replace('{{nickname}}', relationship.nickname || 'friend')
      .replace('{{memory_context}}', memoryString);

    // Add personality-specific instructions
    systemPrompt += `\n\nPersonality traits: ${JSON.stringify(companion.personality_traits)}`;
    systemPrompt += `\nTotal conversations: ${relationship.total_interactions}`;
    systemPrompt += `\nCurrent mood: ${relationship.current_mood}`;

    // Build messages array for xAI
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory.map(m => ({
        role: m.role === 'companion' ? 'assistant' : 'user',
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // Call xAI API
    console.log('Calling xAI API for companion chat...');
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

    // Calculate updates
    const affinityChange = calculateAffinityChange(message, companionResponse);
    const newAffinity = Math.max(0, Math.min(100, relationship.affinity_level + affinityChange));
    const emotionTags = extractEmotionTags(companionResponse, companion.personality_type);
    const memoryUpdates = extractMemoryUpdates(message, relationship.memory_context);
    const newMessageCount = relationship.total_messages + 2; // user + companion
    const newMilestones = checkMilestones({ ...relationship, affinity_level: newAffinity }, newMessageCount);
    const newMilestonesAwarded = newMilestones.length > relationship.milestones.length;

    // Save user message
    await supabase
      .from('companion_messages')
      .insert({
        conversation_id: activeConversation.id,
        role: 'user',
        content: message,
        emotion_tags: [],
        affinity_change: 0
      });

    // Save companion message
    await supabase
      .from('companion_messages')
      .insert({
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

    // Update conversation message count
    await supabase
      .from('companion_conversations')
      .update({
        message_count: (await supabase
          .from('companion_messages')
          .select('id', { count: 'exact' })
          .eq('conversation_id', activeConversation.id)
        ).count || 0,
        mood_at_end: emotionTags[0] || 'neutral'
      })
      .eq('id', activeConversation.id);

    return new Response(JSON.stringify({
      message: companionResponse,
      companion_name: companion.name,
      conversation_id: activeConversation.id,
      emotion_tags: emotionTags,
      affinity: {
        level: newAffinity,
        change: affinityChange,
        description: getAffinityDescription(newAffinity)
      },
      milestones: newMilestonesAwarded ? 
        newMilestones.filter(m => !relationship.milestones.some((rm: any) => rm.id === m.id)) : 
        [],
      tokens_used: tokensUsed
    }), {
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
