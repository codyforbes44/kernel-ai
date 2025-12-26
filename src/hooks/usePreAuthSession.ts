import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

const SESSION_STORAGE_KEY = 'kernel-voice-session-id';

export interface ConversationEntry {
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface ProjectRequirements {
  projectName?: string;
  projectDescription?: string;
  features?: string[];
  techStack?: string[];
  targetAudience?: string;
  additionalNotes?: string;
}

export interface PendingProject {
  id: string;
  sessionId: string;
  projectName: string | null;
  projectDescription: string | null;
  conversationTranscript: ConversationEntry[];
  projectRequirements: ProjectRequirements;
  claimedBy: string | null;
  claimedAt: string | null;
  createdAt: string;
  expiresAt: string;
}

function generateSessionId(): string {
  return `voice-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function parseConversationTranscript(data: Json | null): ConversationEntry[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as ConversationEntry[];
}

function parseProjectRequirements(data: Json | null): ProjectRequirements {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  return data as unknown as ProjectRequirements;
}

export function usePreAuthSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingProject, setPendingProject] = useState<PendingProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize or retrieve session ID from localStorage
  useEffect(() => {
    const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Try to load existing pending project
      loadPendingProject(storedSessionId);
    } else {
      const newSessionId = generateSessionId();
      localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      setSessionId(newSessionId);
      setIsLoading(false);
    }
  }, []);

  const loadPendingProject = async (sid: string) => {
    try {
      const { data, error } = await supabase
        .from('pending_voice_projects')
        .select('*')
        .eq('session_id', sid)
        .maybeSingle();

      if (error) {
        console.error('Error loading pending project:', error);
      } else if (data) {
        setPendingProject({
          id: data.id,
          sessionId: data.session_id,
          projectName: data.project_name,
          projectDescription: data.project_description,
          conversationTranscript: parseConversationTranscript(data.conversation_transcript),
          projectRequirements: parseProjectRequirements(data.project_requirements),
          claimedBy: data.claimed_by,
          claimedAt: data.claimed_at,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
        });
      }
    } catch (err) {
      console.error('Failed to load pending project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update the pending project in the database
  const savePendingProject = useCallback(async (
    updates: Partial<{
      projectName: string;
      projectDescription: string;
      conversationTranscript: ConversationEntry[];
      projectRequirements: ProjectRequirements;
    }>
  ) => {
    if (!sessionId) return null;

    setIsSyncing(true);
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('pending_voice_projects')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();

      const transcriptData = updates.conversationTranscript ?? pendingProject?.conversationTranscript ?? [];
      const requirementsData = updates.projectRequirements ?? pendingProject?.projectRequirements ?? {};

      let result;
      if (existing) {
        // Update existing record
        result = await supabase
          .from('pending_voice_projects')
          .update({
            project_name: updates.projectName ?? pendingProject?.projectName ?? null,
            project_description: updates.projectDescription ?? pendingProject?.projectDescription ?? null,
            conversation_transcript: transcriptData as unknown as Json,
            project_requirements: requirementsData as unknown as Json,
          })
          .eq('session_id', sessionId)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('pending_voice_projects')
          .insert({
            session_id: sessionId,
            project_name: updates.projectName ?? pendingProject?.projectName ?? null,
            project_description: updates.projectDescription ?? pendingProject?.projectDescription ?? null,
            conversation_transcript: transcriptData as unknown as Json,
            project_requirements: requirementsData as unknown as Json,
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving pending project:', result.error);
        return null;
      }

      const data = result.data;
      const updated: PendingProject = {
        id: data.id,
        sessionId: data.session_id,
        projectName: data.project_name,
        projectDescription: data.project_description,
        conversationTranscript: parseConversationTranscript(data.conversation_transcript),
        projectRequirements: parseProjectRequirements(data.project_requirements),
        claimedBy: data.claimed_by,
        claimedAt: data.claimed_at,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
      };
      setPendingProject(updated);
      return updated;
    } catch (err) {
      console.error('Failed to save pending project:', err);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [sessionId, pendingProject]);

  // Add a conversation entry
  const addTranscriptEntry = useCallback(async (entry: ConversationEntry) => {
    const currentTranscript = pendingProject?.conversationTranscript || [];
    const newTranscript = [...currentTranscript, entry];
    return savePendingProject({ conversationTranscript: newTranscript });
  }, [pendingProject, savePendingProject]);

  // Capture project requirements from voice agent
  const captureProjectIdea = useCallback(async (
    projectName: string,
    projectDescription: string,
    requirements: ProjectRequirements
  ) => {
    return savePendingProject({
      projectName,
      projectDescription,
      projectRequirements: {
        ...pendingProject?.projectRequirements,
        ...requirements,
        projectName,
        projectDescription,
      },
    });
  }, [pendingProject, savePendingProject]);

  // Claim the session after user signs up
  const claimSession = useCallback(async (userId: string): Promise<PendingProject | null> => {
    if (!sessionId) return null;

    try {
      // Use the database function to claim the project
      const { data, error } = await supabase.rpc('claim_pending_voice_project', {
        p_session_id: sessionId,
        p_user_id: userId,
      });

      if (error) {
        console.error('Error claiming session:', error);
        return null;
      }

      if (!data) {
        console.log('No pending project to claim or already claimed');
        return null;
      }

      // Fetch the claimed project
      const { data: claimedProject, error: fetchError } = await supabase
        .from('pending_voice_projects')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError || !claimedProject) {
        console.error('Error fetching claimed project:', fetchError);
        return null;
      }

      const claimed: PendingProject = {
        id: claimedProject.id,
        sessionId: claimedProject.session_id,
        projectName: claimedProject.project_name,
        projectDescription: claimedProject.project_description,
        conversationTranscript: parseConversationTranscript(claimedProject.conversation_transcript),
        projectRequirements: parseProjectRequirements(claimedProject.project_requirements),
        claimedBy: claimedProject.claimed_by,
        claimedAt: claimedProject.claimed_at,
        createdAt: claimedProject.created_at,
        expiresAt: claimedProject.expires_at,
      };

      setPendingProject(claimed);
      return claimed;
    } catch (err) {
      console.error('Failed to claim session:', err);
      return null;
    }
  }, [sessionId]);

  // Clear the session after project creation
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionId(null);
    setPendingProject(null);
  }, []);

  // Check if there's a valid pending project
  const hasPendingProject = Boolean(
    pendingProject &&
    !pendingProject.claimedBy &&
    pendingProject.projectName &&
    new Date(pendingProject.expiresAt) > new Date()
  );

  return {
    sessionId,
    pendingProject,
    isLoading,
    isSyncing,
    hasPendingProject,
    savePendingProject,
    addTranscriptEntry,
    captureProjectIdea,
    claimSession,
    clearSession,
  };
}
