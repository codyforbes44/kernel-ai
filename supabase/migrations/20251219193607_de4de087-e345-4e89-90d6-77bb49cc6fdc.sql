-- Update handle_new_user function to remove auto-admin assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  default_workspace_id UUID;
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
    (NEW.id, 'Documentation Generator', 'Generate documentation', 'Generate documentation for {{component_or_feature}}:\n\n```tsx\n{{code}}\n```\n\nInclude: usage examples, props, and best practices.', 'docs'),
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
$function$;