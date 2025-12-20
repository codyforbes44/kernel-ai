-- Design Systems table
CREATE TABLE public.design_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  colors JSONB NOT NULL DEFAULT '{}',
  typography JSONB NOT NULL DEFAULT '{}',
  spacing JSONB NOT NULL DEFAULT '{}',
  shadows JSONB NOT NULL DEFAULT '{}',
  border_radius JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.design_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own design systems"
ON public.design_systems FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own design systems"
ON public.design_systems FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own design systems"
ON public.design_systems FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own design systems"
ON public.design_systems FOR DELETE
USING (auth.uid() = user_id);

-- Marketplace Components table
CREATE TABLE public.marketplace_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'ui',
  tags TEXT[] DEFAULT '{}',
  code TEXT NOT NULL,
  preview_image_url TEXT,
  dependencies JSONB DEFAULT '[]',
  props_schema JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.marketplace_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public components"
ON public.marketplace_components FOR SELECT
USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "Users can create own components"
ON public.marketplace_components FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own components"
ON public.marketplace_components FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own components"
ON public.marketplace_components FOR DELETE
USING (auth.uid() = author_id);

-- Component installations tracking
CREATE TABLE public.component_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES public.marketplace_components(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.builder_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  installed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(component_id, project_id)
);

ALTER TABLE public.component_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own installations"
ON public.component_installations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can install components"
ON public.component_installations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can uninstall components"
ON public.component_installations FOR DELETE
USING (auth.uid() = user_id);

-- Component likes tracking
CREATE TABLE public.component_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES public.marketplace_components(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(component_id, user_id)
);

ALTER TABLE public.component_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes"
ON public.component_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like components"
ON public.component_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike components"
ON public.component_likes FOR DELETE
USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_design_systems_updated_at
  BEFORE UPDATE ON public.design_systems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_components_updated_at
  BEFORE UPDATE ON public.marketplace_components
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();