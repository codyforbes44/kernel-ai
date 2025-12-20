import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Workspace, Project, Conversation } from '@/types/database';
import { useAuth } from './useAuth';
import { workspaceService } from '@/services/workspaceService';
import { toast } from 'sonner';

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
  const branchingRef = useRef(false);

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
      const [workspacesData, projectsData, conversationsData] = await Promise.all([
        workspaceService.getWorkspaces(user.id),
        workspaceService.getProjects(user.id),
        workspaceService.getConversations(user.id),
      ]);

      setWorkspaces(workspacesData);
      setProjects(projectsData);
      setConversations(conversationsData);

      if (!initializedRef.current) {
        if (workspacesData.length > 0) {
          const defaultWs = workspacesData.find(w => w.is_default) || workspacesData[0];
          setSelectedWorkspaceId(defaultWs.id);
        }
        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id);
        }
        initializedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching workspace data:', error);
      toast.error('Failed to load workspace data');
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

  // Realtime subscription for conversations with error handling
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
      .subscribe((status, err) => {
        if (err) {
          console.error('Realtime subscription error:', err);
        }
      });

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
    
    // Check if this is the user's first conversation
    const isFirstConversation = conversations.length === 0;
    
    // Create optimistic conversation with temporary ID
    const optimisticId = `temp-${Date.now()}`;
    const optimisticConversation: Conversation = {
      id: optimisticId,
      project_id: projectId,
      user_id: user.id,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_archived: false,
      is_pinned: false,
      message_count: 0,
      token_count: 0,
      last_message_at: null,
      parent_conversation_id: null,
      branch_point_message_id: null,
      lovable_project_url: null,
      lovable_project_name: null,
      summary: null,
      tags: null,
    };

    // Optimistically add to state and select it
    setConversations(prev => [optimisticConversation, ...prev]);
    setSelectedConversationId(optimisticId);

    try {
      const newConversation = await workspaceService.createConversation({
        projectId,
        userId: user.id,
        title,
      });

      // Replace optimistic conversation with real one
      setConversations(prev => 
        prev.map(c => c.id === optimisticId ? newConversation : c)
      );
      setSelectedConversationId(newConversation.id);

      // Add welcome message for first-time users
      if (isFirstConversation) {
        const welcomeMessage = `👋 **Welcome to your first conversation!**

I'm here to help you build amazing things. Here are some tips to get started:

• **Use templates** — Type \`/\` to see available prompt templates
• **Keyboard shortcuts** — Press \`⌘K\` (or \`Ctrl+K\`) to open the command palette
• **Link a project** — Connect your Lovable project for contextual assistance
• **Try the Builder** — Create and preview code in real-time

What would you like to build today?`;

        await supabase.from('messages').insert({
          conversation_id: newConversation.id,
          user_id: user.id,
          role: 'assistant',
          content: welcomeMessage,
        });
      }

      return newConversation;
    } catch (error) {
      // Rollback optimistic update on error
      setConversations(prev => prev.filter(c => c.id !== optimisticId));
      setSelectedConversationId(null);
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  }, [user, isCreatingConversation, conversations.length]);

  // Branch a conversation from a specific message with debouncing
  const branchConversation = useCallback(async (
    parentConversationId: string,
    branchPointMessageId: string,
    title?: string
  ) => {
    if (!user || isCreatingConversation || branchingRef.current) return null;

    const parentConversation = conversations.find(c => c.id === parentConversationId);
    if (!parentConversation) return null;

    branchingRef.current = true;
    setIsCreatingConversation(true);
    
    try {
      // Get messages up to and including the branch point
      const messagesToCopy = await workspaceService.getConversationMessages(parentConversationId);

      // Find the branch point message index
      const branchIndex = messagesToCopy.findIndex(m => m.id === branchPointMessageId);
      if (branchIndex === -1) {
        console.error('Branch point message not found');
        toast.error('Could not find branch point');
        return null;
      }

      // Create the branched conversation
      const branchTitle = title || `Branch: ${parentConversation.title}`;
      const newConversation = await workspaceService.createConversation({
        projectId: parentConversation.project_id,
        userId: user.id,
        title: branchTitle,
        parentConversationId,
        branchPointMessageId,
        lovableProjectUrl: parentConversation.lovable_project_url,
        lovableProjectName: parentConversation.lovable_project_name,
      });

      // Copy messages up to the branch point
      await workspaceService.copyMessagesToConversation({
        sourceConversationId: parentConversationId,
        targetConversationId: newConversation.id,
        userId: user.id,
        upToMessageId: branchPointMessageId,
      });

      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversationId(newConversation.id);
      toast.success('Branch created');
      return newConversation;
    } catch (error) {
      console.error('Error branching conversation:', error);
      toast.error('Failed to create branch');
      return null;
    } finally {
      setIsCreatingConversation(false);
      // Debounce: prevent rapid branching
      setTimeout(() => {
        branchingRef.current = false;
      }, 1000);
    }
  }, [user, isCreatingConversation, conversations]);

  // Get child branches of a conversation
  const getChildBranches = useCallback((conversationId: string) => {
    return conversations.filter(c => c.parent_conversation_id === conversationId);
  }, [conversations]);

  const createProject = useCallback(async (name: string, description?: string) => {
    if (!user || !selectedWorkspaceId) return null;

    try {
      const newProject = await workspaceService.createProject({
        workspaceId: selectedWorkspaceId,
        userId: user.id,
        name,
        description,
      });

      setProjects(prev => [...prev, newProject]);
      setSelectedProjectId(newProject.id);
      toast.success('Project created');
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    }
  }, [user, selectedWorkspaceId]);

  const updateConversation = useCallback(async (id: string, updates: Partial<Conversation>) => {
    try {
      await workspaceService.updateConversation(id, updates);
      setConversations(prev => 
        prev.map(c => c.id === id ? { ...c, ...updates } : c)
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
      toast.error('Failed to update conversation');
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await workspaceService.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  }, [selectedConversationId]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      await workspaceService.updateProject(id, updates);
      setProjects(prev => 
        prev.map(p => p.id === id ? { ...p, ...updates } : p)
      );
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      return false;
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await workspaceService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setConversations(prev => prev.filter(c => c.project_id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
      toast.success('Project deleted');
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      return false;
    }
  }, [selectedProjectId]);

  const projectConversations = useMemo(() => 
    conversations.filter(c => c.project_id === selectedProjectId),
    [conversations, selectedProjectId]
  );

  const workspaceProjects = useMemo(() => 
    projects.filter(p => p.workspace_id === selectedWorkspaceId),
    [projects, selectedWorkspaceId]
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
