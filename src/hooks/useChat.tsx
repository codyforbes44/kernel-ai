import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserPreferences } from './useUserPreferences';
import { useRateLimiter } from './useDebounce';
import { format } from 'date-fns';
import { AI_MODELS, MAX_CONTEXT_MESSAGES } from '@/lib/constants';
import type { AIModel } from '@/lib/constants';

// Re-export for backwards compatibility
export { AI_MODELS } from '@/lib/constants';
export type { AIModel } from '@/lib/constants';

// Helper to track usage analytics
async function trackUsage(userId: string, messagesSent: number = 0, tokensUsed: number = 0) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
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
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('google/gemini-2.5-flash');
  const abortControllerRef = useRef<AbortController | null>(null);
  const rateLimiter = useRateLimiter(1, 1000); // 1 message per 1000ms

  // Sync with user preferences when they load
  useEffect(() => {
    if (!preferencesLoading && preferences.defaultAIModel) {
      setSelectedModel(preferences.defaultAIModel);
    }
  }, [preferences.defaultAIModel, preferencesLoading]);

  const sendMessage = useCallback(async (
    content: string, 
    conversationId: string,
    projectContext?: { url: string | null; name: string | null },
    attachments?: Array<{ name: string; size: number; type: string; url: string; path: string }>
  ) => {
    if (!user) return null;

    // Rate limit: prevent sending more than 1 message per second
    if (!rateLimiter.canProceed()) {
      setError('Please wait a moment before sending another message');
      return null;
    }
    rateLimiter.record();
    
    setIsStreaming(true);
    setStreamingMessage('');
    setError(null);

    abortControllerRef.current = new AbortController();

    const metadata = attachments && attachments.length > 0 
      ? { attachments } 
      : null;

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

    const { data: previousMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(MAX_CONTEXT_MESSAGES);

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

      const estimatedTokens = Math.ceil(fullContent.length / 4);

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
