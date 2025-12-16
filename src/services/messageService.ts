import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/database';

export const messageService = {
  async getByConversation(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at');
    
    if (error) throw error;
    return data as Message[];
  },

  async create(message: {
    conversation_id: string;
    user_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
    tokens_used?: number;
  }) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data as Message;
  },

  async update(id: string, updates: { 
    is_starred?: boolean; 
    is_pinned?: boolean; 
    is_helpful?: boolean | null;
    content?: string;
  }) {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Message;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async star(id: string, isStarred: boolean) {
    return this.update(id, { is_starred: isStarred });
  },

  async pin(id: string, isPinned: boolean) {
    return this.update(id, { is_pinned: isPinned });
  },

  async setHelpful(id: string, isHelpful: boolean | null) {
    return this.update(id, { is_helpful: isHelpful });
  },

  async search(userId: string, query: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, conversations!inner(*)')
      .eq('user_id', userId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data;
  },
};
