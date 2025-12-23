export type MessageRole = 'user' | 'assistant' | 'system';
export type TemplateCategory = 'debug' | 'component' | 'database' | 'edge_function' | 'rls' | 'performance' | 'ui_ux' | 'refactor' | 'docs' | 'custom';

export interface ProfilePreferences {
  theme?: 'dark' | 'light';
  keyboard_sounds?: boolean;
  reduced_motion?: boolean;
  [key: string]: unknown;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferences: ProfilePreferences | null;
  onboarding_completed: boolean;
  is_suspended?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  summary: string | null;
  is_pinned: boolean;
  is_archived: boolean;
  parent_conversation_id: string | null;
  branch_point_message_id: string | null;
  tags: string[];
  token_count: number;
  message_count: number;
  last_message_at: string | null;
  lovable_project_url: string | null;
  lovable_project_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  is_starred: boolean;
  is_pinned: boolean;
  is_helpful: boolean | null;
  tokens_used: number;
  model: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}

export interface PromptTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  content: string;
  category: TemplateCategory;
  variables: string[];
  is_favorite: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface UsageAnalytics {
  id: string;
  user_id: string;
  date: string;
  messages_sent: number;
  tokens_used: number;
  conversations_created: number;
  templates_used: number;
}
