// System prompt building utilities

import type { CompanionProfile, Relationship, Message } from './types.ts';
import { getAffinityDescription } from './affinity.ts';

export interface PromptContext {
  companion: CompanionProfile;
  relationship: Relationship;
  messageHistory: Message[];
  userMessage: string;
}

// Build the system prompt with all context
export function buildSystemPrompt(context: PromptContext): string {
  const { companion, relationship } = context;
  
  const affinityDescription = getAffinityDescription(relationship.affinity_level);
  const memoryString = Object.entries(relationship.memory_context || {})
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('; ') || 'No specific memories yet';

  let systemPrompt = companion.system_prompt
    .replace('{{affinity_level}}', `${relationship.affinity_level}/100 (${affinityDescription})`)
    .replace('{{nickname}}', relationship.nickname || 'friend')
    .replace('{{memory_context}}', memoryString);

  // Add personality-specific instructions
  systemPrompt += `\n\nPersonality traits: ${JSON.stringify(companion.personality_traits)}`;
  systemPrompt += `\nTotal conversations: ${relationship.total_interactions}`;
  systemPrompt += `\nCurrent mood: ${relationship.current_mood}`;

  return systemPrompt;
}

// Build the messages array for the AI API
export function buildApiMessages(context: PromptContext): Array<{ role: string; content: string }> {
  const systemPrompt = buildSystemPrompt(context);
  
  return [
    { role: 'system', content: systemPrompt },
    ...context.messageHistory.map(m => ({
      role: m.role === 'companion' ? 'assistant' : 'user',
      content: m.content
    })),
    { role: 'user', content: context.userMessage }
  ];
}
