import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Workspace, Project, Conversation } from '@/types/database';
import { useAuth } from './useAuth';

export function useWorkspace() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch workspaces
      const { data: workspacesData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (workspacesData) {
        setWorkspaces(workspacesData as Workspace[]);
        const defaultWs = workspacesData.find(w => w.is_default) || workspacesData[0];
        if (defaultWs && !selectedWorkspaceId) {
          setSelectedWorkspaceId(defaultWs.id);
        }
      }

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at');

      if (projectsData) {
        setProjects(projectsData as Project[]);
        if (projectsData.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsData[0].id);
        }
      }

      // Fetch conversations
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (conversationsData) {
        setConversations(conversationsData as Conversation[]);
      }

    } catch (error) {
      console.error('Error fetching workspace data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedWorkspaceId, selectedProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create new conversation
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

  // Create new project
  const createProject = useCallback(async (workspaceId: string, name: string, description?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        workspace_id: workspaceId,
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
    return newProject;
  }, [user]);

  // Update conversation
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

  // Delete conversation
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

  // Get conversations for current project
  const projectConversations = conversations.filter(
    c => c.project_id === selectedProjectId
  );

  // Get projects for current workspace
  const workspaceProjects = projects.filter(
    p => p.workspace_id === selectedWorkspaceId
  );

  return {
    workspaces,
    projects,
    conversations,
    workspaceProjects,
    projectConversations,
    selectedWorkspaceId,
    selectedProjectId,
    selectedConversationId,
    setSelectedWorkspaceId,
    setSelectedProjectId,
    setSelectedConversationId,
    createConversation,
    createProject,
    updateConversation,
    deleteConversation,
    loading,
    refresh: fetchData,
  };
}
