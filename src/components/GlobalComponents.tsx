import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
import { InstallPromptBanner } from '@/components/pwa/InstallPromptBanner';
import { FloatingInstallButton } from '@/components/pwa/FloatingInstallButton';
import { CommandPalette } from '@/components/CommandPalette';
import { VoiceAgentWidget } from '@/components/voice/VoiceAgentWidget';
import { VoiceAgentProvider, useVoiceAgentConfig } from '@/components/voice/VoiceAgentProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useOLEDSuggestion } from '@/hooks/useOLEDSuggestion';
import { usePageTracking } from '@/hooks/usePageTracking';
import { useSessionRefresh } from '@/hooks/useSessionRefresh';

/**
 * Global preference loaders that need to run on app mount.
 * These hooks apply user preferences and track analytics.
 */
function PreferenceLoaders() {
  useReducedMotion();
  useOLEDSuggestion();
  usePageTracking();
  useSessionRefresh(); // Auto-refresh on new user session if update available
  return null;
}

/**
 * Voice agent widget that uses config from context
 */
function VoiceAgentContainer() {
  const { config } = useVoiceAgentConfig();
  
  // Default agent ID - can be overridden via config
  const agentId = config.agentId || 'agent_3601kdbjwad7fnys6r2ye64jmpa9';
  
  if (!config.enabled) {
    return null;
  }
  
  return <VoiceAgentWidget agentId={agentId} />;
}

/**
 * Global UI components that appear across the entire application.
 * Includes toasters, PWA components, and command palette.
 */
export function GlobalComponents() {
  return (
    <VoiceAgentProvider>
      <PreferenceLoaders />
      <Toaster />
      <Sonner />
      <UpdateNotification />
      <InstallPromptBanner />
      <FloatingInstallButton />
      <CommandPalette />
      <VoiceAgentContainer />
    </VoiceAgentProvider>
  );
}
