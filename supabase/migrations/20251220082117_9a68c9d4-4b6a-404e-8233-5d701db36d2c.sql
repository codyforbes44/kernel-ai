-- Store GitHub OAuth connections
CREATE TABLE public.github_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  github_user_id TEXT NOT NULL,
  github_username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  avatar_url TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for github_connections
CREATE POLICY "Users can view own GitHub connection"
ON public.github_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own GitHub connection"
ON public.github_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GitHub connection"
ON public.github_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GitHub connection"
ON public.github_connections FOR DELETE
USING (auth.uid() = user_id);

-- Link projects to GitHub repositories
CREATE TABLE public.project_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.builder_projects(id) ON DELETE CASCADE NOT NULL,
  github_connection_id UUID REFERENCES public.github_connections(id) ON DELETE CASCADE NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  repo_full_name TEXT GENERATED ALWAYS AS (repo_owner || '/' || repo_name) STORED,
  default_branch TEXT DEFAULT 'main',
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle',
  last_commit_sha TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable RLS
ALTER TABLE public.project_repos ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_repos
CREATE POLICY "Users can view own project repos"
ON public.project_repos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.builder_projects 
  WHERE id = project_repos.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create repos for own projects"
ON public.project_repos FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.builder_projects 
  WHERE id = project_repos.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update own project repos"
ON public.project_repos FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.builder_projects 
  WHERE id = project_repos.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete own project repos"
ON public.project_repos FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.builder_projects 
  WHERE id = project_repos.project_id AND user_id = auth.uid()
));

-- Track individual commits
CREATE TABLE public.github_commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_repo_id UUID REFERENCES public.project_repos(id) ON DELETE CASCADE NOT NULL,
  commit_sha TEXT NOT NULL,
  commit_message TEXT,
  author_name TEXT,
  author_email TEXT,
  committed_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT now(),
  direction TEXT NOT NULL CHECK (direction IN ('push', 'pull')),
  files_changed INTEGER DEFAULT 0,
  UNIQUE(project_repo_id, commit_sha)
);

-- Enable RLS
ALTER TABLE public.github_commits ENABLE ROW LEVEL SECURITY;

-- RLS policies for github_commits
CREATE POLICY "Users can view commits for own repos"
ON public.github_commits FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.project_repos pr
  JOIN public.builder_projects bp ON bp.id = pr.project_id
  WHERE pr.id = github_commits.project_repo_id AND bp.user_id = auth.uid()
));

CREATE POLICY "Users can create commits for own repos"
ON public.github_commits FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.project_repos pr
  JOIN public.builder_projects bp ON bp.id = pr.project_id
  WHERE pr.id = github_commits.project_repo_id AND bp.user_id = auth.uid()
));

-- Create trigger for updated_at on github_connections
CREATE TRIGGER update_github_connections_updated_at
  BEFORE UPDATE ON public.github_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();