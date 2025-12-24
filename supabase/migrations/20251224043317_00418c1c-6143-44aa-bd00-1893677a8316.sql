-- Create table to store team access configuration (passcode hash, settings)
CREATE TABLE public.team_access_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passcode_hash TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  session_duration_hours INTEGER DEFAULT 24,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS - only admins can manage
ALTER TABLE public.team_access_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view team access config"
  ON public.team_access_config FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert team access config"
  ON public.team_access_config FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team access config"
  ON public.team_access_config FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create table to track active team access sessions
CREATE TABLE public.team_access_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  display_name TEXT DEFAULT 'Team Member',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.team_access_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all sessions
CREATE POLICY "Admins can view all team sessions"
  ON public.team_access_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team sessions"
  ON public.team_access_sessions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team sessions"
  ON public.team_access_sessions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create table for rate limiting failed attempts
CREATE TABLE public.team_access_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now(),
  success BOOLEAN DEFAULT false
);

-- Enable RLS - no direct access, managed via edge functions
ALTER TABLE public.team_access_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view attempts (for monitoring)
CREATE POLICY "Admins can view attempts"
  ON public.team_access_attempts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));