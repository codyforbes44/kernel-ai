-- Create deployments table for tracking project deployments
CREATE TABLE public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deployed', 'failed')),
  environment TEXT NOT NULL DEFAULT 'preview' CHECK (environment IN ('preview', 'production')),
  
  -- Build info
  build_log TEXT,
  build_duration_ms INTEGER,
  bundle_size_bytes BIGINT,
  
  -- Deployment URLs
  deploy_url TEXT,
  subdomain TEXT,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Metadata
  commit_message TEXT,
  file_count INTEGER DEFAULT 0
);

-- Create custom_domains table for custom domain management
CREATE TABLE public.custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  
  -- Verification
  verification_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- SSL
  ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'provisioning', 'active', 'failed')),
  ssl_issued_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'active', 'offline', 'failed')),
  
  -- Settings
  is_primary BOOLEAN DEFAULT false,
  redirect_www BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_deployments_project ON public.deployments(project_id);
CREATE INDEX idx_deployments_user ON public.deployments(user_id);
CREATE INDEX idx_deployments_status ON public.deployments(status);
CREATE INDEX idx_deployments_environment ON public.deployments(project_id, environment);
CREATE INDEX idx_deployments_created ON public.deployments(created_at DESC);
CREATE INDEX idx_custom_domains_project ON public.custom_domains(project_id);
CREATE INDEX idx_custom_domains_domain ON public.custom_domains(domain);

-- Enable RLS
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deployments
CREATE POLICY "Users can view their own deployments"
ON public.deployments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create deployments for their projects"
ON public.deployments FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.builder_projects
    WHERE builder_projects.id = deployments.project_id
    AND builder_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own deployments"
ON public.deployments FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own deployments"
ON public.deployments FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for custom_domains
CREATE POLICY "Users can view their own domains"
ON public.custom_domains FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create domains for their projects"
ON public.custom_domains FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.builder_projects
    WHERE builder_projects.id = custom_domains.project_id
    AND builder_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own domains"
ON public.custom_domains FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own domains"
ON public.custom_domains FOR DELETE
USING (user_id = auth.uid());

-- Trigger for updated_at on custom_domains
CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique subdomain
CREATE OR REPLACE FUNCTION public.generate_subdomain(project_name TEXT, project_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from project name
  base_slug := lower(regexp_replace(project_name, '[^a-zA-Z0-9]', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Limit length
  IF length(base_slug) > 30 THEN
    base_slug := left(base_slug, 30);
  END IF;
  
  -- If empty, use project id prefix
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'project-' || left(project_id::text, 8);
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.deployments WHERE subdomain = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;