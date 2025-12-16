import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/types/database';

export const conversationService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as Conversation[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Conversation;
  },

  async create(projectId: string, userId: string, title = 'New Conversation') {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ project_id: projectId, user_id: userId, title })
      .select()
      .single();
    
    if (error) throw error;
    return data as Conversation;
  },

  async update(id: string, updates: Partial<Conversation>) {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Conversation;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async archive(id: string) {
    return this.update(id, { is_archived: true });
  },

  async pin(id: string, isPinned: boolean) {
    return this.update(id, { is_pinned: isPinned });
  },

  async rename(id: string, title: string) {
    return this.update(id, { title });
  },

  async duplicate(conversation: Conversation, userId: string) {
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        project_id: conversation.project_id,
        user_id: userId,
        title: `${conversation.title} (Copy)`,
        summary: conversation.summary,
        tags: conversation.tags,
        lovable_project_url: conversation.lovable_project_url,
        lovable_project_name: conversation.lovable_project_name,
      })
      .select()
      .single();

    if (convError) throw convError;

    // Copy messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at');

    if (messages && messages.length > 0) {
      const newMessages = messages.map(m => ({
        conversation_id: newConversation.id,
        user_id: userId,
        role: m.role,
        content: m.content,
        model: m.model,
        tokens_used: m.tokens_used,
        metadata: m.metadata,
      }));

      await supabase.from('messages').insert(newMessages);
    }

    return newConversation as Conversation;
  },

  async export(conversationId: string, format: 'markdown' | 'json') {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at');

    if (!conversation || !messages) throw new Error('Conversation not found');

    if (format === 'json') {
      return JSON.stringify({ conversation, messages }, null, 2);
    }

    // Markdown format
    let markdown = `# ${conversation.title}\n\n`;
    markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
    
    if (conversation.lovable_project_name) {
      markdown += `**Linked Project:** ${conversation.lovable_project_name}\n\n`;
    }
    
    markdown += `---\n\n`;

    for (const message of messages) {
      const role = message.role === 'user' ? '**You**' : '**Lovable AI**';
      markdown += `${role}:\n\n${message.content}\n\n---\n\n`;
    }

    return markdown;
  },
};
