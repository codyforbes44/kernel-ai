import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Deployment {
  id: string;
  projectId: string;
  userId: string;
  version: number;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  environment: 'preview' | 'production';
  buildLog: string | null;
  buildDurationMs: number | null;
  bundleSizeBytes: number | null;
  deployUrl: string | null;
  subdomain: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  commitMessage: string | null;
  fileCount: number;
}

export interface CustomDomain {
  id: string;
  projectId: string;
  domain: string;
  isVerified: boolean;
  status: 'pending' | 'verifying' | 'active' | 'offline' | 'failed';
  sslStatus: 'pending' | 'provisioning' | 'active' | 'failed';
  verificationToken: string;
  isPrimary: boolean;
  createdAt: string;
}

function mapDeployment(data: Record<string, unknown>): Deployment {
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    userId: data.user_id as string,
    version: data.version as number,
    status: data.status as Deployment['status'],
    environment: data.environment as Deployment['environment'],
    buildLog: data.build_log as string | null,
    buildDurationMs: data.build_duration_ms as number | null,
    bundleSizeBytes: data.bundle_size_bytes as number | null,
    deployUrl: data.deploy_url as string | null,
    subdomain: data.subdomain as string | null,
    startedAt: data.started_at as string | null,
    completedAt: data.completed_at as string | null,
    createdAt: data.created_at as string,
    commitMessage: data.commit_message as string | null,
    fileCount: data.file_count as number,
  };
}

function mapCustomDomain(data: Record<string, unknown>): CustomDomain {
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    domain: data.domain as string,
    isVerified: data.is_verified as boolean,
    status: data.status as CustomDomain['status'],
    sslStatus: data.ssl_status as CustomDomain['sslStatus'],
    verificationToken: data.verification_token as string,
    isPrimary: data.is_primary as boolean,
    createdAt: data.created_at as string,
  };
}

export function useDeployments(projectId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch deployments for project
  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['deployments', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(d => mapDeployment(d as unknown as Record<string, unknown>));
    },
    enabled: !!projectId && !!user,
  });

  // Get latest deployment per environment
  const latestPreview = deployments.find(d => d.environment === 'preview' && d.status === 'deployed');
  const latestProduction = deployments.find(d => d.environment === 'production' && d.status === 'deployed');

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async ({ 
      environment, 
      commitMessage,
      rollbackFromVersion 
    }: { 
      environment: 'preview' | 'production'; 
      commitMessage?: string;
      rollbackFromVersion?: number;
    }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deploy-project`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            projectId,
            environment,
            commitMessage: rollbackFromVersion 
              ? `Rollback to v${rollbackFromVersion}` 
              : commitMessage,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deployment failed');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', projectId] });
      const message = variables.rollbackFromVersion 
        ? `Rolled back to v${variables.rollbackFromVersion}!`
        : `Deployed to ${data.deployment.environment}!`;
      toast.success(message, {
        description: `Version ${data.deployment.version} is now live`,
        action: data.deployment.deploy_url ? {
          label: 'Open',
          onClick: () => window.open(data.deployment.deploy_url, '_blank'),
        } : undefined,
      });
    },
    onError: (error) => {
      toast.error('Deployment failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Rollback to a specific deployment
  const rollback = async (deploymentId: string) => {
    const targetDeployment = deployments.find(d => d.id === deploymentId);
    if (!targetDeployment) {
      toast.error('Deployment not found');
      return;
    }

    return deployMutation.mutateAsync({
      environment: targetDeployment.environment,
      rollbackFromVersion: targetDeployment.version,
    });
  };

  // Fetch custom domains
  const { data: customDomains = [] } = useQuery({
    queryKey: ['custom-domains', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(d => mapCustomDomain(d as unknown as Record<string, unknown>));
    },
    enabled: !!projectId && !!user,
  });

  // Add custom domain mutation
  const addDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      const { data, error } = await supabase
        .from('custom_domains')
        .insert({
          project_id: projectId,
          user_id: user?.id,
          domain: domain.toLowerCase().trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return mapCustomDomain(data as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-domains', projectId] });
      toast.success('Domain added! Follow the DNS setup instructions.');
    },
    onError: (error) => {
      toast.error('Failed to add domain', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Delete domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-domains', projectId] });
      toast.success('Domain removed');
    },
  });

  return {
    deployments,
    latestPreview,
    latestProduction,
    customDomains,
    isLoading,
    deploy: deployMutation.mutateAsync,
    isDeploying: deployMutation.isPending,
    rollback,
    isRollingBack: deployMutation.isPending,
    addDomain: addDomainMutation.mutateAsync,
    deleteDomain: deleteDomainMutation.mutateAsync,
  };
}
