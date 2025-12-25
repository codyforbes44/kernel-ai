-- Add video support to generated_assets table
ALTER TABLE public.generated_assets 
  ADD COLUMN IF NOT EXISTS duration integer,
  ADD COLUMN IF NOT EXISTS video_thumbnail_url text;

-- Add comment for clarity
COMMENT ON COLUMN public.generated_assets.duration IS 'Duration in seconds for video assets';
COMMENT ON COLUMN public.generated_assets.video_thumbnail_url IS 'Thumbnail URL for video assets';