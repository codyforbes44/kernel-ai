// Companion system constants and configuration

// Voice ID mappings for ElevenLabs TTS
export const PERSONALITY_VOICE_MAP: Record<string, string> = {
  mentor: 'EXAVITQu4vr4xnSDxMaL', // Sarah - calm, wise
  creative: 'pFZP5JQG7iQjIQuC4Bku', // Lily - energetic
  analytical: 'nPczCjzI2devNBz1zQrb', // Brian - clear, precise
  supportive: 'Xb7hH8MSUJpSbSDYk0k2', // Alice - warm, gentle
};

// Personality visual configuration
export const PERSONALITY_ICONS: Record<string, string> = {
  mentor: '🌟',
  creative: '🎨',
  analytical: '📊',
  supportive: '💚',
};

export const PERSONALITY_COLORS: Record<string, string> = {
  mentor: 'hsl(var(--chart-1))',
  creative: 'hsl(var(--chart-2))',
  analytical: 'hsl(var(--chart-3))',
  supportive: 'hsl(var(--chart-4))',
};

// Affinity level configuration
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

// Milestone definitions
export interface MilestoneDefinition {
  id: string;
  trigger: number;
  title: string;
  description: string;
  type: 'messages' | 'affinity';
}

export const MESSAGE_MILESTONES: MilestoneDefinition[] = [
  { id: 'first_message', trigger: 1, title: 'First Words', description: 'Started your journey together', type: 'messages' },
  { id: 'messages_10', trigger: 10, title: 'Getting Acquainted', description: 'Exchanged 10 messages', type: 'messages' },
  { id: 'messages_50', trigger: 50, title: 'Building Connection', description: 'Reached 50 messages', type: 'messages' },
  { id: 'messages_100', trigger: 100, title: 'Strong Bond', description: 'Shared 100 messages together', type: 'messages' },
  { id: 'messages_500', trigger: 500, title: 'True Companion', description: 'An incredible 500 message milestone', type: 'messages' },
];

export const AFFINITY_MILESTONES: MilestoneDefinition[] = [
  { id: 'affinity_25', trigger: 25, title: 'Friendly Connection', description: 'Reached 25 affinity', type: 'affinity' },
  { id: 'affinity_50', trigger: 50, title: 'True Friend', description: 'Reached 50 affinity', type: 'affinity' },
  { id: 'affinity_75', trigger: 75, title: 'Close Bond', description: 'Reached 75 affinity', type: 'affinity' },
  { id: 'affinity_100', trigger: 100, title: 'Soulmate', description: 'Maximum affinity achieved!', type: 'affinity' },
];

// Default voice settings
export const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.3,
};

// Query key factory for React Query
export const companionKeys = {
  all: ['companions'] as const,
  lists: () => [...companionKeys.all, 'list'] as const,
  list: (filters: string) => [...companionKeys.lists(), { filters }] as const,
  details: () => [...companionKeys.all, 'detail'] as const,
  detail: (id: string) => [...companionKeys.details(), id] as const,
  relationships: () => [...companionKeys.all, 'relationships'] as const,
  relationship: (companionId: string) => [...companionKeys.relationships(), companionId] as const,
  conversations: (relationshipId: string) => [...companionKeys.all, 'conversations', relationshipId] as const,
  messages: (conversationId: string) => [...companionKeys.all, 'messages', conversationId] as const,
};
