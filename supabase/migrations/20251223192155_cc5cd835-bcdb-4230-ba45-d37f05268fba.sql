-- Create x_tweet_drafts table
CREATE TABLE public.x_tweet_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'tweet',
  hashtags TEXT[] DEFAULT '{}',
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create x_scheduled_tweets table
CREATE TABLE public.x_scheduled_tweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  draft_id UUID REFERENCES public.x_tweet_drafts(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'tweet',
  hashtags TEXT[] DEFAULT '{}',
  image_url TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  status TEXT DEFAULT 'pending',
  posted_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.x_tweet_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.x_scheduled_tweets ENABLE ROW LEVEL SECURITY;

-- RLS policies for x_tweet_drafts
CREATE POLICY "Users can view own drafts" ON public.x_tweet_drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own drafts" ON public.x_tweet_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts" ON public.x_tweet_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts" ON public.x_tweet_drafts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for x_scheduled_tweets
CREATE POLICY "Users can view own scheduled tweets" ON public.x_scheduled_tweets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scheduled tweets" ON public.x_scheduled_tweets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled tweets" ON public.x_scheduled_tweets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled tweets" ON public.x_scheduled_tweets
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_x_tweet_drafts_user_id ON public.x_tweet_drafts(user_id);
CREATE INDEX idx_x_tweet_drafts_created_at ON public.x_tweet_drafts(created_at DESC);
CREATE INDEX idx_x_scheduled_tweets_user_id ON public.x_scheduled_tweets(user_id);
CREATE INDEX idx_x_scheduled_tweets_scheduled_for ON public.x_scheduled_tweets(scheduled_for);
CREATE INDEX idx_x_scheduled_tweets_status ON public.x_scheduled_tweets(status);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_x_automation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_x_tweet_drafts_updated_at
  BEFORE UPDATE ON public.x_tweet_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_x_automation_updated_at();

CREATE TRIGGER update_x_scheduled_tweets_updated_at
  BEFORE UPDATE ON public.x_scheduled_tweets
  FOR EACH ROW EXECUTE FUNCTION public.update_x_automation_updated_at();