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
  branchConversation: (parentConversationId: string, branchPointMessageId: string, title?: string) => Promise<Conversation | null>;
  getChildBranches: (conversationId: string) => Conversation[];
  createProject: (name: string, description?: string) => Promise<Project | null>;
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  loading: boolean;
  isCreatingConversation: boolean;
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
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  
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

  // Realtime subscription for conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newConversation = payload.new as Conversation;
          setConversations((prev) => {
            if (prev.some((c) => c.id === newConversation.id)) return prev;
            return [newConversation, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Conversation;
          setConversations((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedId = (payload.old as Conversation).id;
          setConversations((prev) => prev.filter((c) => c.id !== deletedId));
          if (selectedConversationId === deletedId) {
            setSelectedConversationId(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversationId]);

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
    if (!user || isCreatingConversation) return null;

    setIsCreatingConversation(true);
    try {
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
    } finally {
      setIsCreatingConversation(false);
    }
  }, [user, isCreatingConversation]);

  // Branch a conversation from a specific message
  const branchConversation = useCallback(async (
    parentConversationId: string,
    branchPointMessageId: string,
    title?: string
  ) => {
    if (!user || isCreatingConversation) return null;

    const parentConversation = conversations.find(c => c.id === parentConversationId);
    if (!parentConversation) return null;

    setIsCreatingConversation(true);
    try {
      // Get messages up to and including the branch point
      const { data: messagesToCopy, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', parentConversationId)
        .order('created_at');

      if (msgError) throw msgError;

      // Find the branch point message index
      const branchIndex = messagesToCopy?.findIndex(m => m.id === branchPointMessageId) ?? -1;
      if (branchIndex === -1) {
        console.error('Branch point message not found');
        return null;
      }

      // Create the branched conversation
      const branchTitle = title || `Branch: ${parentConversation.title}`;
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          project_id: parentConversation.project_id,
          user_id: user.id,
          title: branchTitle,
          parent_conversation_id: parentConversationId,
          branch_point_message_id: branchPointMessageId,
          lovable_project_url: parentConversation.lovable_project_url,
          lovable_project_name: parentConversation.lovable_project_name,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Copy messages up to the branch point
      const messagesToInsert = messagesToCopy
        .slice(0, branchIndex + 1)
        .map(m => ({
          conversation_id: newConv.id,
          user_id: user.id,
          role: m.role,
          content: m.content,
          model: m.model,
          metadata: m.metadata,
        }));

      if (messagesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('messages')
          .insert(messagesToInsert);

        if (insertError) throw insertError;
      }

      const newConversation = newConv as Conversation;
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversationId(newConversation.id);
      return newConversation;
    } catch (error) {
      console.error('Error branching conversation:', error);
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  }, [user, isCreatingConversation, conversations]);

  // Get child branches of a conversation
  const getChildBranches = useCallback((conversationId: string) => {
    return conversations.filter(c => c.parent_conversation_id === conversationId);
  }, [conversations]);

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
    branchConversation,
    getChildBranches,
    createProject,
    updateConversation,
    deleteConversation,
    updateProject,
    deleteProject,
    loading,
    isCreatingConversation,
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
