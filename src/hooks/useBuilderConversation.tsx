import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { CapturedError } from '@/components/builder/ErrorCapture';

interface FileOperation {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
}

export interface BuilderMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  operations?: FileOperation[];
  isApplied?: boolean;
  isStreaming?: boolean;
  errorContext?: CapturedError[];
  createdAt: Date;
}

interface BuilderConversation {
  id: string;
  projectId: string;
  title: string;
  isActive: boolean;
  createdAt: Date;
}

export function useBuilderConversation(projectId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Fetch or create active conversation for this project
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ['builder-conversation', projectId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Try to find existing active conversation
      const { data: existing, error: fetchError } = await supabase
        .from('builder_conversations')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        return {
          id: existing.id,
          projectId: existing.project_id,
          title: existing.title,
          isActive: existing.is_active,
          createdAt: new Date(existing.created_at),
        } as BuilderConversation;
      }

      // Create new conversation
      const { data: created, error: createError } = await supabase
        .from('builder_conversations')
        .insert({
          project_id: projectId,
          user_id: user.id,
          title: 'New Conversation',
          is_active: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        id: created.id,
        projectId: created.project_id,
        title: created.title,
        isActive: created.is_active,
        createdAt: new Date(created.created_at),
      } as BuilderConversation;
    },
    enabled: !!projectId && !!user?.id,
  });

  // Update current conversation ID when loaded
  useEffect(() => {
    if (conversation?.id) {
      setCurrentConversationId(conversation.id);
    }
  }, [conversation?.id]);

  // Fetch messages for current conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['builder-messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];

      const { data, error } = await supabase
        .from('builder_messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        operations: msg.operations as unknown as FileOperation[] | undefined,
        isApplied: msg.is_applied,
        errorContext: msg.error_context as unknown as CapturedError[] | undefined,
        createdAt: new Date(msg.created_at),
      })) as BuilderMessage[];
    },
    enabled: !!currentConversationId,
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async (message: Omit<BuilderMessage, 'id' | 'createdAt'>) => {
      if (!currentConversationId) throw new Error('No active conversation');

      const { data, error } = await supabase
        .from('builder_messages')
        .insert({
          conversation_id: currentConversationId,
          role: message.role,
          content: message.content,
          operations: message.operations ? JSON.parse(JSON.stringify(message.operations)) : null,
          is_applied: message.isApplied || false,
          error_context: message.errorContext ? JSON.parse(JSON.stringify(message.errorContext)) : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-messages', currentConversationId] });
    },
  });

  // Update message mutation (for marking as applied)
  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BuilderMessage> }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.isApplied !== undefined) updateData.is_applied = updates.isApplied;
      if (updates.operations) updateData.operations = JSON.parse(JSON.stringify(updates.operations));
      
      const { error } = await supabase
        .from('builder_messages')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-messages', currentConversationId] });
    },
  });

  // Start new conversation
  const startNewConversation = useCallback(async () => {
    if (!user?.id) return;

    // Mark current conversation as inactive
    if (currentConversationId) {
      await supabase
        .from('builder_conversations')
        .update({ is_active: false })
        .eq('id', currentConversationId);
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('builder_conversations')
      .insert({
        project_id: projectId,
        user_id: user.id,
        title: 'New Conversation',
        is_active: true,
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['builder-conversation', projectId, user.id] });
      queryClient.invalidateQueries({ queryKey: ['builder-messages', data.id] });
    }
  }, [currentConversationId, projectId, user?.id, queryClient]);

  // Update conversation title based on first message
  const updateTitle = useCallback(async (title: string) => {
    if (!currentConversationId) return;

    await supabase
      .from('builder_conversations')
      .update({ title: title.slice(0, 100) })
      .eq('id', currentConversationId);

    queryClient.invalidateQueries({ queryKey: ['builder-conversation', projectId, user?.id] });
  }, [currentConversationId, projectId, user?.id, queryClient]);

  return {
    conversation,
    conversationId: currentConversationId,
    messages,
    isLoading: isLoadingConversation || isLoadingMessages,
    addMessage: addMessageMutation.mutateAsync,
    updateMessage: updateMessageMutation.mutateAsync,
    startNewConversation,
    updateTitle,
  };
}
