import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/database';

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at');

      if (error) throw error;
      setMessages(data as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback(async (id: string, updates: { is_starred?: boolean; is_pinned?: boolean; is_helpful?: boolean }) => {
    const { error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setMessages(prev => 
        prev.map(m => m.id === id ? { ...m, ...updates } : m)
      );
    }
  }, []);

  return {
    messages,
    loading,
    addMessage,
    updateMessage,
    refresh: fetchMessages,
  };
}
