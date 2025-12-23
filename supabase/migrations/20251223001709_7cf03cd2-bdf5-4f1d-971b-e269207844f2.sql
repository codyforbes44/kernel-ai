-- Create generated_assets table for AI-generated images and assets
CREATE TABLE public.generated_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  style TEXT DEFAULT 'realistic',
  aspect_ratio TEXT DEFAULT '1:1',
  asset_type TEXT NOT NULL DEFAULT 'image',
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'image/png',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assets"
  ON public.generated_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assets"
  ON public.generated_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON public.generated_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON public.generated_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_generated_assets_user_id ON public.generated_assets(user_id);
CREATE INDEX idx_generated_assets_project_id ON public.generated_assets(project_id);
CREATE INDEX idx_generated_assets_created_at ON public.generated_assets(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_generated_assets_updated_at
  BEFORE UPDATE ON public.generated_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for AI assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-assets',
  'ai-assets',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
);

-- Storage RLS policies
CREATE POLICY "Users can view all AI assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ai-assets');

CREATE POLICY "Users can upload their own AI assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ai-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own AI assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'ai-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own AI assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'ai-assets' AND auth.uid()::text = (storage.foldername(name))[1]);