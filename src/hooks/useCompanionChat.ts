import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionService } from '@/services/companionService';
import { toast } from 'sonner';
import { companionKeys } from '@/constants/companion';
import type { ChatResponse, Milestone } from '@/types/companion';

interface UseCompanionChatOptions {
  companionId: string;
  conversationId?: string;
  onNewMilestone?: (milestone: Milestone) => void;
  onAffinityChange?: (level: number, change: number) => void;
}

export function useCompanionChat({
  companionId,
  conversationId: initialConversationId,
  onNewMilestone,
  onAffinityChange,
}: UseCompanionChatOptions) {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

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

      // Invalidate queries using centralized keys
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
    (message: string) => {
      if (!message.trim()) return;
      sendMessageMutation.mutate(message);
    },
    [sendMessageMutation]
  );

  const startNewConversation = useCallback(() => {
    setConversationId(undefined);
  }, []);

  const switchConversation = useCallback((newConversationId: string) => {
    setConversationId(newConversationId);
  }, []);

  return {
    sendMessage,
    isLoading: sendMessageMutation.isPending,
    pendingMessage,
    conversationId,
    lastResponse: sendMessageMutation.data,
    startNewConversation,
    switchConversation,
    error: sendMessageMutation.error,
  };
}
