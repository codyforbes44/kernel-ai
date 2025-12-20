-- Create login_attempts table to track failed logins
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_login_attempts_email_created ON public.login_attempts (email, created_at DESC);

-- Enable RLS (but allow public inserts via edge function)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role full access (edge functions use service role)
CREATE POLICY "Service role has full access to login_attempts"
ON public.login_attempts
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION public.check_account_lockout(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  failed_count INTEGER;
  last_attempt TIMESTAMP WITH TIME ZONE;
  lockout_duration INTERVAL := '15 minutes';
  max_attempts INTEGER := 5;
  lockout_window INTERVAL := '15 minutes';
BEGIN
  -- Count failed attempts in the lockout window
  SELECT COUNT(*), MAX(created_at)
  INTO failed_count, last_attempt
  FROM public.login_attempts
  WHERE email = LOWER(p_email)
    AND success = false
    AND created_at > now() - lockout_window;

  -- Check if locked out
  IF failed_count >= max_attempts THEN
    RETURN json_build_object(
      'locked', true,
      'remaining_seconds', EXTRACT(EPOCH FROM (last_attempt + lockout_duration - now()))::INTEGER,
      'attempts', failed_count,
      'max_attempts', max_attempts
    );
  END IF;

  RETURN json_build_object(
    'locked', false,
    'attempts', failed_count,
    'max_attempts', max_attempts,
    'remaining_attempts', max_attempts - failed_count
  );
END;
$$;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION public.record_login_attempt(p_email TEXT, p_success BOOLEAN, p_ip_address TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.login_attempts (email, success, ip_address)
  VALUES (LOWER(p_email), p_success, p_ip_address);

  -- If successful login, clear old failed attempts for this email
  IF p_success THEN
    DELETE FROM public.login_attempts
    WHERE email = LOWER(p_email)
      AND success = false
      AND created_at < now() - INTERVAL '1 hour';
  END IF;

  -- Cleanup old attempts (older than 24 hours)
  DELETE FROM public.login_attempts
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;