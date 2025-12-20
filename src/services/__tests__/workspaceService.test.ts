import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workspaceService } from '../workspaceService';
import { supabase } from '@/integrations/supabase/client';

describe('workspaceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWorkspaces', () => {
    it('should fetch workspaces for a user', async () => {
      const mockWorkspaces = [
        { id: 'ws-1', name: 'Workspace 1', user_id: 'user-1', is_default: true },
        { id: 'ws-2', name: 'Workspace 2', user_id: 'user-1', is_default: false },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockWorkspaces, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await workspaceService.getWorkspaces('user-1');

      expect(supabase.from).toHaveBeenCalledWith('workspaces');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(result).toEqual(mockWorkspaces);
    });

    it('should throw error when fetch fails', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Failed' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await expect(workspaceService.getWorkspaces('user-1')).rejects.toEqual({ message: 'Failed' });
    });
  });

  describe('getProjects', () => {
    it('should fetch non-archived projects for a user', async () => {
      const mockProjects = [
        { id: 'proj-1', name: 'Project 1', user_id: 'user-1', is_archived: false },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await workspaceService.getProjects('user-1');

      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockChain.eq).toHaveBeenCalledWith('is_archived', false);
      expect(result).toEqual(mockProjects);
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const params = {
        workspaceId: 'ws-1',
        userId: 'user-1',
        name: 'New Project',
        description: 'Description',
      };

      const mockProject = {
        id: 'new-proj-id',
        workspace_id: params.workspaceId,
        user_id: params.userId,
        name: params.name,
        description: params.description,
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await workspaceService.createProject(params);

      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(mockChain.insert).toHaveBeenCalledWith({
        workspace_id: params.workspaceId,
        user_id: params.userId,
        name: params.name,
        description: params.description,
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const updates = { name: 'Updated Name' };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await workspaceService.updateProject('proj-1', updates);

      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(mockChain.update).toHaveBeenCalledWith(updates);
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'proj-1');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await workspaceService.deleteProject('proj-1');

      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'proj-1');
    });
  });

  describe('getConversations', () => {
    it('should fetch non-archived conversations for a user', async () => {
      const mockConversations = [
        { id: 'conv-1', title: 'Conversation 1', user_id: 'user-1', is_archived: false },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockConversations, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await workspaceService.getConversations('user-1');

      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockChain.eq).toHaveBeenCalledWith('is_archived', false);
      expect(mockChain.order).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toEqual(mockConversations);
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const params = {
        projectId: 'proj-1',
        userId: 'user-1',
        title: 'New Conversation',
      };

      const mockConversation = {
        id: 'conv-id',
        project_id: params.projectId,
        user_id: params.userId,
        title: params.title,
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockConversation, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await workspaceService.createConversation(params);

      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(result).toEqual(mockConversation);
    });

    it('should create a branched conversation', async () => {
      const params = {
        projectId: 'proj-1',
        userId: 'user-1',
        title: 'Branched Conversation',
        parentConversationId: 'parent-conv-1',
        branchPointMessageId: 'msg-5',
      };

      const mockConversation = {
        id: 'branch-conv-id',
        project_id: params.projectId,
        user_id: params.userId,
        title: params.title,
        parent_conversation_id: params.parentConversationId,
        branch_point_message_id: params.branchPointMessageId,
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockConversation, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await workspaceService.createConversation(params);

      expect(mockChain.insert).toHaveBeenCalledWith(expect.objectContaining({
        parent_conversation_id: params.parentConversationId,
        branch_point_message_id: params.branchPointMessageId,
      }));
      expect(result).toEqual(mockConversation);
    });
  });

  describe('updateConversation', () => {
    it('should update a conversation', async () => {
      const updates = { title: 'Updated Title', is_pinned: true };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await workspaceService.updateConversation('conv-1', updates);

      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(mockChain.update).toHaveBeenCalledWith(updates);
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'conv-1');
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await workspaceService.deleteConversation('conv-1');

      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'conv-1');
    });
  });

  describe('getConversationMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockMessages = [
        { id: 'msg-1', content: 'Hello', role: 'user', conversation_id: 'conv-1' },
        { id: 'msg-2', content: 'Hi there!', role: 'assistant', conversation_id: 'conv-1' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await workspaceService.getConversationMessages('conv-1');

      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockChain.eq).toHaveBeenCalledWith('conversation_id', 'conv-1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at');
      expect(result).toEqual(mockMessages);
    });
  });

  describe('copyMessagesToConversation', () => {
    it('should copy messages up to branch point', async () => {
      const sourceMessages = [
        { id: 'msg-1', content: 'First', role: 'user', conversation_id: 'src-conv' },
        { id: 'msg-2', content: 'Second', role: 'assistant', conversation_id: 'src-conv' },
        { id: 'msg-3', content: 'Third', role: 'user', conversation_id: 'src-conv' },
      ];

      // Mock getConversationMessages
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: sourceMessages, error: null }),
      };

      // Mock insert
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(selectChain as any)
        .mockReturnValueOnce(insertChain as any);

      const result = await workspaceService.copyMessagesToConversation({
        sourceConversationId: 'src-conv',
        targetConversationId: 'target-conv',
        userId: 'user-1',
        upToMessageId: 'msg-2',
      });

      expect(result).toBe(2); // Should copy first 2 messages
      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ content: 'First', conversation_id: 'target-conv' }),
          expect.objectContaining({ content: 'Second', conversation_id: 'target-conv' }),
        ])
      );
    });

    it('should throw error if branch point not found', async () => {
      const sourceMessages = [
        { id: 'msg-1', content: 'First', role: 'user', conversation_id: 'src-conv' },
      ];

      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: sourceMessages, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(selectChain as any);

      await expect(
        workspaceService.copyMessagesToConversation({
          sourceConversationId: 'src-conv',
          targetConversationId: 'target-conv',
          userId: 'user-1',
          upToMessageId: 'nonexistent-msg',
        })
      ).rejects.toThrow('Branch point message not found');
    });
  });
});
