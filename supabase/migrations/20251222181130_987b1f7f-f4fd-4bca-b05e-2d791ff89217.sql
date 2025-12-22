-- Add RLS policies to login_attempts table
-- This table was missing proper access controls

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow service role functions to manage attempts (via security definer functions)
-- No direct user access needed - all access goes through check_account_lockout and record_login_attempt functions

-- Create policy for viewing - users should not be able to see login attempts directly
-- The data is accessed via security definer functions only
CREATE POLICY "No direct access to login_attempts"
ON public.login_attempts
FOR ALL
USING (false)
WITH CHECK (false);