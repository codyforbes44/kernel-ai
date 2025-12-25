import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Voice settings for TTS
export interface VoiceSettings {
  stability: number;        // 0-1
  similarityBoost: number;  // 0-1
  style: number;            // 0-1
  useSpeakerBoost: boolean;
  speed: number;            // 0.7-1.2
}

// Microphone settings for voice agent
export interface MicrophoneSettings {
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

// Complete ElevenLabs settings
export interface ElevenLabsSettings {
  // Voice Agent settings
  voiceAgent: {
    enabled: boolean;
    agentId: string;
    widgetPosition: 'bottom-right' | 'bottom-left' | 'bottom-center';
    defaultVolume: number;
    microphone: MicrophoneSettings;
  };
  
  // TTS settings
  tts: {
    enabled: boolean;
    autoPlay: boolean;
    voiceId: string;
    model: 'eleven_turbo_v2_5' | 'eleven_multilingual_v2';
    outputFormat: 'mp3_44100_128' | 'mp3_22050_32';
    voiceSettings: VoiceSettings;
  };
  
  // Playback settings
  playback: {
    volume: number;         // 0-1
    playbackRate: number;   // 0.5-2.0
  };
}

// Presets for quick configuration
export type VoicePreset = 'natural' | 'narration' | 'expressive' | 'professional' | 'custom';

export const VOICE_PRESETS: Record<VoicePreset, VoiceSettings> = {
  natural: {
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.3,
    useSpeakerBoost: true,
    speed: 1.0,
  },
  narration: {
    stability: 0.7,
    similarityBoost: 0.8,
    style: 0.2,
    useSpeakerBoost: true,
    speed: 0.95,
  },
  expressive: {
    stability: 0.3,
    similarityBoost: 0.6,
    style: 0.7,
    useSpeakerBoost: true,
    speed: 1.0,
  },
  professional: {
    stability: 0.9,
    similarityBoost: 0.85,
    style: 0.1,
    useSpeakerBoost: true,
    speed: 1.0,
  },
  custom: {
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.3,
    useSpeakerBoost: true,
    speed: 1.0,
  },
};

// Available voices
export const TTS_VOICES = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Professional male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Clear female' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', description: 'Friendly female' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Warm male' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'British female' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Natural male' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Authoritative male' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Soft female' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Casual male' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', description: 'Scottish male' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', description: 'Non-binary' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', description: 'American male' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', description: 'Young female' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', description: 'American male' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', description: 'Casual male' },
];

const DEFAULT_SETTINGS: ElevenLabsSettings = {
  voiceAgent: {
    enabled: true,
    agentId: '',
    widgetPosition: 'bottom-right',
    defaultVolume: 0.8,
    microphone: {
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true,
    },
  },
  tts: {
    enabled: true,
    autoPlay: false,
    voiceId: 'JBFqnCBsd6RMkjVDRZzb',
    model: 'eleven_turbo_v2_5',
    outputFormat: 'mp3_44100_128',
    voiceSettings: VOICE_PRESETS.natural,
  },
  playback: {
    volume: 0.8,
    playbackRate: 1.0,
  },
};

const STORAGE_KEY = 'kernel-elevenlabs-settings';

interface ElevenLabsContextType {
  settings: ElevenLabsSettings;
  updateVoiceAgent: (updates: Partial<ElevenLabsSettings['voiceAgent']>) => void;
  updateTTS: (updates: Partial<ElevenLabsSettings['tts']>) => void;
  updateVoiceSettings: (updates: Partial<VoiceSettings>) => void;
  updateMicrophoneSettings: (updates: Partial<MicrophoneSettings>) => void;
  updatePlayback: (updates: Partial<ElevenLabsSettings['playback']>) => void;
  applyPreset: (preset: VoicePreset) => void;
  currentPreset: VoicePreset;
  resetToDefaults: () => void;
}

const ElevenLabsContext = createContext<ElevenLabsContextType | null>(null);

