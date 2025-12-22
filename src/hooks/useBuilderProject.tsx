import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { BuilderProject, ProjectFile, OpenTab } from '@/types/builder';
import { createFileVersion } from '@/hooks/useFileVersions';
import { buildFileTree } from '@/lib/fileTree';
import { builderService } from '@/services/builderService';

// Auto-save delay in milliseconds
const AUTO_SAVE_DELAY = 2000;

export function useBuilderProject(projectId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
  
  // Auto-save timer refs
  const autoSaveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pendingAutoSaves = useRef<Set<string>>(new Set());
  
  // Cleanup auto-save timers on unmount
  useEffect(() => {
    return () => {
      autoSaveTimers.current.forEach(timer => clearTimeout(timer));
      autoSaveTimers.current.clear();
    };
  }, []);

  // Fetch project
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['builder', 'project', projectId],
    queryFn: () => builderService.getProject(projectId!),
    enabled: !!projectId,
  });

  // Fetch files
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['builder', 'files', projectId],
    queryFn: () => builderService.getFiles(projectId!),
    enabled: !!projectId,
  });

  // Build file tree
  const fileTree = buildFileTree(files);

  // Create project mutation
  const createProject = useMutation({
    mutationFn: async ({ name, templateId = 'blank' }: { name: string; templateId?: string }) => {
      if (!user) throw new Error('Not authenticated');
      return builderService.createProject({ userId: user.id, name, templateId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder', 'projects'] });
      toast.success('Project created');
    },
    onError: (error) => {
      toast.error('Failed to create project: ' + error.message);
    },
  });

  // Create project from imported files mutation
  const createProjectFromFiles = useMutation({
    mutationFn: async ({ name, files }: { 
      name: string; 
      files: Array<{ path: string; name: string; content: string; type: 'file' | 'folder' }> 
    }) => {
      if (!user) throw new Error('Not authenticated');
      return builderService.createProjectFromFiles({ userId: user.id, name, files });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder', 'projects'] });
      toast.success('Project imported');
    },
    onError: (error) => {
      toast.error('Failed to import project: ' + error.message);
    },
  });

  // Update project mutation
  const updateProject = useMutation({
    mutationFn: async (updates: { 
      name?: string; 
      description?: string; 
      is_public?: boolean;
      template?: string;
      framework?: string;
    }) => {
      if (!projectId) throw new Error('No project selected');
      return builderService.updateProject(projectId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder', 'project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['builder', 'projects'] });
    },
    onError: (error) => {
      toast.error('Failed to update project: ' + error.message);
    },
  });

  // Delete project mutation
  const deleteProject = useMutation({
    mutationFn: async (projectIdToDelete: string) => {
      await builderService.deleteProject(projectIdToDelete);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder', 'projects'] });
      toast.success('Project deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete project: ' + error.message);
    },
  });

  // Fetch user's projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['builder', 'projects', user?.id],
    queryFn: () => builderService.getProjects(user!.id),
    enabled: !!user,
  });

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

  // Create file mutation
  const createFile = useMutation({
    mutationFn: async ({ path, name, type, content = '' }: { 
      path: string; 
      name: string; 
      type: 'file' | 'folder';
      content?: string;
    }) => {
      if (!projectId) throw new Error('No project selected');
      return builderService.createFile({ projectId, path, name, type, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder', 'files', projectId] });
      toast.success('File created');
    },
  });

  // Delete file mutation
  const deleteFile = useMutation({
    mutationFn: async (fileId: string) => {
      await builderService.deleteFile(fileId);
      return fileId;
    },
    onSuccess: (fileId) => {
      queryClient.invalidateQueries({ queryKey: ['builder', 'files', projectId] });
      setOpenTabs(prev => prev.filter(t => t.id !== fileId));
      if (activeTabId === fileId) {
        setActiveTabId(openTabs[0]?.id || null);
      }
      toast.success('File deleted');
    },
  });

  // Rename file mutation
  const renameFile = useMutation({
    mutationFn: async ({ fileId, newName, newPath }: { 
      fileId: string; 
      newName: string;
      newPath: string;
    }) => {
      await builderService.renameFile(fileId, newName, newPath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder', 'files', projectId] });
      toast.success('File renamed');
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
    
    if (file.content !== null) {
      setFileContents(prev => ({ ...prev, [file.id]: file.content! }));
    }
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

  // Perform auto-save for a file
  const performAutoSave = useCallback(async (fileId: string) => {
    const content = fileContents[fileId];
    if (content === undefined) return;
    
    pendingAutoSaves.current.add(fileId);
    try {
      await updateFileContent.mutateAsync({ fileId, content });
      setOpenTabs(prev => 
        prev.map(t => t.id === fileId ? { ...t, isDirty: false } : t)
      );
    } finally {
      pendingAutoSaves.current.delete(fileId);
    }
  }, [fileContents, updateFileContent]);

  // Update local content (for typing) with debounced auto-save
  const updateLocalContent = useCallback((fileId: string, content: string) => {
    setFileContents(prev => ({ ...prev, [fileId]: content }));
    setDirtyFiles(prev => new Set(prev).add(fileId));
    setOpenTabs(prev => 
      prev.map(t => t.id === fileId ? { ...t, isDirty: true } : t)
    );
    
    // Cancel existing auto-save timer for this file
    const existingTimer = autoSaveTimers.current.get(fileId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new debounced auto-save timer
    const timer = setTimeout(() => {
      autoSaveTimers.current.delete(fileId);
      // Get latest content from state
      setFileContents(prev => {
        const latestContent = prev[fileId];
        if (latestContent !== undefined) {
          // Perform save with latest content
          performAutoSave(fileId);
        }
        return prev;
      });
    }, AUTO_SAVE_DELAY);
    
    autoSaveTimers.current.set(fileId, timer);
  }, [performAutoSave]);

  // Manual save file (immediate)
  const saveFile = useCallback(async (fileId: string) => {
    // Cancel any pending auto-save
    const existingTimer = autoSaveTimers.current.get(fileId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      autoSaveTimers.current.delete(fileId);
    }
    
    const content = fileContents[fileId];
    if (content !== undefined) {
      await updateFileContent.mutateAsync({ fileId, content });
      setOpenTabs(prev => 
        prev.map(t => t.id === fileId ? { ...t, isDirty: false } : t)
      );
    }
  }, [fileContents, updateFileContent]);

  // Get current file content
  const getFileContent = useCallback((fileId: string): string => {
    if (fileContents[fileId] !== undefined) {
      return fileContents[fileId];
    }
    const file = files.find(f => f.id === fileId);
    return file?.content || '';
  }, [fileContents, files]);

  // Apply AI operations (create, update, delete files)
  const applyAIOperations = useCallback(async (operations: Array<{
    type: 'create' | 'update' | 'delete';
    path: string;
    content?: string;
  }>) => {
    if (!projectId) throw new Error('No project selected');
    
    await builderService.applyAIOperations({
      projectId,
      files,
      operations,
      onVersionCreate: createFileVersion,
    });

    // Handle tab cleanup for deleted files
    for (const op of operations) {
      if (op.type === 'delete') {
        const file = files.find(f => f.path === op.path);
        if (file) {
          setOpenTabs(prev => prev.filter(t => t.id !== file.id));
          if (activeTabId === file.id) {
            setActiveTabId(openTabs[0]?.id || null);
          }
        }
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ['builder', 'files', projectId] });
  }, [projectId, files, activeTabId, openTabs, queryClient]);

  // Remix project mutation
  const remixProject = useMutation({
    mutationFn: async ({ 
      sourceProjectId, 
      newName, 
      includeKnowledgeBase = true 
    }: { 
      sourceProjectId: string; 
      newName: string; 
      includeKnowledgeBase?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');
      return builderService.remixProject({
        sourceProjectId,
        userId: user.id,
        newName,
        includeKnowledgeBase,
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['builder', 'projects'] });
      toast.success(`Project remixed! ${result.fileCount} files copied.`);
    },
    onError: (error) => {
      toast.error('Failed to remix project: ' + error.message);
    },
  });

  // Get active file
  const activeFile = files.find(f => f.id === activeTabId);

  return {
    // Data
    project,
    projects,
    files,
    fileTree,
    openTabs,
    activeTabId,
    activeFile,
    
    // Loading states
    isLoading: projectLoading || filesLoading || projectsLoading,
    
    // Actions
    createProject: createProject.mutate,
    createProjectFromFiles: createProjectFromFiles.mutateAsync,
    isCreatingFromFiles: createProjectFromFiles.isPending,
    updateProject: updateProject.mutateAsync,
    isUpdatingProject: updateProject.isPending,
    createFile: createFile.mutate,
    deleteFile: deleteFile.mutate,
    renameFile: renameFile.mutate,
    remixProject: remixProject.mutateAsync,
    isRemixing: remixProject.isPending,
    deleteProject: deleteProject.mutateAsync,
    isDeletingProject: deleteProject.isPending,
    openFile,
    closeTab,
    setActiveTabId,
    applyAIOperations,
    
    // Content management
    getFileContent,
    updateLocalContent,
    saveFile,
    dirtyFiles,
  };
}
