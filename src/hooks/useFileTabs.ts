import { useState, useCallback } from 'react';
import type { ProjectFile, OpenTab } from '@/types/builder';

interface UseFileTabsReturn {
  openTabs: OpenTab[];
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
  openFile: (file: ProjectFile, initialContent?: string | null) => void;
  closeTab: (tabId: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  removeTab: (tabId: string) => void;
}

/**
 * Hook for managing editor tabs
 */
export function useFileTabs(): UseFileTabsReturn {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openFile = useCallback((file: ProjectFile, initialContent?: string | null) => {
    if (file.type === 'folder') return;

    const existingTab = openTabs.find(t => t.id === file.id);
    if (existingTab) {
      setActiveTabId(file.id);
      return;
    }

    const newTab: OpenTab = {
      id: file.id,
      path: file.path,
      name: file.name,
      language: file.language,
      isDirty: false,
    };

    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(file.id);
  }, [openTabs]);

  const closeTab = useCallback((tabId: string) => {
    const tabIndex = openTabs.findIndex(t => t.id === tabId);
    setOpenTabs(prev => prev.filter(t => t.id !== tabId));
    
    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, openTabs.length - 2);
      setActiveTabId(openTabs[newActiveIndex]?.id || null);
    }
  }, [openTabs, activeTabId]);

  const markTabDirty = useCallback((tabId: string, isDirty: boolean) => {
    setOpenTabs(prev => 
      prev.map(t => t.id === tabId ? { ...t, isDirty } : t)
    );
  }, []);

  const removeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => prev.filter(t => t.id !== tabId));
    if (activeTabId === tabId) {
      setActiveTabId(openTabs[0]?.id || null);
    }
  }, [activeTabId, openTabs]);

  return {
    openTabs,
    activeTabId,
    setActiveTabId,
    openFile,
    closeTab,
    markTabDirty,
    removeTab,
  };
}
