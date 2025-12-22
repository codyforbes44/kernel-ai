import { useState, useCallback, useMemo } from 'react';

export type PanelType =
  | 'ai-chat'
  | 'history'
  | 'deployments'
  | 'github'
  | 'design-system'
  | 'marketplace'
  | 'knowledge-base'
  | 'storage'
  | 'database'
  | 'security'
  | null;

interface PanelConfig {
  id: PanelType;
  defaultSize: number;
  minSize: number;
  maxSize: number;
}

const PANEL_CONFIGS: Record<Exclude<PanelType, null>, PanelConfig> = {
  'ai-chat': { id: 'ai-chat', defaultSize: 25, minSize: 20, maxSize: 40 },
  'history': { id: 'history', defaultSize: 25, minSize: 20, maxSize: 40 },
  'deployments': { id: 'deployments', defaultSize: 25, minSize: 20, maxSize: 40 },
  'github': { id: 'github', defaultSize: 25, minSize: 20, maxSize: 40 },
  'design-system': { id: 'design-system', defaultSize: 25, minSize: 20, maxSize: 40 },
  'marketplace': { id: 'marketplace', defaultSize: 30, minSize: 25, maxSize: 50 },
  'knowledge-base': { id: 'knowledge-base', defaultSize: 25, minSize: 20, maxSize: 40 },
  'storage': { id: 'storage', defaultSize: 30, minSize: 25, maxSize: 50 },
  'database': { id: 'database', defaultSize: 50, minSize: 35, maxSize: 70 },
  'security': { id: 'security', defaultSize: 40, minSize: 30, maxSize: 60 },
};

export interface UsePanelManagerReturn {
  activePanel: PanelType;
  showExplorer: boolean;
  showPreview: boolean;
  
  togglePanel: (panel: PanelType) => void;
  setActivePanel: (panel: PanelType) => void;
  toggleExplorer: () => void;
  togglePreview: () => void;
  
  isPanelActive: (panel: PanelType) => boolean;
  getPanelConfig: (panel: Exclude<PanelType, null>) => PanelConfig;
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

  const getPanelConfig = useCallback((panel: Exclude<PanelType, null>) => {
    return PANEL_CONFIGS[panel];
  }, []);

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
  }), [activePanel, showExplorer, showPreview, togglePanel, setActivePanel, toggleExplorer, togglePreview, isPanelActive, getPanelConfig]);
}
