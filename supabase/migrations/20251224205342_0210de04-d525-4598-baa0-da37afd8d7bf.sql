-- Create xAI settings table for admin management
CREATE TABLE public.xai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT true,
  rate_limit_per_user_daily integer NOT NULL DEFAULT 100,
  alert_threshold_daily integer NOT NULL DEFAULT 500,
  default_model text NOT NULL DEFAULT 'grok-3-fast',
  max_tokens_per_request integer NOT NULL DEFAULT 4000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xai_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view xai settings"
ON public.xai_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update settings
CREATE POLICY "Admins can update xai settings"
ON public.xai_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert xai settings"
ON public.xai_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_xai_settings_updated_at
BEFORE UPDATE ON public.xai_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.xai_settings (is_enabled, rate_limit_per_user_daily, alert_threshold_daily, default_model, max_tokens_per_request)
VALUES (true, 100, 500, 'grok-3-fast', 4000);

-- Create xai_usage_tracking table for rate limiting
CREATE TABLE public.xai_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_date date NOT NULL DEFAULT CURRENT_DATE,
  request_count integer NOT NULL DEFAULT 1,
  tokens_used integer NOT NULL DEFAULT 0,
  credits_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, request_date)
);

-- Enable RLS on usage tracking
ALTER TABLE public.xai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own xai usage"
ON public.xai_usage_tracking
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all usage
CREATE POLICY "Admins can view all xai usage"
ON public.xai_usage_tracking
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can insert their own usage (for edge function)
CREATE POLICY "Users can insert own xai usage"
ON public.xai_usage_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own xai usage"
ON public.xai_usage_tracking
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on usage tracking
CREATE TRIGGER update_xai_usage_tracking_updated_at
BEFORE UPDATE ON public.xai_usage_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION public.check_xai_rate_limit(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_settings xai_settings%ROWTYPE;
  v_usage xai_usage_tracking%ROWTYPE;
  v_remaining integer;
BEGIN
  -- Get settings
  SELECT * INTO v_settings FROM xai_settings LIMIT 1;
  
  -- If settings don't exist or feature is disabled
  IF NOT FOUND OR NOT v_settings.is_enabled THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'xAI feature is disabled',
      'remaining', 0
    );
  END IF;
  
  -- Get today's usage for user
  SELECT * INTO v_usage 
  FROM xai_usage_tracking 
  WHERE user_id = p_user_id AND request_date = CURRENT_DATE;
  
  IF NOT FOUND THEN
    v_remaining := v_settings.rate_limit_per_user_daily;
  ELSE
    v_remaining := v_settings.rate_limit_per_user_daily - v_usage.request_count;
  END IF;
  
  IF v_remaining <= 0 THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'Daily rate limit exceeded',
      'remaining', 0,
      'limit', v_settings.rate_limit_per_user_daily
    );
  END IF;
  
  RETURN json_build_object(
    'allowed', true,
    'remaining', v_remaining,
    'limit', v_settings.rate_limit_per_user_daily,
    'default_model', v_settings.default_model,
    'max_tokens', v_settings.max_tokens_per_request
  );
END;
$$;

-- Create function to increment usage
CREATE OR REPLACE FUNCTION public.increment_xai_usage(
  p_user_id uuid,
  p_tokens integer DEFAULT 0,
  p_credits integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO xai_usage_tracking (user_id, request_date, request_count, tokens_used, credits_used)
  VALUES (p_user_id, CURRENT_DATE, 1, p_tokens, p_credits)
  ON CONFLICT (user_id, request_date) 
  DO UPDATE SET 
    request_count = xai_usage_tracking.request_count + 1,
    tokens_used = xai_usage_tracking.tokens_used + p_tokens,
    credits_used = xai_usage_tracking.credits_used + p_credits,
    updated_at = now();
END;
$$;