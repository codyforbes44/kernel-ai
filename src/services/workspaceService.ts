import { supabase } from '@/integrations/supabase/client';
import type { Workspace, Project, Conversation } from '@/types/database';

export const workspaceService = {
  // Workspaces
  async getWorkspaces(userId: string) {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    
    if (error) throw error;
    return data as Workspace[];
  },

  // Projects
  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at');
    
    if (error) throw error;
    return data as Project[];
  },

  async createProject(params: { 
    workspaceId: string; 
    userId: string; 
    name: string; 
    description?: string;
  }) {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        workspace_id: params.workspaceId,
        user_id: params.userId,
        name: params.name,
        description: params.description,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async updateProject(id: string, updates: Partial<Project>) {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Conversations
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as Conversation[];
  },

  async createConversation(params: {
    projectId: string;
    userId: string;
    title?: string;
    parentConversationId?: string;
    branchPointMessageId?: string;
    lovableProjectUrl?: string | null;
    lovableProjectName?: string | null;
  }) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        project_id: params.projectId,
        user_id: params.userId,
        title: params.title || 'New Conversation',
        parent_conversation_id: params.parentConversationId,
        branch_point_message_id: params.branchPointMessageId,
        lovable_project_url: params.lovableProjectUrl,
        lovable_project_name: params.lovableProjectName,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Conversation;
  },

  async updateConversation(id: string, updates: Partial<Conversation>) {
    const { error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteConversation(id: string) {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at');

    if (error) throw error;
    return data;
  },

  async copyMessagesToConversation(params: {
    sourceConversationId: string;
    targetConversationId: string;
    userId: string;
    upToMessageId: string;
  }) {
    const messages = await this.getConversationMessages(params.sourceConversationId);
    
    const branchIndex = messages.findIndex(m => m.id === params.upToMessageId);
    if (branchIndex === -1) {
      throw new Error('Branch point message not found');
    }

    const messagesToInsert = messages
      .slice(0, branchIndex + 1)
      .map(m => ({
        conversation_id: params.targetConversationId,
        user_id: params.userId,
        role: m.role,
        content: m.content,
        model: m.model,
        metadata: m.metadata,
      }));

    if (messagesToInsert.length > 0) {
      const { error } = await supabase
        .from('messages')
        .insert(messagesToInsert);

      if (error) throw error;
    }

    return messagesToInsert.length;
  },
};
