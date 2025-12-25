import React, { createContext, useContext, useState, useCallback } from 'react';

interface VoiceAgentConfig {
  agentId: string;
  enabled: boolean;
}

interface VoiceAgentContextType {
  config: VoiceAgentConfig;
  setAgentId: (agentId: string) => void;
  setEnabled: (enabled: boolean) => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextType | null>(null);

const STORAGE_KEY = 'kernel-voice-agent-config';

function loadConfig(): VoiceAgentConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load voice agent config:', e);
  }
  return { agentId: '', enabled: true };
}

function saveConfig(config: VoiceAgentConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save voice agent config:', e);
  }
}

export function VoiceAgentProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<VoiceAgentConfig>(loadConfig);

  const setAgentId = useCallback((agentId: string) => {
    setConfig(prev => {
      const newConfig = { ...prev, agentId };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setConfig(prev => {
      const newConfig = { ...prev, enabled };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  return (
    <VoiceAgentContext.Provider value={{ config, setAgentId, setEnabled }}>
      {children}
    </VoiceAgentContext.Provider>
  );
}

export function useVoiceAgentConfig() {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error('useVoiceAgentConfig must be used within VoiceAgentProvider');
  }
  return context;
}
