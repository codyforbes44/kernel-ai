import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GitHubConnection, ProjectRepo, GitHubCommit, GitHubRepo } from '@/types/github';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface UseGitHubOptions {
  projectId: string;
}

export function useGitHub({ projectId }: UseGitHubOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  // Check if GitHub is configured
  useEffect(() => {
    async function checkConfig() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/github-auth?action=check-config`
        );
        const data = await response.json();
        setIsConfigured(data.configured);
      } catch {
        setIsConfigured(false);
      }
    }
    checkConfig();
  }, []);

  const ALLOWED_ACTIONS = [
  "list-repos",
  "create-repo",
  "link-repo",
  "unlink-repo",
  "push",
  "pull",
  "get-status",
  "get-commits",
  "list-branches",
  "switch-branch",
  "create-branch",
] as const;

  // Fetch GitHub connection
  const { data: connection, isLoading: isLoadingConnection } = useQuery({
    queryKey: ['github-connection'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('github_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return data as GitHubConnection | null;
    },
  });

  // Fetch linked repository
  const { data: repo, isLoading: isLoadingRepo } = useQuery({
    queryKey: ['project-repo', projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from('project_repos')
        .select('*')
        .eq('project_id', projectId)
        .single();

      return data as ProjectRepo | null;
    },
    enabled: !!projectId,
  });

  // Fetch commit history
  const { data: commits = [] } = useQuery({
    queryKey: ['github-commits', projectId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'commits', projectId }),
      });

      const data = await response.json();
      return (data.commits || []) as GitHubCommit[];
    },
    enabled: !!projectId && !!repo,
  });

  // Connect to GitHub
  const connect = useCallback(async () => {
    if (!isConfigured) {
      toast({
        title: 'GitHub not configured',
        description: 'GitHub OAuth credentials have not been set up yet.',
        variant: 'destructive',
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to connect GitHub.',
        variant: 'destructive',
      });
      return;
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem('github_oauth_state', state);

    // Get OAuth URL from edge function
    const redirectUri = `${window.location.origin}/builder/${projectId}?github_callback=true`;
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/github-auth?action=get-oauth-url&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
    );

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast({
        title: 'Failed to connect',
        description: data.error || 'Could not initiate GitHub OAuth',
        variant: 'destructive',
      });
    }
  }, [isConfigured, projectId, toast]);

  // Handle OAuth callback
  const handleCallback = useCallback(async (code: string, state: string) => {
    const savedState = sessionStorage.getItem('github_oauth_state');
    if (state !== savedState) {
      toast({
        title: 'Invalid state',
        description: 'OAuth state mismatch. Please try again.',
        variant: 'destructive',
      });
      return false;
    }

    sessionStorage.removeItem('github_oauth_state');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/github-auth?action=callback&code=${code}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const data = await response.json();
    if (data.success) {
      queryClient.invalidateQueries({ queryKey: ['github-connection'] });
      toast({
        title: 'GitHub connected',
        description: `Connected as ${data.connection.github_username}`,
      });
      return true;
    } else {
      toast({
        title: 'Connection failed',
        description: data.error || 'Failed to connect GitHub',
        variant: 'destructive',
      });
      return false;
    }
  }, [queryClient, toast]);

  // Disconnect GitHub
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/github-auth?action=disconnect`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-connection'] });
      queryClient.invalidateQueries({ queryKey: ['project-repo'] });
      toast({ title: 'GitHub disconnected' });
    },
    onError: (error) => {
      toast({
        title: 'Disconnect failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // List repositories
  const listReposMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'list-repos' }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.repos as GitHubRepo[];
    },
  });

  // Link repository
  const linkRepoMutation = useMutation({
    mutationFn: async ({ repoOwner, repoName, defaultBranch }: { repoOwner: string; repoName: string; defaultBranch?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'link-repo',
          projectId,
          repoOwner,
          repoName,
          defaultBranch,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.projectRepo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-repo', projectId] });
      toast({ title: 'Repository linked' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to link repository',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Unlink repository
  const unlinkRepoMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'unlink-repo', projectId }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-repo', projectId] });
      queryClient.invalidateQueries({ queryKey: ['github-commits', projectId] });
      toast({ title: 'Repository unlinked' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to unlink repository',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create repository
  const createRepoMutation = useMutation({
    mutationFn: async ({ repoName, isPrivate, description }: { repoName: string; isPrivate?: boolean; description?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'create-repo',
          repoName,
          isPrivate,
          description,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.repo as GitHubRepo;
    },
    onSuccess: (repo) => {
      toast({ title: 'Repository created', description: repo.full_name });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create repository',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Push to GitHub
  const pushMutation = useMutation({
    mutationFn: async (commitMessage: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'push',
          projectId,
          commitMessage,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-repo', projectId] });
      queryClient.invalidateQueries({ queryKey: ['github-commits', projectId] });
      toast({
        title: 'Pushed to GitHub',
        description: `Commit: ${data.commit.sha.slice(0, 7)}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Push failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Pull from GitHub
  const pullMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'pull', projectId }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-repo', projectId] });
      queryClient.invalidateQueries({ queryKey: ['github-commits', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      toast({
        title: 'Pulled from GitHub',
        description: `Updated ${data.filesUpdated} files`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Pull failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // List branches
  const listBranchesMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'list-branches', projectId }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.branches as Array<{ name: string; isDefault: boolean; isProtected: boolean }>;
    },
  });

  // Switch branch
  const switchBranchMutation = useMutation({
    mutationFn: async (branchName: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'switch-branch', projectId, branchName }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-repo', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['github-commits', projectId] });
      toast({ title: 'Branch switched successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to switch branch',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create branch
  const createBranchMutation = useMutation({
    mutationFn: async ({ branchName, fromBranch }: { branchName: string; fromBranch: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'create-branch', projectId, branchName, fromBranch }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_, { branchName }) => {
      queryClient.invalidateQueries({ queryKey: ['project-repo', projectId] });
      toast({ title: 'Branch created', description: `Created branch: ${branchName}` });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create branch',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // State
    isConfigured,
    connection,
    repo,
    commits,
    isLoading: isLoadingConnection || isLoadingRepo,
    
    // Actions
    connect,
    handleCallback,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    
    listRepos: listReposMutation.mutateAsync,
    isListingRepos: listReposMutation.isPending,
    
    linkRepo: linkRepoMutation.mutate,
    isLinkingRepo: linkRepoMutation.isPending,
    
    unlinkRepo: unlinkRepoMutation.mutate,
    isUnlinkingRepo: unlinkRepoMutation.isPending,
    
    createRepo: createRepoMutation.mutateAsync,
    isCreatingRepo: createRepoMutation.isPending,
    
    push: pushMutation.mutate,
    isPushing: pushMutation.isPending,
    
    pull: pullMutation.mutate,
    isPulling: pullMutation.isPending,

    // Branch operations
    listBranches: listBranchesMutation.mutateAsync,
    isListingBranches: listBranchesMutation.isPending,
    
    switchBranch: switchBranchMutation.mutateAsync,
    isSwitchingBranch: switchBranchMutation.isPending,
    
    createBranch: createBranchMutation.mutateAsync,
    isCreatingBranch: createBranchMutation.isPending,
    
    // Computed
    isSyncing: pushMutation.isPending || pullMutation.isPending,
    syncStatus: repo?.sync_status || 'idle',
    lastSyncedAt: repo?.last_synced_at ? new Date(repo.last_synced_at) : null,
  };
}
