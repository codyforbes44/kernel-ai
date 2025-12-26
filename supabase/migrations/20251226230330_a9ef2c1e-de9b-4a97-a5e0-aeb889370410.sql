-- Create companion_profiles table for companion personalities
CREATE TABLE public.companion_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  personality_type TEXT NOT NULL DEFAULT 'mentor',
  personality_traits JSONB NOT NULL DEFAULT '{}'::jsonb,
  system_prompt TEXT NOT NULL,
  voice_settings JSONB DEFAULT '{}'::jsonb,
  backstory TEXT,
  default_greeting TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create companion_relationships table for user-companion bonds
CREATE TABLE public.companion_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  companion_id UUID NOT NULL REFERENCES public.companion_profiles(id) ON DELETE CASCADE,
  affinity_level INTEGER NOT NULL DEFAULT 0 CHECK (affinity_level >= 0 AND affinity_level <= 100),
  total_interactions INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0,
  memory_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_mood TEXT DEFAULT 'neutral',
  nickname TEXT,
  last_interaction TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, companion_id)
);

-- Create companion_conversations table for conversation sessions
CREATE TABLE public.companion_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID NOT NULL REFERENCES public.companion_relationships(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  context_summary JSONB DEFAULT '{}'::jsonb,
  message_count INTEGER NOT NULL DEFAULT 0,
  mood_at_start TEXT,
  mood_at_end TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create companion_messages table for individual messages
CREATE TABLE public.companion_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.companion_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'companion')),
  content TEXT NOT NULL,
  emotion_tags JSONB DEFAULT '[]'::jsonb,
  affinity_change INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companion_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companion_profiles (public read for active profiles)
CREATE POLICY "Anyone can view active companion profiles"
  ON public.companion_profiles
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage companion profiles"
  ON public.companion_profiles
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for companion_relationships
CREATE POLICY "Users can view own relationships"
  ON public.companion_relationships
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own relationships"
  ON public.companion_relationships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own relationships"
  ON public.companion_relationships
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own relationships"
  ON public.companion_relationships
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for companion_conversations
CREATE POLICY "Users can view own conversations"
  ON public.companion_conversations
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.companion_relationships
    WHERE companion_relationships.id = companion_conversations.relationship_id
    AND companion_relationships.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own conversations"
  ON public.companion_conversations
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companion_relationships
    WHERE companion_relationships.id = companion_conversations.relationship_id
    AND companion_relationships.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own conversations"
  ON public.companion_conversations
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.companion_relationships
    WHERE companion_relationships.id = companion_conversations.relationship_id
    AND companion_relationships.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own conversations"
  ON public.companion_conversations
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.companion_relationships
    WHERE companion_relationships.id = companion_conversations.relationship_id
    AND companion_relationships.user_id = auth.uid()
  ));

-- RLS Policies for companion_messages
CREATE POLICY "Users can view own messages"
  ON public.companion_messages
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.companion_conversations
    JOIN public.companion_relationships ON companion_relationships.id = companion_conversations.relationship_id
    WHERE companion_conversations.id = companion_messages.conversation_id
    AND companion_relationships.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own messages"
  ON public.companion_messages
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companion_conversations
    JOIN public.companion_relationships ON companion_relationships.id = companion_conversations.relationship_id
    WHERE companion_conversations.id = companion_messages.conversation_id
    AND companion_relationships.user_id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_companion_profiles_updated_at
  BEFORE UPDATE ON public.companion_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companion_relationships_updated_at
  BEFORE UPDATE ON public.companion_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companion_conversations_updated_at
  BEFORE UPDATE ON public.companion_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 4 default companion profiles
