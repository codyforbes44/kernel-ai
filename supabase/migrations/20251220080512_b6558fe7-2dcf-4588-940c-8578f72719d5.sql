-- Create storage bucket for deployed projects
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deployments', 
  'deployments', 
  true,
  52428800, -- 50MB limit
  ARRAY['text/html', 'text/css', 'text/javascript', 'application/javascript', 'application/json', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'font/woff', 'font/woff2', 'application/font-woff', 'application/font-woff2']
);

-- RLS policies for deployments bucket
-- Anyone can view deployed files (they're public)
CREATE POLICY "Public can view deployed files"
ON storage.objects FOR SELECT
USING (bucket_id = 'deployments');

-- Users can upload to their own project folders
CREATE POLICY "Users can upload deployment files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deployments' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.builder_projects WHERE user_id = auth.uid()
  )
);

-- Users can update their own deployment files
CREATE POLICY "Users can update deployment files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'deployments' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.builder_projects WHERE user_id = auth.uid()
  )
);

-- Users can delete their own deployment files
CREATE POLICY "Users can delete deployment files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deployments' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.builder_projects WHERE user_id = auth.uid()
  )
);