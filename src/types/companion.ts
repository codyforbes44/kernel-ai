// Companion system types

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
  current_streak: number;
  longest_streak: number;
  last_check_in_date: string | null;
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

// Re-export constants for backward compatibility
export { 
  AFFINITY_LEVELS, 
  getAffinityLevel, 
  PERSONALITY_COLORS, 
  PERSONALITY_ICONS 
} from '@/constants/companion';
