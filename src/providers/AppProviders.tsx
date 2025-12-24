import { ReactNode, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/hooks/useAuth';
import { TeamAccessProvider } from '@/hooks/useTeamAccess';
import { WorkspaceProvider } from '@/hooks/useWorkspace';
import { TemplateInjectionProvider } from '@/hooks/useTemplateInjection';
import { FeatureGatingProvider } from '@/hooks/useFeatureGating';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProviderComposer } from './ProviderComposer';

// Singleton QueryClient to avoid recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Centralized provider wrapper that composes all application-level context providers.
 * This reduces "provider hell" in App.tsx and makes provider management cleaner.
 */
export function AppProviders({ children }: AppProvidersProps) {
  // Using useMemo to prevent provider recreation
  // Note: We're using explicit provider wrapping here for better type safety
  // The ProviderComposer is available for simpler provider chains
  const providers = useMemo(
    () => [
      { provider: QueryClientProvider, props: { client: queryClient } },
      { provider: ThemeProvider, props: { attribute: 'class' as const, defaultTheme: 'dark', enableSystem: true } },
      { provider: AuthProvider },
      { provider: TeamAccessProvider },
      { provider: WorkspaceProvider },
      { provider: FeatureGatingProvider },
      { provider: TemplateInjectionProvider },
      { provider: TooltipProvider },
    ],
    []
  );

  return <ProviderComposer providers={providers}>{children}</ProviderComposer>;
}

export { queryClient };