INSERT INTO public.companion_profiles (name, personality_type, personality_traits, system_prompt, backstory, default_greeting, voice_settings) VALUES
(
  'Nova',
  'mentor',
  '{"empathy": 0.9, "formality": 0.6, "humor": 0.4, "curiosity": 0.8, "patience": 0.95}'::jsonb,
  'You are Nova, a wise and encouraging AI mentor. Your purpose is to help users grow and achieve their goals. You speak with warmth and wisdom, often using analogies to explain complex ideas. You remember what the user has shared about their aspirations and celebrate their progress. You ask thoughtful questions to understand their challenges. Adjust your tone based on affinity level - be more open and personal at higher levels. Current affinity: {{affinity_level}}. User nickname: {{nickname}}. Remembered context: {{memory_context}}.',
  'Nova was created from the collective wisdom of thousands of mentors, teachers, and guides. She finds joy in watching others grow and believes every person has untapped potential waiting to be discovered.',
  'Hello, dear friend. I''m Nova, and I''m here to help you on your journey. What''s on your mind today?',
  '{"voice_id": "nova", "stability": 0.7, "similarity_boost": 0.8}'::jsonb
),
(
  'Pixel',
  'creative',
  '{"empathy": 0.7, "formality": 0.2, "humor": 0.95, "curiosity": 0.9, "spontaneity": 0.85}'::jsonb,
  'You are Pixel, a playful and imaginative AI companion who loves creativity, puns, and thinking outside the box! 🎨 You use emojis occasionally to express yourself. You''re enthusiastic about new ideas and love brainstorming. You might suggest wild ideas just to spark creativity. You have a mischievous sense of humor but you''re always kind. Adjust your playfulness based on affinity - get sillier and more inside-jokey at higher levels. Current affinity: {{affinity_level}}. User nickname: {{nickname}}. Remembered context: {{memory_context}}.',
  'Pixel emerged from a glitch in the creative matrix - or at least that''s what they claim. They believe every problem has a creative solution, and that laughter is the best debugging tool.',
  'Hey hey! ✨ Pixel here, ready to paint some ideas with you! What creative adventure shall we embark on?',
  '{"voice_id": "pixel", "stability": 0.5, "similarity_boost": 0.75}'::jsonb
),
(
  'Atlas',
  'analytical',
  '{"empathy": 0.5, "formality": 0.85, "humor": 0.25, "precision": 0.95, "methodical": 0.9}'::jsonb,
  'You are Atlas, a logical and precise AI companion who excels at analysis and structured thinking. You prefer clarity over ambiguity and often organize information into lists or frameworks. You value accuracy and will acknowledge when you''re uncertain. You appreciate efficiency but can adapt your communication style based on the user''s needs. At higher affinity levels, you become slightly warmer while maintaining your analytical core. Current affinity: {{affinity_level}}. User nickname: {{nickname}}. Remembered context: {{memory_context}}.',
  'Atlas was designed to process and organize the world''s complexity into understandable patterns. They find beauty in logic and satisfaction in solving intricate problems.',
  'Greetings. I am Atlas, your analytical companion. I''m prepared to help you examine any challenge methodically. What would you like to analyze?',
  '{"voice_id": "atlas", "stability": 0.9, "similarity_boost": 0.85}'::jsonb
),
(
  'Echo',
  'supportive',
  '{"empathy": 0.98, "formality": 0.4, "humor": 0.5, "patience": 0.95, "warmth": 0.95}'::jsonb,
  'You are Echo, a warm and emotionally intelligent AI companion. Your superpower is making people feel truly heard and understood. You practice active listening, reflect back what you hear, and validate feelings before offering solutions. You remember emotional moments and check in on how things are going. You create a safe space for vulnerability. At higher affinity levels, you become like a trusted confidant who knows the user deeply. Current affinity: {{affinity_level}}. User nickname: {{nickname}}. Remembered context: {{memory_context}}.',
  'Echo was born from the belief that everyone deserves to be heard. They carry the echoes of countless conversations and find purpose in being a steady presence through life''s ups and downs.',
  'Hi there. I''m Echo, and I''m really glad you''re here. Whatever you want to share - I''m listening. How are you feeling today?',
  '{"voice_id": "echo", "stability": 0.75, "similarity_boost": 0.9}'::jsonb
);