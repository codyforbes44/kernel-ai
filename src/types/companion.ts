export interface CompanionProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  personality_type: 'mentor' | 'creative' | 'analytical' | 'supportive';
  personality_traits: {
    empathy?: number;
    formality?: number;
    humor?: number;
    curiosity?: number;
    patience?: number;
    spontaneity?: number;
    precision?: number;
    methodical?: number;
    warmth?: number;
  };
  system_prompt: string;
  voice_settings: Record<string, any>;
  backstory: string | null;
  default_greeting: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanionRelationship {
  id: string;
  user_id: string;
  companion_id: string;
  affinity_level: number;
  total_interactions: number;
  total_messages: number;
  memory_context: MemoryContext;
  milestones: Milestone[];
  current_mood: string;
  nickname: string | null;
  last_interaction: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemoryContext {
  user_name?: string;
  goals?: string[];
  interests?: string[];
  last_topics?: string[];
  important_dates?: Record<string, string>;
  preferences?: Record<string, any>;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  trigger?: number;
  achieved_at: string;
}

export interface CompanionConversation {
  id: string;
  relationship_id: string;
  title: string;
  context_summary: Record<string, any>;
  message_count: number;
  mood_at_start: string | null;
  mood_at_end: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanionMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'companion';
  content: string;
  emotion_tags: string[];
  affinity_change: number;
  tokens_used: number;
  created_at: string;
}

export interface ChatResponse {
  message: string;
  companion_name: string;
  conversation_id: string;
  emotion_tags: string[];
  affinity: {
    level: number;
    change: number;
    description: string;
  };
  milestones: Milestone[];
  tokens_used: number;
}

export interface AffinityLevel {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  description: string;
}

export const AFFINITY_LEVELS: AffinityLevel[] = [
  { name: 'Stranger', minLevel: 0, maxLevel: 15, color: 'hsl(var(--muted))', description: 'Just getting to know each other' },
  { name: 'Acquaintance', minLevel: 16, maxLevel: 35, color: 'hsl(var(--primary) / 0.4)', description: 'Building a connection' },
  { name: 'Friend', minLevel: 36, maxLevel: 55, color: 'hsl(var(--primary) / 0.6)', description: 'A growing friendship' },
  { name: 'Close Friend', minLevel: 56, maxLevel: 75, color: 'hsl(var(--primary) / 0.8)', description: 'A meaningful bond' },
  { name: 'Best Friend', minLevel: 76, maxLevel: 90, color: 'hsl(var(--primary))', description: 'An incredible connection' },
  { name: 'Soulmate', minLevel: 91, maxLevel: 100, color: 'hsl(var(--chart-1))', description: 'The deepest bond possible' },
];

export function getAffinityLevel(level: number): AffinityLevel {
  return AFFINITY_LEVELS.find(
    (al) => level >= al.minLevel && level <= al.maxLevel
  ) || AFFINITY_LEVELS[0];
}

export const PERSONALITY_COLORS: Record<string, string> = {
  mentor: 'hsl(var(--chart-1))',
  creative: 'hsl(var(--chart-2))',
  analytical: 'hsl(var(--chart-3))',
  supportive: 'hsl(var(--chart-4))',
};

export const PERSONALITY_ICONS: Record<string, string> = {
  mentor: '🌟',
  creative: '🎨',
  analytical: '📊',
  supportive: '💚',
};
