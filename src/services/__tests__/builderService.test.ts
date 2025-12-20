import { describe, it, expect, vi, beforeEach } from 'vitest';
import { builderService } from '../builderService';
import { supabase } from '@/integrations/supabase/client';

describe('builderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProject', () => {
    it('should fetch a project by id', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        user_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await builderService.getProject('project-1');

      expect(supabase.from).toHaveBeenCalledWith('builder_projects');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'project-1');
      expect(result).toEqual(mockProject);
    });

    it('should throw error when fetch fails', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await expect(builderService.getProject('invalid-id')).rejects.toEqual({ message: 'Not found' });
    });
  });

  describe('getProjects', () => {
    it('should fetch all projects for a user', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1', user_id: 'user-1' },
        { id: 'project-2', name: 'Project 2', user_id: 'user-1' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await builderService.getProjects('user-1');

      expect(supabase.from).toHaveBeenCalledWith('builder_projects');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getFiles', () => {
    it('should fetch all files for a project', async () => {
      const mockFiles = [
        { id: 'file-1', name: 'index.tsx', path: '/index.tsx', project_id: 'project-1' },
        { id: 'file-2', name: 'App.tsx', path: '/App.tsx', project_id: 'project-1' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFiles, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await builderService.getFiles('project-1');

      expect(supabase.from).toHaveBeenCalledWith('project_files');
      expect(mockChain.eq).toHaveBeenCalledWith('project_id', 'project-1');
      expect(result).toEqual(mockFiles);
    });
  });

  describe('createProject', () => {
    it('should create a new project with template files', async () => {
      const params = {
        userId: 'user-1',
        name: 'New Project',
        templateId: 'blank',
      };

      const mockProject = {
        id: 'new-project-id',
        user_id: params.userId,
        name: params.name,
        template: params.templateId,
      };

      // First call creates project
      const projectChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
      };

      // Second call creates template files
      const filesChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(projectChain as any)
        .mockReturnValueOnce(filesChain as any);

      const result = await builderService.createProject(params);

      expect(supabase.from).toHaveBeenCalledWith('builder_projects');
      expect(projectChain.insert).toHaveBeenCalledWith({
        user_id: params.userId,
        name: params.name,
        template: params.templateId,
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('createFile', () => {
    it('should create a new file', async () => {
      const params = {
        projectId: 'project-1',
        name: 'Component.tsx',
        path: '/components/Component.tsx',
        content: 'export const Component = () => <div>Hello</div>;',
        type: 'file' as const,
      };

      const mockFile = {
        id: 'file-id',
        project_id: params.projectId,
        name: params.name,
        path: params.path,
        content: params.content,
        type: params.type,
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFile, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await builderService.createFile(params);

      expect(supabase.from).toHaveBeenCalledWith('project_files');
      expect(mockChain.insert).toHaveBeenCalled();
      expect(result).toEqual(mockFile);
    });

    it('should create a folder without content', async () => {
      const params = {
        projectId: 'project-1',
        name: 'components',
        path: '/components',
        type: 'folder' as const,
      };

      const mockFolder = {
        id: 'folder-id',
        project_id: params.projectId,
        name: params.name,
        path: params.path,
        type: params.type,
        content: null,
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFolder, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await builderService.createFile(params);

      expect(mockChain.insert).toHaveBeenCalledWith(expect.objectContaining({
        content: null,
        language: null,
      }));
      expect(result).toEqual(mockFolder);
    });
  });

  describe('updateFileContent', () => {
    it('should update file content', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await builderService.updateFileContent('file-1', 'Updated content');

      expect(supabase.from).toHaveBeenCalledWith('project_files');
      expect(mockChain.update).toHaveBeenCalledWith({ content: 'Updated content' });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'file-1');
    });
  });

  describe('renameFile', () => {
    it('should rename a file and update path', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await builderService.renameFile('file-1', 'NewName.tsx', '/components/NewName.tsx');

      expect(supabase.from).toHaveBeenCalledWith('project_files');
      expect(mockChain.update).toHaveBeenCalledWith({
        name: 'NewName.tsx',
        path: '/components/NewName.tsx',
        language: 'typescript',
      });
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await builderService.deleteFile('file-1');

      expect(supabase.from).toHaveBeenCalledWith('project_files');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'file-1');
    });
  });

  describe('applyAIOperations', () => {
    it('should create new files for create operations', async () => {
      const mockFiles: any[] = [];
      const operations = [
        { type: 'create' as const, path: '/new-file.tsx', content: 'new content' },
      ];

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'new-file-id' }, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await builderService.applyAIOperations({
        projectId: 'project-1',
        files: mockFiles,
        operations,
      });

      expect(mockChain.insert).toHaveBeenCalled();
    });

    it('should update existing files for update operations', async () => {
      const mockFiles = [
        { id: 'file-1', path: '/existing.tsx', content: 'old content' },
      ] as any[];
      const operations = [
        { type: 'update' as const, path: '/existing.tsx', content: 'updated content' },
      ];

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await builderService.applyAIOperations({
        projectId: 'project-1',
        files: mockFiles,
        operations,
      });

      expect(mockChain.update).toHaveBeenCalledWith({ content: 'updated content' });
    });

    it('should delete files for delete operations', async () => {
      const mockFiles = [
        { id: 'file-1', path: '/to-delete.tsx', content: 'content' },
      ] as any[];
      const operations = [
        { type: 'delete' as const, path: '/to-delete.tsx' },
      ];

      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await builderService.applyAIOperations({
        projectId: 'project-1',
        files: mockFiles,
        operations,
      });

      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'file-1');
    });
  });
});
