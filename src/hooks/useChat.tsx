import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/database';

interface UseChatOptions {
  conversationId: string;
  userId: string;
  onMessageSaved?: (message: Message) => void;
}

export function useChat({ conversationId, userId, onMessageSaved }: UseChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, previousMessages: Message[]) => {
    setIsStreaming(true);
    setStreamingContent('');
    setError(null);

    // Save user message first
    const { data: userMessage, error: userError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role: 'user' as const,
        content,
      })
      .select()
      .single();

    if (userError) {
      setError('Failed to save message');
      setIsStreaming(false);
      return null;
    }

    onMessageSaved?.(userMessage as Message);

    // Prepare messages for AI
    const messages = [
      ...previousMessages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content }
    ];

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              fullContent += deltaContent;
              setStreamingContent(fullContent);
            }
          } catch {
            // Incomplete JSON, put back
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant message
      const { data: assistantMessage, error: assistantError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          role: 'assistant' as const,
          content: fullContent,
          model: 'google/gemini-2.5-flash',
        })
        .select()
        .single();

      if (assistantError) {
        console.error('Error saving assistant message:', assistantError);
      } else {
        onMessageSaved?.(assistantMessage as Message);
      }

      setIsStreaming(false);
      setStreamingContent('');
      return fullContent;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsStreaming(false);
      setStreamingContent('');
      return null;
    }
  }, [conversationId, userId, onMessageSaved]);

  const cancelStream = useCallback(() => {
    setIsStreaming(false);
    setStreamingContent('');
  }, []);

  return {
    sendMessage,
    cancelStream,
    isStreaming,
    streamingContent,
    error,
  };
}
