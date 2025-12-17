import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Workspace, Project, Conversation } from '@/types/database';
import { useAuth } from './useAuth';

interface WorkspaceContextType {
  workspaces: Workspace[];
  projects: Project[];
  conversations: Conversation[];
  workspaceProjects: Project[];
  projectConversations: Conversation[];
  currentWorkspace: Workspace | null;
  currentProject: Project | null;
  currentConversation: Conversation | null;
  selectedWorkspaceId: string | null;
  selectedProjectId: string | null;
  selectedConversationId: string | null;
  setSelectedWorkspaceId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedConversationId: (id: string | null) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentProject: (project: Project | null) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  createConversation: (projectId: string, title?: string) => Promise<Conversation | null>;
  createProject: (name: string, description?: string) => Promise<Project | null>;
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const initializedRef = useRef(false);

  const currentWorkspace = useMemo(
    () => workspaces.find(w => w.id === selectedWorkspaceId) || null,
    [workspaces, selectedWorkspaceId]
  );

  const currentProject = useMemo(
    () => projects.find(p => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const currentConversation = useMemo(
    () => conversations.find(c => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [workspacesResult, projectsResult, conversationsResult] = await Promise.all([
        supabase
          .from('workspaces')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at'),
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('created_at'),
        supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('updated_at', { ascending: false })
      ]);

      const workspacesData = workspacesResult.data;
      const projectsData = projectsResult.data;
      const conversationsData = conversationsResult.data;

      if (workspacesData) {
        setWorkspaces(workspacesData as Workspace[]);
      }
      if (projectsData) {
        setProjects(projectsData as Project[]);
      }
      if (conversationsData) {
        setConversations(conversationsData as Conversation[]);
      }

      if (!initializedRef.current) {
        if (workspacesData && workspacesData.length > 0) {
          const defaultWs = workspacesData.find(w => w.is_default) || workspacesData[0];
          setSelectedWorkspaceId(defaultWs.id);
        }
        if (projectsData && projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id);
        }
        initializedRef.current = true;
      }

    } catch (error) {
      console.error('Error fetching workspace data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      // Reset state when user logs out
      setWorkspaces([]);
      setProjects([]);
      setConversations([]);
      setSelectedWorkspaceId(null);
      setSelectedProjectId(null);
      setSelectedConversationId(null);
      initializedRef.current = false;
    }
  }, [user, fetchData]);

  const setCurrentWorkspace = useCallback((workspace: Workspace | null) => {
    setSelectedWorkspaceId(workspace?.id || null);
  }, []);

  const setCurrentProject = useCallback((project: Project | null) => {
    setSelectedProjectId(project?.id || null);
  }, []);

  const setCurrentConversation = useCallback((conversation: Conversation | null) => {
    setSelectedConversationId(conversation?.id || null);
  }, []);

  const createConversation = useCallback(async (projectId: string, title = 'New Conversation') => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        project_id: projectId,
        user_id: user.id,
        title,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    const newConversation = data as Conversation;
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversationId(newConversation.id);
    return newConversation;
  }, [user]);

  const createProject = useCallback(async (name: string, description?: string) => {
    if (!user || !selectedWorkspaceId) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        workspace_id: selectedWorkspaceId,
        user_id: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }

    const newProject = data as Project;
    setProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
    return newProject;
  }, [user, selectedWorkspaceId]);

  const updateConversation = useCallback(async (id: string, updates: Partial<Conversation>) => {
    const { error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setConversations(prev => 
        prev.map(c => c.id === id ? { ...c, ...updates } : c)
      );
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (!error) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
      }
    }
  }, [selectedConversationId]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setProjects(prev => 
        prev.map(p => p.id === id ? { ...p, ...updates } : p)
      );
    }
    return !error;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id));
      setConversations(prev => prev.filter(c => c.project_id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    }
    return !error;
  }, [selectedProjectId]);

  const projectConversations = conversations.filter(
    c => c.project_id === selectedProjectId
  );

  const workspaceProjects = projects.filter(
    p => p.workspace_id === selectedWorkspaceId
  );

  const value: WorkspaceContextType = {
    workspaces,
    projects,
    conversations,
    workspaceProjects,
    projectConversations,
    currentWorkspace,
    currentProject,
    currentConversation,
    selectedWorkspaceId,
    selectedProjectId,
    selectedConversationId,
    setSelectedWorkspaceId,
    setSelectedProjectId,
    setSelectedConversationId,
    setCurrentWorkspace,
    setCurrentProject,
    setCurrentConversation,
    createConversation,
    createProject,
    updateConversation,
    deleteConversation,
    updateProject,
    deleteProject,
    loading,
    refresh: fetchData,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
