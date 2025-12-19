import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { BuilderProject, ProjectFile, FileTreeNode, OpenTab, getLanguageFromPath } from '@/types/builder';

// Default React template files
const DEFAULT_TEMPLATE_FILES = [
  {
    path: '/src/App.tsx',
    name: 'App.tsx',
    type: 'file' as const,
    language: 'typescript',
    is_entry_point: true,
    content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Hello World!</h1>
      <p>Start editing to see changes.</p>
    </div>
  );
}

export default App;
`,
  },
  {
    path: '/src/App.css',
    name: 'App.css',
    type: 'file' as const,
    language: 'css',
    is_entry_point: false,
    content: `.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.25rem;
  opacity: 0.9;
}
`,
  },
  {
    path: '/src/main.tsx',
    name: 'main.tsx',
    type: 'file' as const,
    language: 'typescript',
    is_entry_point: false,
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
  },
  {
    path: '/index.html',
    name: 'index.html',
    type: 'file' as const,
    language: 'html',
    is_entry_point: false,
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  },
  {
    path: '/package.json',
    name: 'package.json',
    type: 'file' as const,
    language: 'json',
    is_entry_point: false,
    content: `{
  "name": "my-app",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "vite": "^5.0.0"
  }
}
`,
  },
];

// Build file tree from flat file list
function buildFileTree(files: ProjectFile[]): FileTreeNode[] {
  const tree: FileTreeNode[] = [];
  const folderMap = new Map<string, FileTreeNode>();

  // Sort files so folders come first, then alphabetically
  const sorted = [...files].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const file of sorted) {
    const parts = file.path.split('/').filter(Boolean);
    let currentPath = '';
    let currentLevel = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath += '/' + part;
      const isLast = i === parts.length - 1;

      if (isLast) {
        // This is the actual file/folder
        currentLevel.push({
          id: file.id,
          name: file.name,
          path: file.path,
          type: file.type,
          language: file.language || undefined,
          children: file.type === 'folder' ? [] : undefined,
        });
      } else {
        // This is an intermediate folder
        let folder = folderMap.get(currentPath);
        if (!folder) {
          folder = {
            id: `folder-${currentPath}`,
            name: part,
            path: currentPath,
            type: 'folder',
            children: [],
          };
          folderMap.set(currentPath, folder);
          currentLevel.push(folder);
        }
        currentLevel = folder.children!;
      }
    }
  }

  return tree;
}

export function useBuilderProject(projectId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());

  // Fetch project
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['builder-project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await supabase
        .from('builder_projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data as BuilderProject;
    },
    enabled: !!projectId,
  });

  // Fetch files
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('path');
      if (error) throw error;
      return data as ProjectFile[];
    },
    enabled: !!projectId,
  });

  // Build file tree
  const fileTree = buildFileTree(files);

  // Create project mutation
  const createProject = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      
      // Create project
      const { data: newProject, error: projectError } = await supabase
        .from('builder_projects')
        .insert({ user_id: user.id, name })
        .select()
        .single();
      
      if (projectError) throw projectError;

      // Create default template files
      const filesToInsert = DEFAULT_TEMPLATE_FILES.map(file => ({
        project_id: newProject.id,
        ...file,
      }));

      const { error: filesError } = await supabase
        .from('project_files')
        .insert(filesToInsert);

      if (filesError) throw filesError;

      return newProject as BuilderProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-projects'] });
      toast.success('Project created');
    },
    onError: (error) => {
      toast.error('Failed to create project: ' + error.message);
    },
  });

  // Fetch user's projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['builder-projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('builder_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as BuilderProject[];
    },
    enabled: !!user,
  });

  // Update file content mutation
  const updateFileContent = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: string; content: string }) => {
      const { error } = await supabase
        .from('project_files')
        .update({ content })
        .eq('id', fileId);
      if (error) throw error;
    },
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
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
      
      const { getLanguageFromPath } = await import('@/types/builder');
      
      const { data, error } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          path,
          name,
          type,
          content: type === 'file' ? content : null,
          language: type === 'file' ? getLanguageFromPath(path) : null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ProjectFile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      toast.success('File created');
    },
  });

  // Delete file mutation
  const deleteFile = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', fileId);
      if (error) throw error;
    },
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      // Close tab if open
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
      const { getLanguageFromPath } = await import('@/types/builder');
      
      const { error } = await supabase
        .from('project_files')
        .update({ 
          name: newName, 
          path: newPath,
          language: getLanguageFromPath(newPath),
        })
        .eq('id', fileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
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
    
    // Load content into local state
    if (file.content !== null) {
      setFileContents(prev => ({ ...prev, [file.id]: file.content! }));
    }
  }, [openTabs]);

  // Close a tab
  const closeTab = useCallback((tabId: string) => {
    const tabIndex = openTabs.findIndex(t => t.id === tabId);
    setOpenTabs(prev => prev.filter(t => t.id !== tabId));
    
    if (activeTabId === tabId) {
      // Switch to adjacent tab
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

  // Get current file content
  const getFileContent = useCallback((fileId: string): string => {
    if (fileContents[fileId] !== undefined) {
      return fileContents[fileId];
    }
    const file = files.find(f => f.id === fileId);
    return file?.content || '';
  }, [fileContents, files]);

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
    createFile: createFile.mutate,
    deleteFile: deleteFile.mutate,
    renameFile: renameFile.mutate,
    openFile,
    closeTab,
    setActiveTabId,
    
    // Content management
    getFileContent,
    updateLocalContent,
    saveFile,
    dirtyFiles,
  };
}
