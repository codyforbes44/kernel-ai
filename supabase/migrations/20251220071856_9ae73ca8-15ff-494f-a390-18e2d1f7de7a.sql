-- Create table to track user login locations
CREATE TABLE public.user_login_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  city TEXT,
  region TEXT,
  country TEXT,
  country_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  isp TEXT,
  is_trusted BOOLEAN DEFAULT false,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  login_count INTEGER DEFAULT 1,
  UNIQUE(user_id, ip_address)
);

-- Create index for efficient lookups
CREATE INDEX idx_user_login_locations_user_id ON public.user_login_locations (user_id);

-- Enable RLS
ALTER TABLE public.user_login_locations ENABLE ROW LEVEL SECURITY;

-- Users can view their own login locations
CREATE POLICY "Users can view own login locations"
ON public.user_login_locations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own login locations
CREATE POLICY "Users can insert own login locations"
ON public.user_login_locations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own login locations
CREATE POLICY "Users can update own login locations"
ON public.user_login_locations
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own login locations
CREATE POLICY "Users can delete own login locations"
ON public.user_login_locations
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for login alerts
CREATE TABLE public.login_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_id UUID REFERENCES public.user_login_locations(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  city TEXT,
  country TEXT,
  alert_type TEXT NOT NULL DEFAULT 'new_location',
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_login_alerts_user_id ON public.login_alerts (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.login_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view own login alerts"
ON public.login_alerts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own alerts
CREATE POLICY "Users can insert own login alerts"
ON public.login_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own alerts (mark as read/dismissed)
CREATE POLICY "Users can update own login alerts"
ON public.login_alerts
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete own login alerts"
ON public.login_alerts
FOR DELETE
USING (auth.uid() = user_id);