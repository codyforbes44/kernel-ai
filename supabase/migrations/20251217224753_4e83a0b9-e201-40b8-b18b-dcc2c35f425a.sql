-- Create shared_templates table for publicly accessible template shares
CREATE TABLE public.shared_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code text NOT NULL UNIQUE,
  template_name text NOT NULL,
  template_description text,
  template_content text NOT NULL,
  template_category text NOT NULL DEFAULT 'custom',
  template_variables text[] DEFAULT '{}'::text[],
  shared_by_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days')
);

-- Create index for share_code lookups
CREATE INDEX idx_shared_templates_share_code ON public.shared_templates(share_code);

-- Enable RLS
ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view shared templates (public read)
CREATE POLICY "Anyone can view shared templates"
ON public.shared_templates
FOR SELECT
USING (true);

-- Users can create their own shares
CREATE POLICY "Users can create own shares"
ON public.shared_templates
FOR INSERT
WITH CHECK (auth.uid() = shared_by_user_id);

-- Users can delete their own shares
CREATE POLICY "Users can delete own shares"
ON public.shared_templates
FOR DELETE
USING (auth.uid() = shared_by_user_id);