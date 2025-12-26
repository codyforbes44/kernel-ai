import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companionService } from '@/services/companionService';
import { toast } from 'sonner';
import { companionKeys } from '@/constants/companion';

export function useCompanions() {
  return useQuery({
    queryKey: companionKeys.lists(),
    queryFn: () => companionService.getCompanions(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanion(companionId: string | null) {
  return useQuery({
    queryKey: companionKeys.detail(companionId || ''),
    queryFn: () => companionId ? companionService.getCompanion(companionId) : null,
    enabled: !!companionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanionRelationship(companionId: string | null) {
  return useQuery({
    queryKey: companionKeys.relationship(companionId || ''),
    queryFn: () => companionId ? companionService.getRelationship(companionId) : null,
    enabled: !!companionId,
  });
}

export function useAllRelationships() {
  return useQuery({
    queryKey: companionKeys.relationships(),
    queryFn: () => companionService.getAllRelationships(),
  });
}

export function useCompanionConversations(relationshipId: string | null) {
  return useQuery({
    queryKey: companionKeys.conversations(relationshipId || ''),
    queryFn: () => relationshipId ? companionService.getConversations(relationshipId) : [],
    enabled: !!relationshipId,
  });
}

export function useCompanionMessages(conversationId: string | null) {
  return useQuery({
    queryKey: companionKeys.messages(conversationId || ''),
    queryFn: () => conversationId ? companionService.getMessages(conversationId) : [],
    enabled: !!conversationId,
  });
}

export function useUpdateNickname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ relationshipId, nickname }: { relationshipId: string; nickname: string }) =>
      companionService.updateNickname(relationshipId, nickname),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companionKeys.relationships() });
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
      queryClient.invalidateQueries({ queryKey: companionKeys.all });
      toast.success('Conversation deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete conversation');
      console.error('Delete conversation error:', error);
    },
  });
}

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
