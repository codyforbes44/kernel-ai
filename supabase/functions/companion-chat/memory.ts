// Memory extraction and management utilities

// Extract memorable facts from conversation for memory context
export function extractMemoryUpdates(userMessage: string, existingMemory: Record<string, any>): Record<string, any> {
  const updates: Record<string, any> = { ...existingMemory };
  
  // Name patterns
  const nameMatch = userMessage.match(/(?:my name is|i'm called|call me) (\w+)/i);
  if (nameMatch) updates.user_name = nameMatch[1];
  
  // Goal patterns
  const goalMatch = userMessage.match(/(?:i want to|my goal is|i'm trying to|i need to) (.+?)(?:\.|$)/i);
  if (goalMatch) {
    updates.goals = updates.goals || [];
    if (!updates.goals.includes(goalMatch[1])) {
      updates.goals = [...updates.goals.slice(-4), goalMatch[1]];
    }
  }
  
  // Interest patterns
  const interestMatch = userMessage.match(/(?:i love|i like|i enjoy|interested in) (.+?)(?:\.|$)/i);
  if (interestMatch) {
    updates.interests = updates.interests || [];
    if (!updates.interests.includes(interestMatch[1])) {
      updates.interests = [...updates.interests.slice(-4), interestMatch[1]];
    }
  }
  
  // Update last topics discussed
  updates.last_topics = updates.last_topics || [];
  const words = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 5);
  if (words.length > 0) {
    updates.last_topics = [...new Set([...words.slice(0, 3), ...updates.last_topics])].slice(0, 10);
  }
  
  return updates;
}
