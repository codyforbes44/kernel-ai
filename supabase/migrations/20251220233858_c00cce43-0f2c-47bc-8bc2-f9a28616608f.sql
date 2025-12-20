-- Create table for deployment environment variables
CREATE TABLE public.deployment_env_vars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  environment TEXT NOT NULL DEFAULT 'all',
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  is_secret BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, environment, key)
);

-- Enable RLS
ALTER TABLE public.deployment_env_vars ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own env vars"
ON public.deployment_env_vars
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create env vars for their projects"
ON public.deployment_env_vars
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.builder_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own env vars"
ON public.deployment_env_vars
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own env vars"
ON public.deployment_env_vars
FOR DELETE
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_deployment_env_vars_updated_at
BEFORE UPDATE ON public.deployment_env_vars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();