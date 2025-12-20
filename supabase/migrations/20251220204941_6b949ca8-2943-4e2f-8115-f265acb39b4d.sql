-- Create the missing trigger that calls handle_new_user() when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix existing users: Create profiles for users who don't have one
INSERT INTO public.profiles (id, display_name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Create default workspaces for users who don't have one
INSERT INTO public.workspaces (user_id, name, is_default)
SELECT u.id, 'My Workspace', true
FROM auth.users u
LEFT JOIN public.workspaces w ON w.user_id = u.id
WHERE w.id IS NULL;

-- Create default projects for users who have a workspace but no project
INSERT INTO public.projects (workspace_id, user_id, name, description)
SELECT w.id, w.user_id, 'General', 'General conversations'
FROM public.workspaces w
LEFT JOIN public.projects p ON p.workspace_id = w.id
WHERE p.id IS NULL;