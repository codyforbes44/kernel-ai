-- Security Hardening Migration

-- 1. Fix login_attempts RLS - Remove the dangerous public access policy
-- The table should only be accessible via SECURITY DEFINER functions (check_account_lockout, record_login_attempt)
DROP POLICY IF EXISTS "Service role has full access to login_attempts" ON public.login_attempts;

-- No new policies needed - the SECURITY DEFINER functions bypass RLS
-- This effectively makes the table inaccessible to direct client queries

-- 2. Update shared_templates RLS to enforce expiration
DROP POLICY IF EXISTS "Anyone can view shared templates" ON public.shared_templates;

CREATE POLICY "Anyone can view non-expired shared templates"
ON public.shared_templates
FOR SELECT
USING (expires_at IS NULL OR expires_at > now());