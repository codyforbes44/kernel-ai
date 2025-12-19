-- Builder Projects table (separate from chat projects)
CREATE TABLE public.builder_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  description TEXT,
  framework TEXT DEFAULT 'react',
  template TEXT DEFAULT 'blank',
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Virtual File System table
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'file', -- 'file' or 'folder'
  content TEXT,
  language TEXT,
  is_entry_point BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, path)
);

-- File versions for undo/redo and history
CREATE TABLE public.file_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.project_files(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message TEXT
);

-- Enable RLS
ALTER TABLE public.builder_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for builder_projects
CREATE POLICY "Users can view their own projects" 
ON public.builder_projects FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public projects"
ON public.builder_projects FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can create their own projects" 
ON public.builder_projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.builder_projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.builder_projects FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for project_files
CREATE POLICY "Users can view files in their projects" 
ON public.project_files FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.builder_projects 
    WHERE id = project_files.project_id 
    AND (user_id = auth.uid() OR is_public = true)
  )
);

CREATE POLICY "Users can create files in their projects" 
ON public.project_files FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.builder_projects 
    WHERE id = project_files.project_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update files in their projects" 
ON public.project_files FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.builder_projects 
    WHERE id = project_files.project_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete files in their projects" 
ON public.project_files FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.builder_projects 
    WHERE id = project_files.project_id 
    AND user_id = auth.uid()
  )
);

-- RLS policies for file_versions
CREATE POLICY "Users can view versions of their files" 
ON public.file_versions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.project_files pf
    JOIN public.builder_projects bp ON bp.id = pf.project_id
    WHERE pf.id = file_versions.file_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create versions of their files" 
ON public.file_versions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_files pf
    JOIN public.builder_projects bp ON bp.id = pf.project_id
    WHERE pf.id = file_versions.file_id 
    AND bp.user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX idx_project_files_path ON public.project_files(path);
CREATE INDEX idx_file_versions_file_id ON public.file_versions(file_id);
CREATE INDEX idx_builder_projects_user_id ON public.builder_projects(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_builder_projects_updated_at
BEFORE UPDATE ON public.builder_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_files_updated_at
BEFORE UPDATE ON public.project_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();