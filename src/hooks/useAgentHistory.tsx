import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { AgentSession, AgentStep, FileOperation } from '@/types/agent';
import type { Json } from '@/integrations/supabase/types';

interface DbAgentSession {
  id: string;
  user_id: string;
  project_id: string;
  original_request: string;
  status: string;
  steps: Json;
  pending_operations: Json;
  applied_operations: Json;
  iteration_count: number;
  max_iterations: number;
  thinking: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

function parseDbSession(db: DbAgentSession): AgentSession {
  return {
    id: db.id,
    status: db.status as AgentSession['status'],
    originalRequest: db.original_request,
    steps: (db.steps as unknown as AgentStep[]) || [],
    pendingOperations: (db.pending_operations as unknown as FileOperation[]) || [],
    appliedOperations: (db.applied_operations as unknown as FileOperation[]) || [],
    iterationCount: db.iteration_count,
    maxIterations: db.max_iterations,
    thinking: db.thinking || undefined,
    currentStepIndex: 0,
    errors: [],
    startTime: new Date(db.started_at),
    endTime: db.completed_at ? new Date(db.completed_at) : undefined,
  };
}

export function useAgentHistory(projectId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['agent-sessions', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data as DbAgentSession[]).map(parseDbSession);
    },
    enabled: !!user && !!projectId,
  });

  const saveSession = useMutation({
    mutationFn: async (session: AgentSession) => {
      if (!user) throw new Error('Not authenticated');

      const dbData = {
        id: session.id,
        user_id: user.id,
        project_id: projectId,
        original_request: session.originalRequest,
        status: session.status,
        steps: session.steps as unknown as Json,
        pending_operations: session.pendingOperations as unknown as Json,
        applied_operations: session.appliedOperations as unknown as Json,
        iteration_count: session.iterationCount,
        max_iterations: session.maxIterations,
        thinking: session.thinking || null,
        started_at: session.startTime.toISOString(),
        completed_at: session.endTime?.toISOString() || null,
      };

      const { data, error } = await supabase
        .from('agent_sessions')
        .upsert(dbData)
        .select()
        .single();

      if (error) throw error;
      return parseDbSession(data as DbAgentSession);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-sessions', projectId] });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('agent_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-sessions', projectId] });
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('agent_sessions')
        .delete()
        .eq('project_id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-sessions', projectId] });
    },
  });

  return {
    sessions,
    isLoading,
    error,
    saveSession: saveSession.mutateAsync,
    deleteSession: deleteSession.mutateAsync,
    clearHistory: clearHistory.mutateAsync,
    isSaving: saveSession.isPending,
  };
}
