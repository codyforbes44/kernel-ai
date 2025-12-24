-- Insert initial team access configuration
-- Passcode: 847291 (SHA-256 hashed with salt 'team_access_salt_v1')
INSERT INTO public.team_access_config (
  passcode_hash, 
  is_enabled, 
  session_duration_hours
)
VALUES (
  encode(sha256('847291team_access_salt_v1'::bytea), 'hex'),
  true,
  24
)
ON CONFLICT (id) DO UPDATE SET
  passcode_hash = EXCLUDED.passcode_hash,
  is_enabled = EXCLUDED.is_enabled,
  session_duration_hours = EXCLUDED.session_duration_hours,
  updated_at = now();