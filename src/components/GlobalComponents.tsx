import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
import { InstallPromptBanner } from '@/components/pwa/InstallPromptBanner';
import { FloatingInstallButton } from '@/components/pwa/FloatingInstallButton';
import { CommandPalette } from '@/components/CommandPalette';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useOLEDSuggestion } from '@/hooks/useOLEDSuggestion';
import { usePageTracking } from '@/hooks/usePageTracking';

/**
 * Global preference loaders that need to run on app mount.
 * These hooks apply user preferences and track analytics.
 */
function PreferenceLoaders() {
  useReducedMotion();
  useOLEDSuggestion();
  usePageTracking();
  return null;
}

/**
 * Global UI components that appear across the entire application.
 * Includes toasters, PWA components, and command palette.
 */
export function GlobalComponents() {
  return (
    <>
      <PreferenceLoaders />
      <Toaster />
      <Sonner />
      <UpdateNotification />
      <InstallPromptBanner />
      <FloatingInstallButton />
      <CommandPalette />
    </>
  );
}
