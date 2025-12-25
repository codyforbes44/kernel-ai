import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
import { InstallPromptBanner } from '@/components/pwa/InstallPromptBanner';
import { FloatingInstallButton } from '@/components/pwa/FloatingInstallButton';
import { CommandPalette } from '@/components/CommandPalette';
import { VoiceAgentWidget } from '@/components/voice/VoiceAgentWidget';
import { VoiceAgentProvider, useVoiceAgentConfig } from '@/components/voice/VoiceAgentProvider';
import { ElevenLabsSettingsProvider, useElevenLabsSettings } from '@/contexts/ElevenLabsSettingsContext';
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
  useSessionRefresh();
  return null;
}

/**
 * Voice agent widget that uses config from context
 */
function VoiceAgentContainer() {
  const { config } = useVoiceAgentConfig();
  const { settings } = useElevenLabsSettings();
  
  const agentId = config.agentId || settings.voiceAgent.agentId || 'agent_3601kdbjwad7fnys6r2ye64jmpa9';
  
  if (!config.enabled && !settings.voiceAgent.enabled) {
    return null;
  }
  
  return <VoiceAgentWidget agentId={agentId} />;
}

/**
 * Global UI components that appear across the entire application.
 */
export function GlobalComponents() {
  return (
    <ElevenLabsSettingsProvider>
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
    </ElevenLabsSettingsProvider>
  );
}
