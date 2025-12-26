-- Table for storing pre-auth voice conversations
CREATE TABLE public.pending_voice_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  project_name TEXT,
  project_description TEXT,
  conversation_transcript JSONB DEFAULT '[]'::jsonb,
  project_requirements JSONB DEFAULT '{}'::jsonb,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

-- Enable RLS
ALTER TABLE public.pending_voice_projects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert new pending projects (anonymous users)
CREATE POLICY "Anyone can create pending projects"
ON public.pending_voice_projects
FOR INSERT
WITH CHECK (claimed_by IS NULL);

-- Allow updates to unclaimed sessions (by session_id match via service role or anonymous)
CREATE POLICY "Anyone can update unclaimed projects"
ON public.pending_voice_projects
FOR UPDATE
USING (claimed_by IS NULL)
WITH CHECK (claimed_by IS NULL);

-- Allow anyone to select unclaimed projects (needed for session lookup)
CREATE POLICY "Anyone can view unclaimed projects"
ON public.pending_voice_projects
FOR SELECT
USING (claimed_by IS NULL);

-- Owners can read and update their claimed projects
CREATE POLICY "Owners can view claimed projects"
ON public.pending_voice_projects
FOR SELECT
USING (claimed_by = auth.uid());

CREATE POLICY "Owners can update claimed projects"
ON public.pending_voice_projects
FOR UPDATE
USING (claimed_by = auth.uid());

-- Owners can delete their claimed projects
CREATE POLICY "Owners can delete claimed projects"
ON public.pending_voice_projects
FOR DELETE
USING (claimed_by = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_pending_voice_projects_updated_at
BEFORE UPDATE ON public.pending_voice_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to claim a pending project
CREATE OR REPLACE FUNCTION public.claim_pending_voice_project(p_session_id TEXT, p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  UPDATE public.pending_voice_projects
  SET 
    claimed_by = p_user_id,
    claimed_at = now()
  WHERE session_id = p_session_id
    AND claimed_by IS NULL
    AND expires_at > now()
  RETURNING id INTO v_project_id;
  
  RETURN v_project_id;
END;
$$;

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_voice_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.pending_voice_projects
  WHERE expires_at < now()
    AND claimed_by IS NULL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;