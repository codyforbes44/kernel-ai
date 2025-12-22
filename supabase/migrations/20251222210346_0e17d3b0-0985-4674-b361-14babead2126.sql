-- Create agent_sessions table to store agent history
CREATE TABLE public.agent_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  original_request TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  pending_operations JSONB NOT NULL DEFAULT '[]'::jsonb,
  applied_operations JSONB NOT NULL DEFAULT '[]'::jsonb,
  iteration_count INTEGER NOT NULL DEFAULT 0,
  max_iterations INTEGER NOT NULL DEFAULT 5,
  thinking TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own agent sessions"
  ON public.agent_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent sessions"
  ON public.agent_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent sessions"
  ON public.agent_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent sessions"
  ON public.agent_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_agent_sessions_user_project ON public.agent_sessions(user_id, project_id);
CREATE INDEX idx_agent_sessions_created_at ON public.agent_sessions(created_at DESC);