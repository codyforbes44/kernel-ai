-- Grant admin role to all existing users who don't have it
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id AND ur.role = 'admin'
);

-- Update handle_new_user() to auto-assign admin role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;