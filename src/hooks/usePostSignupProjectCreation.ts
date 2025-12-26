import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PendingProject } from './usePreAuthSession';
import type { Json } from '@/integrations/supabase/types';

interface CreatedProject {
  id: string;
  name: string;
  description: string | null;
  conversationId: string;
}

export function usePostSignupProjectCreation() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [createdProject, setCreatedProject] = useState<CreatedProject | null>(null);

  const createProjectFromPending = useCallback(async (
    userId: string,
    pendingProject: PendingProject
  ): Promise<CreatedProject | null> => {
    if (!pendingProject.projectName) {
      console.error('No project name in pending project');
      return null;
    }

    setIsCreating(true);

    try {
      // 1. Create the builder project
      const settingsData: Json = {
        source: 'voice_onboarding',
        requirements: pendingProject.projectRequirements as unknown as Json,
      };

      const { data: project, error: projectError } = await supabase
        .from('builder_projects')
        .insert({
          user_id: userId,
          name: pendingProject.projectName,
          description: pendingProject.projectDescription,
          framework: 'react',
          template: 'blank',
          settings: settingsData,
        })
        .select()
        .single();

      if (projectError || !project) {
        console.error('Error creating project:', projectError);
        toast.error('Failed to create project');
        return null;
      }

      // 2. Create an initial conversation with context from voice session
      const initialPrompt = buildInitialPrompt(pendingProject);
      
      const { data: conversation, error: convError } = await supabase
        .from('builder_conversations')
        .insert({
          project_id: project.id,
          user_id: userId,
          title: `Building: ${pendingProject.projectName}`,
          is_active: true,
        })
        .select()
        .single();

      if (convError || !conversation) {
        console.error('Error creating conversation:', convError);
        // Project was created, but conversation failed - still continue
      }

      // 3. Add the initial message from the voice context
      if (conversation) {
        await supabase.from('builder_messages').insert({
          conversation_id: conversation.id,
          role: 'user',
          content: initialPrompt,
        });
      }

      // 4. Trigger the agent-ai to start building
      const agentResult = await triggerAgentAI(
        project.id,
        userId,
        initialPrompt,
        pendingProject
      );

      if (!agentResult.success) {
        console.warn('Agent AI trigger failed, but project was created:', agentResult.error);
        // Don't fail the whole flow - the user can still use the project
      }

      // 5. Clean up - delete the pending project
      await supabase
        .from('pending_voice_projects')
        .delete()
        .eq('id', pendingProject.id);

      const created: CreatedProject = {
        id: project.id,
        name: project.name,
        description: project.description,
        conversationId: conversation?.id || '',
      };

      setCreatedProject(created);
      
      toast.success(`Project "${project.name}" created! Starting development...`);
      
      return created;
    } catch (err) {
      console.error('Failed to create project from pending:', err);
      toast.error('Failed to create your project');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const navigateToProject = useCallback((projectId: string) => {
    navigate(`/builder/${projectId}`);
  }, [navigate]);

  return {
    isCreating,
    createdProject,
    createProjectFromPending,
    navigateToProject,
  };
}

function buildInitialPrompt(pending: PendingProject): string {
  const req = pending.projectRequirements;
  
  let prompt = `Create a new project called "${pending.projectName}".\n\n`;
  
  if (pending.projectDescription) {
    prompt += `## Description\n${pending.projectDescription}\n\n`;
  }

  if (req.features && req.features.length > 0) {
    prompt += `## Required Features\n`;
    req.features.forEach(f => {
      prompt += `- ${f}\n`;
    });
    prompt += '\n';
  }

  if (req.techStack && req.techStack.length > 0) {
    prompt += `## Preferred Technologies\n`;
    req.techStack.forEach(t => {
      prompt += `- ${t}\n`;
    });
    prompt += '\n';
  }

  if (req.targetAudience) {
    prompt += `## Target Audience\n${req.targetAudience}\n\n`;
  }

  if (req.additionalNotes) {
    prompt += `## Additional Notes\n${req.additionalNotes}\n\n`;
  }

  // Include summary of voice conversation for context
  if (pending.conversationTranscript.length > 0) {
    prompt += `## Voice Conversation Context\n`;
    prompt += `The user discussed this project via voice. Key points from the conversation:\n`;
    
    // Get last few exchanges for context
    const recentEntries = pending.conversationTranscript.slice(-6);
    recentEntries.forEach(entry => {
      const speaker = entry.role === 'user' ? 'User' : 'Assistant';
      prompt += `- ${speaker}: "${entry.text.substring(0, 200)}${entry.text.length > 200 ? '...' : ''}"\n`;
    });
    prompt += '\n';
  }

  prompt += `Please create the initial structure and key components for this project.`;

  return prompt;
}

async function triggerAgentAI(
  projectId: string,
  userId: string,
  initialPrompt: string,
  pendingProject: PendingProject
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.functions.invoke('agent-ai', {
      body: {
        projectId,
        userId,
        request: initialPrompt,
        context: {
          source: 'voice_onboarding',
          requirements: pendingProject.projectRequirements,
          conversationSummary: pendingProject.conversationTranscript
            .slice(-10)
            .map(e => `${e.role}: ${e.text}`)
            .join('\n'),
        },
      },
    });

    if (error) {
      console.error('Agent AI error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to trigger agent AI:', err);
    return { success: false, error: errorMessage };
  }
}
