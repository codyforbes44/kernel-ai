import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { 
  CompanionProfile, 
  CompanionRelationship, 
  CompanionConversation, 
  CompanionMessage,
  ChatResponse,
  MemoryContext,
  Milestone
} from '@/types/companion';

export const companionService = {
  // Get all active companions
  async getCompanions(): Promise<CompanionProfile[]> {
    const { data, error } = await supabase
      .from('companion_profiles')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      logger.error('[CompanionService] Error fetching companions:', error);
      throw error;
    }

    return (data || []).map(this.mapCompanionProfile);
  },

  // Get a specific companion
  async getCompanion(companionId: string): Promise<CompanionProfile | null> {
    const { data, error } = await supabase
      .from('companion_profiles')
      .select('*')
      .eq('id', companionId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('[CompanionService] Error fetching companion:', error);
      throw error;
    }

    return data ? this.mapCompanionProfile(data) : null;
  },

  // Get user's relationship with a companion
  async getRelationship(companionId: string): Promise<CompanionRelationship | null> {
    const { data, error } = await supabase
      .from('companion_relationships')
      .select('*')
      .eq('companion_id', companionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('[CompanionService] Error fetching relationship:', error);
      throw error;
    }

    return data ? this.mapRelationship(data) : null;
  },

  // Get all user relationships
  async getAllRelationships(): Promise<CompanionRelationship[]> {
    const { data, error } = await supabase
      .from('companion_relationships')
      .select('*')
      .order('last_interaction', { ascending: false, nullsFirst: false });

    if (error) {
      logger.error('[CompanionService] Error fetching relationships:', error);
      throw error;
    }

    return (data || []).map(this.mapRelationship);
  },

  // Get conversations with a companion
  async getConversations(relationshipId: string): Promise<CompanionConversation[]> {
    const { data, error } = await supabase
      .from('companion_conversations')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('updated_at', { ascending: false });

    if (error) {
      logger.error('[CompanionService] Error fetching conversations:', error);
      throw error;
    }

    return (data || []).map(this.mapConversation);
  },

  // Get messages in a conversation
  async getMessages(conversationId: string, limit = 50): Promise<CompanionMessage[]> {
    const { data, error } = await supabase
      .from('companion_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      logger.error('[CompanionService] Error fetching messages:', error);
      throw error;
    }

    return (data || []).map(this.mapMessage);
  },

  // Send a message to a companion
  async sendMessage(companionId: string, message: string, conversationId?: string): Promise<ChatResponse> {
    logger.info('[CompanionService] Sending message to companion:', { companionId, messageLength: message.length });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/companion-chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          companion_id: companionId,
          message,
          conversation_id: conversationId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to send message: ${response.status}`);
    }

    return response.json();
  },

  // Update user's nickname for a companion
  async updateNickname(relationshipId: string, nickname: string): Promise<void> {
    const { error } = await supabase
      .from('companion_relationships')
      .update({ nickname })
      .eq('id', relationshipId);

    if (error) {
      logger.error('[CompanionService] Error updating nickname:', error);
      throw error;
    }
  },

  // Update memory context
  async updateMemory(relationshipId: string, memoryContext: MemoryContext): Promise<void> {
    const { error } = await supabase
      .from('companion_relationships')
      .update({ memory_context: JSON.parse(JSON.stringify(memoryContext)) })
      .eq('id', relationshipId);

    if (error) {
      logger.error('[CompanionService] Error updating memory:', error);
      throw error;
    }
  },

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('companion_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      logger.error('[CompanionService] Error deleting conversation:', error);
      throw error;
    }
  },

  // Helper mappers
  mapCompanionProfile(data: any): CompanionProfile {
    return {
      id: data.id,
      name: data.name,
      avatar_url: data.avatar_url,
      personality_type: data.personality_type,
      personality_traits: data.personality_traits || {},
      system_prompt: data.system_prompt,
      voice_settings: data.voice_settings || {},
      backstory: data.backstory,
      default_greeting: data.default_greeting,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  mapRelationship(data: any): CompanionRelationship {
    return {
      id: data.id,
      user_id: data.user_id,
      companion_id: data.companion_id,
      affinity_level: data.affinity_level,
      total_interactions: data.total_interactions,
      total_messages: data.total_messages,
      memory_context: data.memory_context || {},
      milestones: data.milestones || [],
      current_mood: data.current_mood || 'neutral',
      nickname: data.nickname,
      last_interaction: data.last_interaction,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  mapConversation(data: any): CompanionConversation {
    return {
      id: data.id,
      relationship_id: data.relationship_id,
      title: data.title,
      context_summary: data.context_summary || {},
      message_count: data.message_count,
      mood_at_start: data.mood_at_start,
      mood_at_end: data.mood_at_end,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  mapMessage(data: any): CompanionMessage {
    return {
      id: data.id,
      conversation_id: data.conversation_id,
      role: data.role,
      content: data.content,
      emotion_tags: data.emotion_tags || [],
      affinity_change: data.affinity_change || 0,
      tokens_used: data.tokens_used || 0,
      created_at: data.created_at,
    };
  },
};
