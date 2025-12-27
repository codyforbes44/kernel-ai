import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_VOICE_SETTINGS, VoiceMode, VoiceInputMode } from '@/constants/companion';

export interface VoiceSettings {
  enabled: boolean;
  autoPlay: boolean;
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
  voiceMode: VoiceMode;
  inputMode: VoiceInputMode;
}

const STORAGE_KEY_PREFIX = 'companion_voice_settings_';

const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: true,
  autoPlay: false,
  stability: DEFAULT_VOICE_SETTINGS.stability,
  similarity_boost: DEFAULT_VOICE_SETTINGS.similarity_boost,
  style: DEFAULT_VOICE_SETTINGS.style,
  speed: 1.0,
  voiceMode: 'read-aloud',
  inputMode: 'vad',
};

function loadSettings(companionId: string): VoiceSettings {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${companionId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load voice settings:', error);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(companionId: string, settings: VoiceSettings): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${companionId}`, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save voice settings:', error);
  }
}

export function useCompanionVoiceSettings(companionId: string) {
  const [settings, setSettings] = useState<VoiceSettings>(() => loadSettings(companionId));

  // Reload settings when companion changes
  useEffect(() => {
    setSettings(loadSettings(companionId));
  }, [companionId]);

  const updateSettings = useCallback((newSettings: VoiceSettings) => {
    setSettings(newSettings);
    saveSettings(companionId, newSettings);
  }, [companionId]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(companionId, DEFAULT_SETTINGS);
  }, [companionId]);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