function loadSettings(): ElevenLabsSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Deep merge with defaults to handle missing fields
      return {
        voiceAgent: { ...DEFAULT_SETTINGS.voiceAgent, ...parsed.voiceAgent },
        tts: { 
          ...DEFAULT_SETTINGS.tts, 
          ...parsed.tts,
          voiceSettings: { ...DEFAULT_SETTINGS.tts.voiceSettings, ...parsed.tts?.voiceSettings },
        },
        playback: { ...DEFAULT_SETTINGS.playback, ...parsed.playback },
      };
    }
  } catch (e) {
    console.error('Failed to load ElevenLabs settings:', e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: ElevenLabsSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save ElevenLabs settings:', e);
  }
}

function detectPreset(voiceSettings: VoiceSettings): VoicePreset {
  for (const [name, preset] of Object.entries(VOICE_PRESETS)) {
    if (name === 'custom') continue;
    if (
      Math.abs(preset.stability - voiceSettings.stability) < 0.01 &&
      Math.abs(preset.similarityBoost - voiceSettings.similarityBoost) < 0.01 &&
      Math.abs(preset.style - voiceSettings.style) < 0.01 &&
      preset.useSpeakerBoost === voiceSettings.useSpeakerBoost &&
      Math.abs(preset.speed - voiceSettings.speed) < 0.01
    ) {
      return name as VoicePreset;
    }
  }
  return 'custom';
}

export function ElevenLabsSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ElevenLabsSettings>(loadSettings);
  const [currentPreset, setCurrentPreset] = useState<VoicePreset>(() => 
    detectPreset(loadSettings().tts.voiceSettings)
  );

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateVoiceAgent = useCallback((updates: Partial<ElevenLabsSettings['voiceAgent']>) => {
    setSettings(prev => ({
      ...prev,
      voiceAgent: { ...prev.voiceAgent, ...updates },
    }));
  }, []);

  const updateTTS = useCallback((updates: Partial<ElevenLabsSettings['tts']>) => {
    setSettings(prev => ({
      ...prev,
      tts: { ...prev.tts, ...updates },
    }));
  }, []);

  const updateVoiceSettings = useCallback((updates: Partial<VoiceSettings>) => {
    setSettings(prev => {
      const newVoiceSettings = { ...prev.tts.voiceSettings, ...updates };
      setCurrentPreset(detectPreset(newVoiceSettings));
      return {
        ...prev,
        tts: { ...prev.tts, voiceSettings: newVoiceSettings },
      };
    });
  }, []);

  const updateMicrophoneSettings = useCallback((updates: Partial<MicrophoneSettings>) => {
    setSettings(prev => ({
      ...prev,
      voiceAgent: {
        ...prev.voiceAgent,
        microphone: { ...prev.voiceAgent.microphone, ...updates },
      },
    }));
  }, []);

  const updatePlayback = useCallback((updates: Partial<ElevenLabsSettings['playback']>) => {
    setSettings(prev => ({
      ...prev,
      playback: { ...prev.playback, ...updates },
    }));
  }, []);

  const applyPreset = useCallback((preset: VoicePreset) => {
    setCurrentPreset(preset);
    setSettings(prev => ({
      ...prev,
      tts: { ...prev.tts, voiceSettings: { ...VOICE_PRESETS[preset] } },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setCurrentPreset('natural');
  }, []);

  return (
    <ElevenLabsContext.Provider value={{
      settings,
      updateVoiceAgent,
      updateTTS,
      updateVoiceSettings,
      updateMicrophoneSettings,
      updatePlayback,
      applyPreset,
      currentPreset,
      resetToDefaults,
    }}>
      {children}
    </ElevenLabsContext.Provider>
  );
}

export function useElevenLabsSettings() {
  const context = useContext(ElevenLabsContext);
  if (!context) {
    throw new Error('useElevenLabsSettings must be used within ElevenLabsSettingsProvider');
  }
  return context;
}
