CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: message_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.message_role AS ENUM (
    'user',
    'assistant',
    'system'
);


--
-- Name: template_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.template_category AS ENUM (
    'debug',
    'component',
    'database',
    'edge_function',
    'rls',
    'performance',
    'ui_ux',
    'refactor',
    'docs',
    'custom'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  default_workspace_id UUID;
  default_project_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Auto-assign admin role to all new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  -- Create default workspace
  INSERT INTO public.workspaces (user_id, name, is_default)
  VALUES (NEW.id, 'My Workspace', true)
  RETURNING id INTO default_workspace_id;
  
  -- Create default project
  INSERT INTO public.projects (workspace_id, user_id, name, description)
  VALUES (default_workspace_id, NEW.id, 'General', 'General conversations');
  
  -- Insert default templates (original 9)
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
  
  -- Insert additional 12 templates
  INSERT INTO public.prompt_templates (user_id, name, description, content, category) VALUES
    (NEW.id, 'Form with Validation', 'Create a form with React Hook Form and Zod', 'Create a form for {{form_purpose}} with the following fields:\n\n{{fields}}\n\nUse React Hook Form with Zod validation. Include:\n- Proper error messages\n- Loading states\n- Success/error toasts\n- Accessible form labels', 'component'),
    (NEW.id, 'Data Table', 'Create a sortable, filterable data table', 'Create a data table component for {{data_type}} with:\n\n- Columns: {{columns}}\n- Sorting by: {{sort_fields}}\n- Filtering by: {{filter_fields}}\n\nUse Shadcn Table component with proper loading and empty states.', 'component'),
    (NEW.id, 'Realtime Subscription', 'Set up Supabase realtime listeners', 'Set up realtime subscriptions for the {{table_name}} table to:\n\n{{requirements}}\n\nInclude proper cleanup, error handling, and optimistic updates.', 'database'),
    (NEW.id, 'Full-text Search', 'Implement search functionality', 'Implement full-text search for {{searchable_content}} with:\n\n- Search fields: {{fields}}\n- Filters: {{filters}}\n- Results should include: {{result_fields}}\n\nInclude debouncing and loading states.', 'database'),
    (NEW.id, 'API Integration', 'Connect to external API', 'Create an integration with {{api_name}} API to:\n\n{{requirements}}\n\nEndpoint: {{endpoint}}\nAuthentication: {{auth_type}}\n\nInclude rate limiting, error handling, and proper response formatting.', 'edge_function'),
    (NEW.id, 'Webhook Handler', 'Process incoming webhooks', 'Create a webhook handler for {{service_name}} that:\n\n{{requirements}}\n\nInclude signature verification, idempotency handling, and proper response codes.', 'edge_function'),
    (NEW.id, 'Multi-tenant RLS', 'Organization-based access control', 'Create RLS policies for {{table_name}} that:\n\n- Users can only see data from their organization\n- Admins can see all org data\n- Super admins have full access\n\nOrganization field: {{org_field}}', 'rls'),
    (NEW.id, 'Responsive Layout', 'Mobile-first responsive design', 'Make {{component_name}} fully responsive with:\n\n- Mobile: {{mobile_behavior}}\n- Tablet: {{tablet_behavior}}\n- Desktop: {{desktop_behavior}}\n\nUse Tailwind breakpoints and consider touch interactions.', 'ui_ux'),
    (NEW.id, 'Loading States', 'Add skeleton loaders and loading indicators', 'Add proper loading states to {{component_name}}:\n\n- Initial load: skeleton UI\n- Refresh: subtle indicator\n- Action pending: button loading state\n- Error state with retry\n\nEnsure smooth transitions between states.', 'ui_ux'),
    (NEW.id, 'Authentication Flow', 'Set up auth pages and protected routes', 'Implement authentication for {{app_name}} with:\n\n- Sign up flow: {{signup_requirements}}\n- Login flow: {{login_requirements}}\n- Protected routes: {{protected_pages}}\n- Redirect logic after auth\n\nUse Supabase Auth with proper error handling.', 'custom'),
    (NEW.id, 'File Upload', 'Implement file upload with storage', 'Create file upload functionality for {{use_case}}:\n\n- Allowed types: {{file_types}}\n- Max size: {{max_size}}\n- Storage bucket: {{bucket_name}}\n\nInclude drag-drop, progress indicator, and file preview.', 'custom'),
    (NEW.id, 'Pagination', 'Implement cursor-based pagination', 'Add pagination to {{data_source}} with:\n\n- Page size: {{page_size}}\n- Include: previous/next navigation\n- Show total count\n- Remember scroll position\n\nUse cursor-based pagination for better performance.', 'custom');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_conversation_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_conversation_stats() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.conversations
  SET 
    message_count = (SELECT COUNT(*) FROM public.messages WHERE conversation_id = NEW.conversation_id),
    token_count = (SELECT COALESCE(SUM(tokens_used), 0) FROM public.messages WHERE conversation_id = NEW.conversation_id),
    last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text DEFAULT 'New Conversation'::text NOT NULL,
    summary text,
    is_pinned boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    parent_conversation_id uuid,
    branch_point_message_id uuid,
    tags text[] DEFAULT '{}'::text[],
    token_count integer DEFAULT 0,
    message_count integer DEFAULT 0,
    last_message_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    lovable_project_url text,
    lovable_project_name text
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.message_role NOT NULL,
    content text NOT NULL,
    is_starred boolean DEFAULT false,
    is_pinned boolean DEFAULT false,
    is_helpful boolean,
    tokens_used integer DEFAULT 0,
    model text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.messages REPLICA IDENTITY FULL;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    display_name text,
    avatar_url text,
    preferences jsonb DEFAULT '{"theme": "dark", "reduced_motion": false, "keyboard_sounds": false}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    icon text DEFAULT '📁'::text,
    color text DEFAULT '#8b5cf6'::text,
    is_archived boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: prompt_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prompt_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    content text NOT NULL,
    category public.template_category DEFAULT 'custom'::public.template_category NOT NULL,
    variables text[] DEFAULT '{}'::text[],
    is_favorite boolean DEFAULT false,
    usage_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: shared_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shared_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    share_code text NOT NULL,
    template_name text NOT NULL,
    template_description text,
    template_content text NOT NULL,
    template_category text DEFAULT 'custom'::text NOT NULL,
    template_variables text[] DEFAULT '{}'::text[],
    shared_by_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval)
);


