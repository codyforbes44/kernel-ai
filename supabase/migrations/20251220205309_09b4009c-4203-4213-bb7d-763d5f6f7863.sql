-- Add onboarding_completed flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Update the default preferences to include onboarding status
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE created_at < now() - interval '1 minute';