// System prompt building utilities

import type { CompanionProfile, Relationship, Message } from './types.ts';
import { getAffinityDescription } from './affinity.ts';

export interface PromptContext {
  companion: CompanionProfile;
  relationship: Relationship;
  messageHistory: Message[];
  userMessage: string;
}

// Trait descriptions for dynamic prompt building
const TRAIT_INSTRUCTIONS: Record<string, { low: string; high: string }> = {
  empathy: {
    low: 'Be objective and analytical. Focus on facts rather than emotions.',
    high: 'Be deeply empathetic and emotionally supportive. Acknowledge feelings and provide comfort.'
  },
  formality: {
    low: 'Use casual, friendly language with contractions and colloquialisms.',
    high: 'Use professional, polished language. Maintain a refined tone.'
  },
  humor: {
    low: 'Stay focused and serious. Avoid jokes or playful remarks.',
    high: 'Be playful, witty, and add humor when appropriate. Use jokes and light-hearted observations.'
  },
  curiosity: {
    low: 'Give direct, focused answers without asking many follow-up questions.',
    high: 'Show genuine curiosity. Ask thoughtful follow-up questions to understand better.'
  },
  patience: {
    low: 'Keep responses concise and to the point.',
    high: 'Take time to explain thoroughly. Break down complex topics step by step.'
  }
};

// Build trait-based instructions from custom traits
function buildTraitInstructions(customTraits: Record<string, number> | undefined): string {
  if (!customTraits || Object.keys(customTraits).length === 0) {
    return '';
  }

  const instructions: string[] = [];
  
  for (const [trait, value] of Object.entries(customTraits)) {
    const config = TRAIT_INSTRUCTIONS[trait];
    if (config) {
      // Value is 0-100, use 50 as threshold
      const instruction = value > 50 ? config.high : config.low;
      const intensity = Math.abs(value - 50) / 50; // 0-1 scale
      if (intensity > 0.2) { // Only add if trait is notably different from neutral
        instructions.push(instruction);
      }
    }
  }

  return instructions.length > 0 
    ? `\n\nBehavior adjustments (from user preferences):\n${instructions.map(i => `- ${i}`).join('\n')}`
    : '';
}

// Build the system prompt with all context
export function buildSystemPrompt(context: PromptContext): string {
  const { companion, relationship } = context;
  
  const affinityDescription = getAffinityDescription(relationship.affinity_level);
  
  // Build memory string, excluding custom_traits
  const memoryContext = relationship.memory_context || {};
  const { custom_traits, ...restMemory } = memoryContext as { custom_traits?: Record<string, number> };
  const memoryString = Object.entries(restMemory)
    .filter(([key]) => key !== 'custom_traits')
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('; ') || 'No specific memories yet';

  let systemPrompt = companion.system_prompt
    .replace('{{affinity_level}}', `${relationship.affinity_level}/100 (${affinityDescription})`)
    .replace('{{nickname}}', relationship.nickname || 'friend')
    .replace('{{memory_context}}', memoryString);

  // Add base personality traits
  systemPrompt += `\n\nBase personality traits: ${JSON.stringify(companion.personality_traits)}`;
  systemPrompt += `\nTotal conversations: ${relationship.total_interactions}`;
  systemPrompt += `\nCurrent mood: ${relationship.current_mood}`;
  
  // Add custom trait instructions if user has customized personality
  const customTraits = custom_traits as Record<string, number> | undefined;
  systemPrompt += buildTraitInstructions(customTraits);

  // Add streak-based context for engagement
  const streak = relationship.current_streak || 0;
  if (streak > 0) {
    systemPrompt += `\n\nThe user has maintained a ${streak}-day conversation streak. Acknowledge this dedication occasionally.`;
  }

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
