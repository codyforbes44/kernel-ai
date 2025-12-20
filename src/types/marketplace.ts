export interface DesignSystem {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  colors: DesignColors;
  typography: DesignTypography;
  spacing: DesignSpacing;
  shadows: Record<string, string>;
  border_radius: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DesignColors {
  primary: { DEFAULT: string; foreground: string };
  secondary: { DEFAULT: string; foreground: string };
  accent: { DEFAULT: string; foreground: string };
  background: string;
  foreground: string;
  muted: { DEFAULT: string; foreground: string };
  destructive: { DEFAULT: string; foreground: string };
  border: string;
  card: { DEFAULT: string; foreground: string };
}

export interface DesignTypography {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, string>;
  lineHeight: Record<string, string>;
}

export interface DesignSpacing {
  unit: string;
  scale: number[];
}

export interface MarketplaceComponent {
  id: string;
  author_id: string;
  name: string;
  description: string | null;
  category: string;
  tags: string[];
  code: string;
  preview_image_url: string | null;
  dependencies: string[];
  props_schema: Record<string, unknown>;
  is_public: boolean;
  downloads: number;
  likes: number;
  version: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  author_name?: string;
  is_liked?: boolean;
  is_installed?: boolean;
}

export interface ComponentInstallation {
  id: string;
  component_id: string;
  project_id: string;
  user_id: string;
  installed_at: string;
}

export type ComponentCategory = 
  | 'ui'
  | 'layout'
  | 'navigation'
  | 'form'
  | 'data-display'
  | 'feedback'
  | 'overlay'
  | 'utility';

export const COMPONENT_CATEGORIES: { value: ComponentCategory; label: string }[] = [
  { value: 'ui', label: 'UI Elements' },
  { value: 'layout', label: 'Layout' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'form', label: 'Forms' },
  { value: 'data-display', label: 'Data Display' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'overlay', label: 'Overlays' },
  { value: 'utility', label: 'Utilities' },
];