--
-- Name: usage_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    messages_sent integer DEFAULT 0,
    tokens_used integer DEFAULT 0,
    conversations_created integer DEFAULT 0,
    templates_used integer DEFAULT 0
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text DEFAULT 'Default Workspace'::text NOT NULL,
    icon text DEFAULT '🏠'::text,
    color text DEFAULT '#6366f1'::text,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: prompt_templates prompt_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompt_templates
    ADD CONSTRAINT prompt_templates_pkey PRIMARY KEY (id);


--
-- Name: shared_templates shared_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_templates
    ADD CONSTRAINT shared_templates_pkey PRIMARY KEY (id);


--
-- Name: shared_templates shared_templates_share_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_templates
    ADD CONSTRAINT shared_templates_share_code_key UNIQUE (share_code);


--
-- Name: usage_analytics usage_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_analytics
    ADD CONSTRAINT usage_analytics_pkey PRIMARY KEY (id);


--
-- Name: usage_analytics usage_analytics_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_analytics
    ADD CONSTRAINT usage_analytics_user_id_date_key UNIQUE (user_id, date);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: idx_conversations_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_project_id ON public.conversations USING btree (project_id);


--
-- Name: idx_conversations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);


--
-- Name: idx_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_user_id ON public.messages USING btree (user_id);


--
-- Name: idx_projects_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_user_id ON public.projects USING btree (user_id);


--
-- Name: idx_projects_workspace_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_workspace_id ON public.projects USING btree (workspace_id);


--
-- Name: idx_prompt_templates_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prompt_templates_user_id ON public.prompt_templates USING btree (user_id);


--
-- Name: idx_shared_templates_share_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shared_templates_share_code ON public.shared_templates USING btree (share_code);


--
-- Name: idx_usage_analytics_user_id_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usage_analytics_user_id_date ON public.usage_analytics USING btree (user_id, date);


--
-- Name: idx_workspaces_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspaces_user_id ON public.workspaces USING btree (user_id);


--
-- Name: messages update_conversation_stats_on_message; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_conversation_stats_on_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_stats();


--
-- Name: conversations update_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: messages update_messages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: prompt_templates update_prompt_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON public.prompt_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: workspaces update_workspaces_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: conversations conversations_parent_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_parent_conversation_id_fkey FOREIGN KEY (parent_conversation_id) REFERENCES public.conversations(id) ON DELETE SET NULL;


--
-- Name: conversations conversations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: prompt_templates prompt_templates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompt_templates
    ADD CONSTRAINT prompt_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: usage_analytics usage_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_analytics
    ADD CONSTRAINT usage_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: workspaces workspaces_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: conversations Admins can view all conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all conversations" ON public.conversations FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: messages Admins can view all messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: projects Admins can view all projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all projects" ON public.projects FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: workspaces Admins can view all workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all workspaces" ON public.workspaces FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: shared_templates Anyone can view shared templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view shared templates" ON public.shared_templates FOR SELECT USING (true);


--
-- Name: conversations Users can create own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own conversations" ON public.conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: messages Users can create own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own messages" ON public.messages FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: projects Users can create own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: shared_templates Users can create own shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own shares" ON public.shared_templates FOR INSERT WITH CHECK ((auth.uid() = shared_by_user_id));


--
-- Name: prompt_templates Users can create own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own templates" ON public.prompt_templates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: workspaces Users can create own workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own workspaces" ON public.workspaces FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: conversations Users can delete own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: messages Users can delete own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: projects Users can delete own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: shared_templates Users can delete own shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own shares" ON public.shared_templates FOR DELETE USING ((auth.uid() = shared_by_user_id));


--
-- Name: prompt_templates Users can delete own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own templates" ON public.prompt_templates FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: workspaces Users can delete own workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own workspaces" ON public.workspaces FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: usage_analytics Users can insert own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own analytics" ON public.usage_analytics FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: usage_analytics Users can update own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own analytics" ON public.usage_analytics FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: conversations Users can update own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: messages Users can update own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: projects Users can update own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: prompt_templates Users can update own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own templates" ON public.prompt_templates FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: workspaces Users can update own workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own workspaces" ON public.workspaces FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: usage_analytics Users can view own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own analytics" ON public.usage_analytics FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: conversations Users can view own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: messages Users can view own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: projects Users can view own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: prompt_templates Users can view own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own templates" ON public.prompt_templates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: workspaces Users can view own workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own workspaces" ON public.workspaces FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: prompt_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: shared_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: usage_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: workspaces; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;