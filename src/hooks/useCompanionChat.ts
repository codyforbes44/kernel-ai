import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionService } from '@/services/companionService';
import { toast } from 'sonner';
import { companionKeys } from '@/constants/companion';
import type { ChatResponse, Milestone } from '@/types/companion';
import { supabase } from '@/integrations/supabase/client';

interface UseCompanionChatOptions {
  companionId: string;
  conversationId?: string;
  onNewMilestone?: (milestone: Milestone) => void;
  onAffinityChange?: (level: number, change: number) => void;
  enableStreaming?: boolean;
}

interface StreamMetadata {
  conversation_id: string;
  affinity: {
    level: number;
    change: number;
    description: string;
  };
  emotion_tags: string[];
  milestones: Milestone[];
  tokens_used: number;
}

export function useCompanionChat({
  companionId,
  conversationId: initialConversationId,
  onNewMilestone,
  onAffinityChange,
  enableStreaming = true,
}: UseCompanionChatOptions) {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Streaming chat function
  const sendStreamingMessage = useCallback(async (message: string) => {
    setPendingMessage(message);
    setStreamingContent('');
    setIsStreaming(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      abortControllerRef.current = new AbortController();

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
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send message: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';
      let metadata: StreamMetadata | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content' && parsed.content) {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              } else if (parsed.type === 'metadata') {
                metadata = parsed as StreamMetadata;
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Process final metadata
      if (metadata) {
        if (metadata.conversation_id !== conversationId) {
          setConversationId(metadata.conversation_id);
        }

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: companionKeys.messages(metadata.conversation_id) });
        queryClient.invalidateQueries({ queryKey: companionKeys.relationship(companionId) });
        queryClient.invalidateQueries({ queryKey: companionKeys.all });

        if (onAffinityChange && metadata.affinity.change !== 0) {
          onAffinityChange(metadata.affinity.level, metadata.affinity.change);
        }

        if (metadata.milestones.length > 0 && onNewMilestone) {
          metadata.milestones.forEach((milestone) => {
            onNewMilestone(milestone);
            toast.success(`🎉 New milestone: ${milestone.title}`, {
              description: milestone.description,
              duration: 5000,
            });
          });
        }
      }

      setPendingMessage(null);
      setIsStreaming(false);
      setStreamingContent('');

      return { content: fullContent, metadata };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Streaming cancelled');
      } else {
        toast.error('Failed to send message', { description: (error as Error).message });
      }
      setPendingMessage(null);
      setIsStreaming(false);
      setStreamingContent('');
      throw error;
    }
  }, [companionId, conversationId, queryClient, onAffinityChange, onNewMilestone]);

  // Non-streaming mutation (fallback)
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      setPendingMessage(message);
      return companionService.sendMessage(companionId, message, conversationId);
    },
    onSuccess: (response: ChatResponse) => {
      setPendingMessage(null);
      
      if (response.conversation_id !== conversationId) {
        setConversationId(response.conversation_id);
      }

      queryClient.invalidateQueries({ queryKey: companionKeys.messages(response.conversation_id) });
      queryClient.invalidateQueries({ queryKey: companionKeys.relationship(companionId) });
      queryClient.invalidateQueries({ queryKey: companionKeys.all });

      if (onAffinityChange && response.affinity.change !== 0) {
        onAffinityChange(response.affinity.level, response.affinity.change);
      }

      if (response.milestones.length > 0 && onNewMilestone) {
        response.milestones.forEach((milestone) => {
          onNewMilestone(milestone);
          toast.success(`🎉 New milestone: ${milestone.title}`, {
            description: milestone.description,
            duration: 5000,
          });
        });
      }
    },
    onError: (error: Error) => {
      setPendingMessage(null);
      toast.error('Failed to send message', { description: error.message });
    },
  });

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      
      if (enableStreaming) {
        return sendStreamingMessage(message);
      } else {
        return sendMessageMutation.mutateAsync(message);
      }
    },
    [enableStreaming, sendStreamingMessage, sendMessageMutation]
  );

  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setConversationId(undefined);
    setStreamingContent('');
  }, []);

  const switchConversation = useCallback((newConversationId: string) => {
    setConversationId(newConversationId);
    setStreamingContent('');
  }, []);

  return {
    sendMessage,
    cancelStreaming,
    isLoading: sendMessageMutation.isPending || isStreaming,
    isStreaming,
    pendingMessage,
    streamingContent,
    conversationId,
    lastResponse: sendMessageMutation.data,
    startNewConversation,
    switchConversation,
    error: sendMessageMutation.error,
  };
}
