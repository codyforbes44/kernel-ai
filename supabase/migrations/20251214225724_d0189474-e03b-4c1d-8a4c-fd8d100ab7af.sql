-- Create enum for message roles
CREATE TYPE public.message_role AS ENUM ('user', 'assistant', 'system');

-- Create enum for template categories
CREATE TYPE public.template_category AS ENUM ('debug', 'component', 'database', 'edge_function', 'rls', 'performance', 'ui_ux', 'refactor', 'docs', 'custom');

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme": "dark", "keyboard_sounds": false, "reduced_motion": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Workspace',
  icon TEXT DEFAULT '🏠',
  color TEXT DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#8b5cf6',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  summary TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  parent_conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  branch_point_message_id UUID,
  tags TEXT[] DEFAULT '{}',
  token_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  is_starred BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_helpful BOOLEAN,
  tokens_used INTEGER DEFAULT 0,
  model TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prompt templates table
CREATE TABLE public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category template_category NOT NULL DEFAULT 'custom',
  variables TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage analytics table
CREATE TABLE public.usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_sent INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  conversations_created INTEGER DEFAULT 0,
  templates_used INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "Users can view own workspaces" ON public.workspaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workspaces" ON public.workspaces FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workspaces" ON public.workspaces FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);

-- Prompt templates policies
CREATE POLICY "Users can view own templates" ON public.prompt_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own templates" ON public.prompt_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.prompt_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.prompt_templates FOR DELETE USING (auth.uid() = user_id);

-- Usage analytics policies
CREATE POLICY "Users can view own analytics" ON public.usage_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON public.usage_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON public.usage_analytics FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_conversations_project_id ON public.conversations(project_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_prompt_templates_user_id ON public.prompt_templates(user_id);
CREATE INDEX idx_usage_analytics_user_id_date ON public.usage_analytics(user_id, date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON public.prompt_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_workspace_id UUID;
  default_project_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Create default workspace
  INSERT INTO public.workspaces (user_id, name, is_default)
  VALUES (NEW.id, 'My Workspace', true)
  RETURNING id INTO default_workspace_id;
  
  -- Create default project
  INSERT INTO public.projects (workspace_id, user_id, name, description)
  VALUES (default_workspace_id, NEW.id, 'General', 'General conversations');
  
  -- Insert default templates
  INSERT INTO public.prompt_templates (user_id, name, description, content, category) VALUES
    (NEW.id, 'Debug Error', 'Analyze and fix error messages', 'I''m encountering this error in my Lovable project:\n\n```\n{{error_message}}\n```\n\nContext: {{context}}\n\nPlease help me understand what''s causing this and how to fix it.', 'debug'),
    (NEW.id, 'Component Generator', 'Generate a new React component', 'Create a {{component_type}} component called {{component_name}} with the following requirements:\n\n- {{requirements}}\n\nUse TypeScript, Tailwind CSS, and follow Shadcn patterns.', 'component'),
    (NEW.id, 'Database Schema', 'Design database tables', 'I need to create a database schema for {{feature_name}}.\n\nRequirements:\n{{requirements}}\n\nPlease provide the SQL migration with RLS policies.', 'database'),
    (NEW.id, 'Edge Function', 'Create a Supabase Edge Function', 'Create an Edge Function called {{function_name}} that:\n\n{{requirements}}\n\nInclude proper error handling and CORS headers.', 'edge_function'),
    (NEW.id, 'RLS Policy Review', 'Review Row Level Security', 'Review the RLS policies for the {{table_name}} table:\n\n```sql\n{{current_policies}}\n```\n\nEnsure they properly protect data while allowing necessary access.', 'rls'),
    (NEW.id, 'Performance Optimization', 'Optimize component performance', 'Optimize this component for better performance:\n\n```tsx\n{{component_code}}\n```\n\nFocus on: memoization, avoiding re-renders, and bundle size.', 'performance'),
    (NEW.id, 'UI/UX Improvement', 'Improve user interface', 'Improve the UI/UX of {{feature_name}}:\n\nCurrent issues: {{issues}}\n\nDesired outcome: {{desired_outcome}}', 'ui_ux'),
    (NEW.id, 'Refactoring Request', 'Refactor existing code', 'Refactor this code to be more maintainable:\n\n```tsx\n{{code}}\n```\n\nGoals: {{goals}}', 'refactor'),
    (NEW.id, 'Documentation Generator', 'Generate documentation', 'Generate documentation for {{component_or_feature}}:\n\n```tsx\n{{code}}\n```\n\nInclude: usage examples, props, and best practices.', 'docs');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update conversation stats
CREATE OR REPLACE FUNCTION public.update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    message_count = (SELECT COUNT(*) FROM public.messages WHERE conversation_id = NEW.conversation_id),
    token_count = (SELECT COALESCE(SUM(tokens_used), 0) FROM public.messages WHERE conversation_id = NEW.conversation_id),
    last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_conversation_stats_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_stats();