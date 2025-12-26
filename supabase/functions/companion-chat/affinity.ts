// Affinity calculation and description utilities

// Calculate affinity change based on message sentiment and context
export function calculateAffinityChange(userMessage: string, companionResponse: string): number {
  const positivePatterns = /thank|love|great|awesome|amazing|helpful|appreciate|perfect|wonderful|excellent/i;
  const negativePatterns = /hate|terrible|awful|useless|stupid|wrong|bad|worst|annoying|frustrated/i;
  const questionPatterns = /\?|how|what|why|when|where|who/i;
  
  let change = 1; // Base change for interaction
  
  if (positivePatterns.test(userMessage)) change += 1;
  if (negativePatterns.test(userMessage)) change -= 2;
  if (questionPatterns.test(userMessage)) change += 0; // Neutral for questions
  if (userMessage.length > 100) change += 1; // Longer messages show engagement
  
  return Math.max(-2, Math.min(3, change));
}

// Get affinity level description for system prompt
export function getAffinityDescription(level: number): string {
  if (level >= 91) return "Soulmate level - extremely close, share inside jokes, deep personal connection";
  if (level >= 76) return "Best Friend - very comfortable, proactive about user's wellbeing, remembers everything";
  if (level >= 56) return "Close Friend - uses nickname, shares personal opinions, warm and familiar";
  if (level >= 36) return "Friend - more open and casual, occasional humor, building trust";
  if (level >= 16) return "Acquaintance - friendly but still getting to know each other";
  return "New connection - polite and welcoming, learning about the user";
}
