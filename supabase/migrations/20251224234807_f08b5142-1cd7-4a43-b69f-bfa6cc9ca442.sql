-- Create invite_codes table
CREATE TABLE public.invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'single_use' CHECK (type IN ('single_use', 'multi_use', 'unlimited')),
  max_uses INTEGER DEFAULT 1,
  times_used INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  campaign TEXT,
  notes TEXT
);

-- Create invite_code_redemptions table
CREATE TABLE public.invite_code_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES public.invite_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT
);

-- Create invite_requests table
CREATE TABLE public.invite_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  use_case TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  invite_code_id UUID REFERENCES public.invite_codes(id),
  admin_notes TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invite_codes
CREATE POLICY "Admins can manage invite codes"
  ON public.invite_codes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for invite_code_redemptions
CREATE POLICY "Admins can view all redemptions"
  ON public.invite_code_redemptions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own redemptions"
  ON public.invite_code_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert redemptions"
  ON public.invite_code_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for invite_requests
CREATE POLICY "Admins can manage all invite requests"
  ON public.invite_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit invite requests"
  ON public.invite_requests
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX idx_invite_codes_campaign ON public.invite_codes(campaign);
CREATE INDEX idx_invite_codes_is_active ON public.invite_codes(is_active);
CREATE INDEX idx_invite_requests_status ON public.invite_requests(status);
CREATE INDEX idx_invite_requests_email ON public.invite_requests(email);
CREATE INDEX idx_invite_code_redemptions_code_id ON public.invite_code_redemptions(code_id);

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code(prefix TEXT DEFAULT 'KERNEL')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code: PREFIX-XXXX-XXXX format
    new_code := prefix || '-' || 
                upper(substr(md5(random()::text), 1, 4)) || '-' ||
                upper(substr(md5(random()::text), 1, 4));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.invite_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to validate invite code
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite invite_codes%ROWTYPE;
  v_remaining INTEGER;
BEGIN
  -- Find the code
  SELECT * INTO v_invite 
  FROM public.invite_codes 
  WHERE code = upper(trim(p_code));
  
  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid invite code');
  END IF;
  
  -- Check if active
  IF NOT v_invite.is_active THEN
    RETURN json_build_object('valid', false, 'error', 'This invite code has been deactivated');
  END IF;
  
  -- Check expiration
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RETURN json_build_object('valid', false, 'error', 'This invite code has expired');
  END IF;
  
  -- Check usage limits
  IF v_invite.type = 'single_use' AND v_invite.times_used >= 1 THEN
    RETURN json_build_object('valid', false, 'error', 'This invite code has already been used');
  END IF;
  
  IF v_invite.type = 'multi_use' AND v_invite.times_used >= v_invite.max_uses THEN
    RETURN json_build_object('valid', false, 'error', 'This invite code has reached its usage limit');
  END IF;
  
  -- Calculate remaining uses
  IF v_invite.type = 'unlimited' THEN
    v_remaining := -1; -- -1 indicates unlimited
  ELSIF v_invite.type = 'single_use' THEN
    v_remaining := 1 - v_invite.times_used;
  ELSE
    v_remaining := v_invite.max_uses - v_invite.times_used;
  END IF;
  
  RETURN json_build_object(
    'valid', true,
    'code_id', v_invite.id,
    'type', v_invite.type,
    'remaining_uses', v_remaining,
    'campaign', v_invite.campaign
  );
END;
$$;

-- Function to redeem invite code
CREATE OR REPLACE FUNCTION public.redeem_invite_code(p_code TEXT, p_user_id UUID, p_ip_address TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_validation JSON;
  v_code_id UUID;
BEGIN
  -- First validate the code
  v_validation := public.validate_invite_code(p_code);
  
  IF NOT (v_validation->>'valid')::boolean THEN
    RETURN v_validation;
  END IF;
  
  v_code_id := (v_validation->>'code_id')::uuid;
  
  -- Check if user already redeemed this code
  IF EXISTS (SELECT 1 FROM public.invite_code_redemptions WHERE code_id = v_code_id AND user_id = p_user_id) THEN
    RETURN json_build_object('valid', false, 'error', 'You have already redeemed this code');
  END IF;
  
  -- Insert redemption record
  INSERT INTO public.invite_code_redemptions (code_id, user_id, ip_address)
  VALUES (v_code_id, p_user_id, p_ip_address);
  
  -- Increment usage count
  UPDATE public.invite_codes 
  SET times_used = times_used + 1
  WHERE id = v_code_id;
  
  RETURN json_build_object(
    'valid', true,
    'redeemed', true,
    'message', 'Invite code successfully redeemed!'
  );
END;
$$;