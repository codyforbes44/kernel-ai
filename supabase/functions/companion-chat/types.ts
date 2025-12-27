// Shared types for companion chat edge function

export interface CompanionChatRequest {
  companion_id: string;
  message: string;
  conversation_id?: string;
}

export interface CompanionProfile {
  id: string;
  name: string;
  personality_type: string;
  personality_traits: Record<string, number>;
  system_prompt: string;
  default_greeting: string;
}

export interface Relationship {
  id: string;
  affinity_level: number;
  memory_context: Record<string, any>;
  milestones: Milestone[];
  nickname: string | null;
  current_mood: string;
  total_messages: number;
  total_interactions: number;
  current_streak?: number;
  longest_streak?: number;
  last_check_in_date?: string;
}

export interface Message {
  role: 'user' | 'companion';
  content: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  trigger?: number;
  achieved_at: string;
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
