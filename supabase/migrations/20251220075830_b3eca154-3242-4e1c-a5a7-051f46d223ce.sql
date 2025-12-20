-- Create project_analysis table for AI context & dependency graphs
CREATE TABLE public.project_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  dependency_graph JSONB DEFAULT '{}',
  component_map JSONB DEFAULT '{}',
  type_definitions JSONB DEFAULT '{}',
  import_map JSONB DEFAULT '{}',
  last_analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id)
);

-- Create builder_conversations table for chat history per project
CREATE TABLE public.builder_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create builder_messages table for individual AI messages
CREATE TABLE public.builder_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.builder_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  operations JSONB DEFAULT NULL,
  is_applied BOOLEAN DEFAULT false,
  error_context JSONB DEFAULT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create error_logs table for captured build/runtime errors
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL CHECK (error_type IN ('build', 'runtime', 'typescript', 'lint')),
  message TEXT NOT NULL,
  stack_trace TEXT,
  file_path TEXT,
  line_number INTEGER,
  column_number INTEGER,
  is_resolved BOOLEAN DEFAULT false,
  resolution_message_id UUID REFERENCES public.builder_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_project_analysis_project ON public.project_analysis(project_id);
CREATE INDEX idx_builder_conversations_project ON public.builder_conversations(project_id);
CREATE INDEX idx_builder_conversations_user ON public.builder_conversations(user_id);
CREATE INDEX idx_builder_messages_conversation ON public.builder_messages(conversation_id);
CREATE INDEX idx_builder_messages_created ON public.builder_messages(created_at);
CREATE INDEX idx_error_logs_project ON public.error_logs(project_id);
CREATE INDEX idx_error_logs_unresolved ON public.error_logs(project_id) WHERE is_resolved = false;

-- Enable RLS
ALTER TABLE public.project_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_analysis
CREATE POLICY "Users can view analysis for their projects"
ON public.project_analysis FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.builder_projects
    WHERE builder_projects.id = project_analysis.project_id
    AND builder_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert analysis for their projects"
ON public.project_analysis FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.builder_projects
    WHERE builder_projects.id = project_analysis.project_id
    AND builder_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update analysis for their projects"
ON public.project_analysis FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.builder_projects
    WHERE builder_projects.id = project_analysis.project_id
    AND builder_projects.user_id = auth.uid()
  )
);

-- RLS Policies for builder_conversations
CREATE POLICY "Users can view their own conversations"
ON public.builder_conversations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations"
ON public.builder_conversations FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
ON public.builder_conversations FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own conversations"
ON public.builder_conversations FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for builder_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.builder_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.builder_conversations
    WHERE builder_conversations.id = builder_messages.conversation_id
    AND builder_conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their conversations"
ON public.builder_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.builder_conversations
    WHERE builder_conversations.id = builder_messages.conversation_id
    AND builder_conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages in their conversations"
ON public.builder_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.builder_conversations
    WHERE builder_conversations.id = builder_messages.conversation_id
    AND builder_conversations.user_id = auth.uid()
  )
);

-- RLS Policies for error_logs
CREATE POLICY "Users can view errors for their projects"
ON public.error_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.builder_projects
    WHERE builder_projects.id = error_logs.project_id
    AND builder_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert errors for their projects"
ON public.error_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.builder_projects
    WHERE builder_projects.id = error_logs.project_id
    AND builder_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update errors for their projects"
ON public.error_logs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.builder_projects
    WHERE builder_projects.id = error_logs.project_id
    AND builder_projects.user_id = auth.uid()
  )
);

-- Update triggers for updated_at
CREATE TRIGGER update_project_analysis_updated_at
  BEFORE UPDATE ON public.project_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_builder_conversations_updated_at
  BEFORE UPDATE ON public.builder_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();