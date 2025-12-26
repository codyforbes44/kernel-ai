import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companionService } from '@/services/companionService';
import { toast } from 'sonner';
import type { CompanionProfile, CompanionRelationship } from '@/types/companion';

export function useCompanions() {
  return useQuery({
    queryKey: ['companions'],
    queryFn: () => companionService.getCompanions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompanion(companionId: string | null) {
  return useQuery({
    queryKey: ['companion', companionId],
    queryFn: () => companionId ? companionService.getCompanion(companionId) : null,
    enabled: !!companionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanionRelationship(companionId: string | null) {
  return useQuery({
    queryKey: ['companion-relationship', companionId],
    queryFn: () => companionId ? companionService.getRelationship(companionId) : null,
    enabled: !!companionId,
  });
}

export function useAllRelationships() {
  return useQuery({
    queryKey: ['companion-relationships'],
    queryFn: () => companionService.getAllRelationships(),
  });
}

export function useCompanionConversations(relationshipId: string | null) {
  return useQuery({
    queryKey: ['companion-conversations', relationshipId],
    queryFn: () => relationshipId ? companionService.getConversations(relationshipId) : [],
    enabled: !!relationshipId,
  });
}

export function useCompanionMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['companion-messages', conversationId],
    queryFn: () => conversationId ? companionService.getMessages(conversationId) : [],
    enabled: !!conversationId,
  });
}

export function useUpdateNickname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ relationshipId, nickname }: { relationshipId: string; nickname: string }) =>
      companionService.updateNickname(relationshipId, nickname),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companion-relationship'] });
      queryClient.invalidateQueries({ queryKey: ['companion-relationships'] });
      toast.success('Nickname updated!');
    },
    onError: (error) => {
      toast.error('Failed to update nickname');
      console.error('Update nickname error:', error);
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => companionService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion-conversations'] });
      toast.success('Conversation deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete conversation');
      console.error('Delete conversation error:', error);
    },
  });
}

// Combined hook for full companion data
export function useCompanionWithRelationship(companionId: string | null) {
  const { data: companion, isLoading: isLoadingCompanion } = useCompanion(companionId);
  const { data: relationship, isLoading: isLoadingRelationship } = useCompanionRelationship(companionId);
  const { data: conversations, isLoading: isLoadingConversations } = useCompanionConversations(relationship?.id ?? null);

  return {
    companion,
    relationship,
    conversations,
    isLoading: isLoadingCompanion || isLoadingRelationship || isLoadingConversations,
  };
}
