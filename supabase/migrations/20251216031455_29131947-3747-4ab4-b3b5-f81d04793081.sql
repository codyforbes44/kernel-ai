-- Add columns for linking external Lovable projects to conversations
ALTER TABLE public.conversations
ADD COLUMN lovable_project_url text,
ADD COLUMN lovable_project_name text;