import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/database';
import { useAuth } from './useAuth';
import { format } from 'date-fns';

// AI Model configurations
export const AI_MODELS = {
  'google/gemini-2.5-flash': {
    name: 'Gemini Flash',
    description: 'Fast & balanced',
    speed: 'fast',
  },
  'google/gemini-2.5-pro': {
    name: 'Gemini Pro',
    description: 'Most capable',
    speed: 'slow',
  },
  'google/gemini-2.5-flash-lite': {
    name: 'Gemini Lite',
    description: 'Fastest & cheapest',
    speed: 'fastest',
  },
} as const;

export type AIModel = keyof typeof AI_MODELS;

// Maximum messages to send as context (prevents token overflow)
const MAX_CONTEXT_MESSAGES = 20;

// Helper to track usage analytics
async function trackUsage(userId: string, messagesSent: number = 0, tokensUsed: number = 0) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Try to update existing record first
  const { data: existing } = await supabase
    .from('usage_analytics')
    .select('id, messages_sent, tokens_used')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('usage_analytics')
      .update({
        messages_sent: (existing.messages_sent || 0) + messagesSent,
        tokens_used: (existing.tokens_used || 0) + tokensUsed,
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: userId,
        date: today,
        messages_sent: messagesSent,
        tokens_used: tokensUsed,
      });
  }
}

export function useChat() {
  const { user } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('google/gemini-2.5-flash');
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSendTimeRef = useRef<number>(0);

  const sendMessage = useCallback(async (
    content: string, 
    conversationId: string,
    projectContext?: { url: string | null; name: string | null },
    attachments?: Array<{ name: string; size: number; type: string; url: string; path: string }>
  ) => {
    if (!user) return null;

    // Debounce: prevent sending within 1 second of last send
    const now = Date.now();
    if (now - lastSendTimeRef.current < 1000) {
      setError('Please wait a moment before sending another message');
      return null;
    }
    lastSendTimeRef.current = now;
    
    setIsStreaming(true);
    setStreamingMessage('');
    setError(null);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Prepare metadata with attachments if present
    const metadata = attachments && attachments.length > 0 
      ? { attachments } 
      : null;

    // Save user message first
    const { data: userMessage, error: userError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'user' as const,
        content,
        metadata,
      })
      .select()
      .single();

    if (userError) {
      setError('Failed to save message');
      setIsStreaming(false);
      return null;
    }

    // Get previous messages for context - LIMITED to prevent token overflow
    const { data: previousMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(MAX_CONTEXT_MESSAGES);

    // Reverse to get chronological order and map to chat format
    const messages = (previousMessages || [])
      .reverse()
      .map(m => ({ 
        role: m.role as 'user' | 'assistant' | 'system', 
        content: m.content 
      }));

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages,
          model: selectedModel,
          lovableProjectUrl: projectContext?.url,
          lovableProjectName: projectContext?.name,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 402) {
          throw new Error('Usage limit reached. Please add credits to continue.');
        }
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
              setStreamingMessage(fullContent);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Estimate tokens (rough: ~4 chars per token)
      const estimatedTokens = Math.ceil(fullContent.length / 4);

      // Save assistant message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: 'assistant' as const,
          content: fullContent,
          model: selectedModel,
          tokens_used: estimatedTokens,
        });

      // Track usage analytics (2 messages: user + assistant)
      await trackUsage(user.id, 2, estimatedTokens);

      setIsStreaming(false);
      setStreamingMessage('');
      return fullContent;

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setIsStreaming(false);
        setStreamingMessage('');
        return null;
      }
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsStreaming(false);
      setStreamingMessage('');
      return null;
    }
  }, [user, selectedModel]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStreamingMessage('');
  }, []);

  return {
    sendMessage,
    stopStreaming,
    isStreaming,
    streamingMessage,
    error,
    selectedModel,
    setSelectedModel,
  };
}
