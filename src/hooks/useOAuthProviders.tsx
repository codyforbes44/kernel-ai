import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type OAuthProvider = 'google' | 'github' | 'apple' | 'linkedin_oidc' | 'azure';

interface OAuthConfig {
  configuredProviders: OAuthProvider[];
  isLoading: boolean;
}

// For now, we check GitHub config via the github-auth function
// Other providers would need similar config checks
async function checkConfiguredProviders(): Promise<OAuthProvider[]> {
  const configured: OAuthProvider[] = [];

  // Check GitHub configuration
  try {
    const { data, error } = await supabase.functions.invoke('github-auth', {
      body: {},
    });
    
    // If we get here without error, check the response
    if (!error && data?.configured !== false) {
      configured.push('github');
    }
  } catch {
    // GitHub not configured
  }

  // For other providers, we can't easily check server-side config
  // So we assume they're not configured unless explicitly set
  // In a real app, you'd have an endpoint that returns all configured providers
  
  return configured;
}

export function useOAuthProviders(): OAuthConfig {
  const { data: configuredProviders = [], isLoading } = useQuery({
    queryKey: ['oauth-providers'],
    queryFn: checkConfiguredProviders,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  return {
    configuredProviders,
    isLoading,
  };
}
