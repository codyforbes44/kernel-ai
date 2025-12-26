import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileVersion } from '@/hooks/useFileVersions';
import { builderService } from '@/services/builderService';
import type { ProjectFile, OpenTab } from '@/types/builder';

interface UseFileContentManagerOptions {
  projectId?: string;
  files: ProjectFile[];
}

export function useFileContentManager({ projectId, files }: UseFileContentManagerOptions) {
  const queryClient = useQueryClient();
  
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());

  // Update file content mutation
  const updateFileContent = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: string; content: string }) => {
      const file = files.find(f => f.id === fileId);
      if (file?.content) {
        await createFileVersion(fileId, file.content, 'Auto-save before update');
      }
      await builderService.updateFileContent(fileId, content);
    },
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['builder', 'files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['builder', 'versions', fileId] });
      setDirtyFiles(prev => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    },
  });

  // Open a file in a tab
  const openFile = useCallback((file: ProjectFile) => {
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
    
    // Always set file content - use empty string as fallback for null content
    setFileContents(prev => ({ ...prev, [file.id]: file.content ?? '' }));
  }, [openTabs]);

  // Close a tab
  const closeTab = useCallback((tabId: string) => {
    const tabIndex = openTabs.findIndex(t => t.id === tabId);
    setOpenTabs(prev => prev.filter(t => t.id !== tabId));
    
    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, openTabs.length - 2);
      setActiveTabId(openTabs[newActiveIndex]?.id || null);
    }
  }, [openTabs, activeTabId]);

  // Update local content (for typing)
  const updateLocalContent = useCallback((fileId: string, content: string) => {
    setFileContents(prev => ({ ...prev, [fileId]: content }));
    setDirtyFiles(prev => new Set(prev).add(fileId));
    setOpenTabs(prev => 
      prev.map(t => t.id === fileId ? { ...t, isDirty: true } : t)
    );
  }, []);

  // Save file
  const saveFile = useCallback(async (fileId: string) => {
    const content = fileContents[fileId];
    if (content !== undefined) {
      await updateFileContent.mutateAsync({ fileId, content });
      setOpenTabs(prev => 
        prev.map(t => t.id === fileId ? { ...t, isDirty: false } : t)
      );
    }
  }, [fileContents, updateFileContent]);

  // Get current file content - returns undefined if not yet loaded
  const getFileContent = useCallback((fileId: string): string | undefined => {
    // Check local state first (has edits or was opened)
    if (fileContents[fileId] !== undefined) {
      return fileContents[fileId];
    }
    // Check if file exists in fetched files
    const file = files.find(f => f.id === fileId);
    if (file) {
      // File exists - return content or empty string for null content
      return file.content ?? '';
    }
    // File not found - return undefined to indicate loading
    return undefined;
  }, [fileContents, files]);

  // Remove tabs for deleted files
  const removeTabsForFiles = useCallback((filePaths: string[]) => {
    for (const path of filePaths) {
      const file = files.find(f => f.path === path);
      if (file) {
        setOpenTabs(prev => prev.filter(t => t.id !== file.id));
        if (activeTabId === file.id) {
          setActiveTabId(openTabs[0]?.id || null);
        }
      }
    }
  }, [files, activeTabId, openTabs]);

  // Get active file
  const activeFile = files.find(f => f.id === activeTabId);

  return {
    openTabs,
    activeTabId,
    activeFile,
    dirtyFiles,
    setActiveTabId,
    openFile,
    closeTab,
    getFileContent,
    updateLocalContent,
    saveFile,
    removeTabsForFiles,
  };
}
