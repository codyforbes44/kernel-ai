import { useState, useCallback, useMemo } from 'react';
import { panelRegistry, type PanelId, type PanelType, type PanelSizeConfig } from '@/registry/panelRegistry';

export interface UsePanelManagerReturn {
  activePanel: PanelType;
  showExplorer: boolean;
  showPreview: boolean;
  
  togglePanel: (panel: PanelType) => void;
  setActivePanel: (panel: PanelType) => void;
  toggleExplorer: () => void;
  togglePreview: () => void;
  
  isPanelActive: (panel: PanelType) => boolean;
  getPanelConfig: (panel: PanelId) => PanelSizeConfig;
  
  /** Get all available panel IDs */
  availablePanels: PanelId[];
}

export function usePanelManager(initialPanel: PanelType = 'ai-chat'): UsePanelManagerReturn {
  const [activePanel, setActivePanelState] = useState<PanelType>(initialPanel);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const togglePanel = useCallback((panel: PanelType) => {
    setActivePanelState(prev => prev === panel ? null : panel);
  }, []);

  const setActivePanel = useCallback((panel: PanelType) => {
    setActivePanelState(panel);
  }, []);

  const toggleExplorer = useCallback(() => {
    setShowExplorer(prev => !prev);
  }, []);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  const isPanelActive = useCallback((panel: PanelType) => {
    return activePanel === panel;
  }, [activePanel]);

  const getPanelConfig = useCallback((panel: PanelId): PanelSizeConfig => {
    return panelRegistry.getSizeConfig(panel);
  }, []);

  const availablePanels = useMemo(() => panelRegistry.getAllIds(), []);

  return useMemo(() => ({
    activePanel,
    showExplorer,
    showPreview,
    togglePanel,
    setActivePanel,
    toggleExplorer,
    togglePreview,
    isPanelActive,
    getPanelConfig,
    availablePanels,
  }), [activePanel, showExplorer, showPreview, togglePanel, setActivePanel, toggleExplorer, togglePreview, isPanelActive, getPanelConfig, availablePanels]);
}

// Re-export types for convenience
export type { PanelId, PanelType, PanelSizeConfig };
