-- Create subscription_overrides table for manual access grants
CREATE TABLE public.subscription_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'enterprise' CHECK (plan IN ('pro', 'enterprise')),
  granted_by UUID,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_subscription_overrides_user_id ON public.subscription_overrides(user_id);
CREATE INDEX idx_subscription_overrides_is_active ON public.subscription_overrides(is_active);

-- Enable RLS
ALTER TABLE public.subscription_overrides ENABLE ROW LEVEL SECURITY;

-- Admins can manage all overrides
CREATE POLICY "Admins can manage subscription overrides"
ON public.subscription_overrides
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Users can view their own override
CREATE POLICY "Users can view own subscription override"
ON public.subscription_overrides
FOR SELECT
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_subscription_overrides_updated_at
BEFORE UPDATE ON public.subscription_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Enterprise overrides for both users
INSERT INTO public.subscription_overrides (user_id, plan, reason)
VALUES 
  ('67dc1c70-a7c3-4253-af41-a6adbff48c2f', 'enterprise', 'Founding member - full access'),
  ('3eb6e26c-2c31-4db7-a66c-35ee54e26a76', 'enterprise', 'Founding member - full access');