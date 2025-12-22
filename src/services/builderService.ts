import { supabase } from '@/integrations/supabase/client';
import type { BuilderProject, ProjectFile } from '@/types/builder';
import { getLanguageFromPath } from '@/types/builder';
import { PROJECT_TEMPLATES, TemplateFile } from '@/lib/projectTemplates';

export const builderService = {
  // Projects
  async getProject(projectId: string) {
    const { data, error } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) throw error;
    return data as BuilderProject;
  },

  async updateProject(
    projectId: string, 
    updates: Partial<Pick<BuilderProject, 'name' | 'description' | 'is_public' | 'template' | 'framework'>>
  ): Promise<BuilderProject> {
    const { data, error } = await supabase
      .from('builder_projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    return data as BuilderProject;
  },

  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as BuilderProject[];
  },

  async getPublicProjects(params?: {
    search?: string;
    template?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('builder_projects')
      .select('*', { count: 'exact' })
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    if (params?.template && params.template !== 'all') {
      query = query.eq('template', params.template);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 12) - 1);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    return { projects: data as BuilderProject[], totalCount: count || 0 };
  },

  async deleteProject(projectId: string) {
    // First delete all project files
    const { error: filesError } = await supabase
      .from('project_files')
      .delete()
      .eq('project_id', projectId);
    
    if (filesError) throw filesError;

    // Then delete the project
    const { error } = await supabase
      .from('builder_projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
  },

  async createProject(params: { 
    userId: string; 
    name: string; 
    templateId?: string;
  }) {
    const template = PROJECT_TEMPLATES.find(t => t.id === params.templateId) || PROJECT_TEMPLATES[0];

    const { data: newProject, error: projectError } = await supabase
      .from('builder_projects')
      .insert({
        user_id: params.userId,
        name: params.name,
        template: params.templateId || 'blank',
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create template files
    const filesToInsert = template.files.map((file: TemplateFile) => ({
      project_id: newProject.id,
      path: file.path,
      name: file.name,
      type: file.type,
      language: file.language,
      is_entry_point: file.is_entry_point,
      content: file.content,
    }));

    const { error: filesError } = await supabase
      .from('project_files')
      .insert(filesToInsert);

    if (filesError) throw filesError;

    return newProject as BuilderProject;
  },

  async createProjectFromFiles(params: {
    userId: string;
    name: string;
    files: Array<{
      path: string;
      name: string;
      content: string;
      type: 'file' | 'folder';
    }>;
  }) {
    const { data: newProject, error: projectError } = await supabase
      .from('builder_projects')
      .insert({
        user_id: params.userId,
        name: params.name,
        template: 'imported',
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create imported files
    const filesToInsert = params.files.map((file) => ({
      project_id: newProject.id,
      path: file.path,
      name: file.name,
      type: file.type,
      language: file.type === 'file' ? getLanguageFromPath(file.path) : null,
      is_entry_point: file.name === 'App.tsx' || file.name === 'main.tsx',
      content: file.content,
    }));

    // Insert files in batches to avoid hitting limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < filesToInsert.length; i += BATCH_SIZE) {
      const batch = filesToInsert.slice(i, i + BATCH_SIZE);
      const { error: filesError } = await supabase
        .from('project_files')
        .insert(batch);

      if (filesError) throw filesError;
    }

    return newProject as BuilderProject;
  },

  // Files
  async getFiles(projectId: string) {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('path');
    
    if (error) throw error;
    return data as ProjectFile[];
  },

  async createFile(params: {
    projectId: string;
    path: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
  }) {
    const { data, error } = await supabase
      .from('project_files')
      .insert({
        project_id: params.projectId,
        path: params.path,
        name: params.name,
        type: params.type,
        content: params.type === 'file' ? (params.content || '') : null,
        language: params.type === 'file' ? getLanguageFromPath(params.path) : null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ProjectFile;
  },

  async updateFileContent(fileId: string, content: string) {
    const { error } = await supabase
      .from('project_files')
      .update({ content })
      .eq('id', fileId);

    if (error) throw error;
  },

  async renameFile(fileId: string, newName: string, newPath: string) {
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

  async deleteFile(fileId: string) {
    const { error } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  },

  // AI Operations
  async applyAIOperations(params: {
    projectId: string;
    files: ProjectFile[];
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      path: string;
      content?: string;
    }>;
    onVersionCreate?: (fileId: string, content: string, message: string) => Promise<void>;
  }) {
    for (const op of params.operations) {
      const fileName = op.path.split('/').pop() || op.path;

      if (op.type === 'create') {
        const existing = params.files.find(f => f.path === op.path);
        if (existing) {
          // Save current version before updating
          if (existing.content && params.onVersionCreate) {
            await params.onVersionCreate(existing.id, existing.content, 'Before AI update');
          }
          await this.updateFileContent(existing.id, op.content || '');
        } else {
          await this.createFile({
            projectId: params.projectId,
            path: op.path,
            name: fileName,
            type: 'file',
            content: op.content,
          });
        }
      } else if (op.type === 'update') {
        const file = params.files.find(f => f.path === op.path);
        if (file) {
          if (file.content && params.onVersionCreate) {
            await params.onVersionCreate(file.id, file.content, 'Before AI update');
          }
          await this.updateFileContent(file.id, op.content || '');
        } else {
          await this.createFile({
            projectId: params.projectId,
            path: op.path,
            name: fileName,
            type: 'file',
            content: op.content,
          });
        }
      } else if (op.type === 'delete') {
        const file = params.files.find(f => f.path === op.path);
        if (file) {
          await this.deleteFile(file.id);
        }
      }
    }
  },

  // Remix/Fork a project
  async remixProject(params: {
    sourceProjectId: string;
    userId: string;
    newName: string;
    includeKnowledgeBase?: boolean;
  }) {
    // Fetch source project
    const { data: sourceProject, error: projectError } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('id', params.sourceProjectId)
      .single();

    if (projectError) throw projectError;

    // Verify user can access (owns it or it's public)
    if (sourceProject.user_id !== params.userId && !sourceProject.is_public) {
      throw new Error('Cannot remix this project - not accessible');
    }

    // Create new project with cloned settings
    const settings = params.includeKnowledgeBase 
      ? sourceProject.settings 
      : { ...(sourceProject.settings as Record<string, unknown> || {}), knowledgeBase: undefined };

    const { data: newProject, error: createError } = await supabase
      .from('builder_projects')
      .insert({
        user_id: params.userId,
        name: params.newName,
        description: sourceProject.description 
          ? `Remixed from: ${sourceProject.name}` 
          : `Remixed from: ${sourceProject.name}`,
        template: sourceProject.template,
        framework: sourceProject.framework,
        settings,
        is_public: false,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Fetch source project files
    const { data: sourceFiles, error: filesError } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', params.sourceProjectId);

    if (filesError) throw filesError;

    // Clone files to new project
    if (sourceFiles && sourceFiles.length > 0) {
      const filesToInsert = sourceFiles.map(file => ({
        project_id: newProject.id,
        path: file.path,
        name: file.name,
        type: file.type,
        content: file.content,
        language: file.language,
        is_entry_point: file.is_entry_point,
        metadata: file.metadata,
      }));

      const { error: insertError } = await supabase
        .from('project_files')
        .insert(filesToInsert);

      if (insertError) throw insertError;
    }

    return {
      project: newProject as BuilderProject,
      fileCount: sourceFiles?.length || 0,
    };
  },
};
