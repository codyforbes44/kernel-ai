// Emotion extraction utilities

// Extract emotion tags from companion response
export function extractEmotionTags(response: string, personalityType: string): string[] {
  const emotions: string[] = [];
  
  // Common emotion patterns
  if (/😊|happy|glad|joy|wonderful|excited/i.test(response)) emotions.push('happy');
  if (/🤔|hmm|interesting|curious|wonder/i.test(response)) emotions.push('curious');
  if (/sorry|sad|unfortunate|difficult/i.test(response)) emotions.push('empathetic');
  if (/!{2,}|amazing|incredible|wow/i.test(response)) emotions.push('excited');
  if (/\?.*\?|really\?|tell me more/i.test(response)) emotions.push('inquisitive');
  if (/😄|haha|lol|funny|joke/i.test(response)) emotions.push('playful');
  
  // Personality-specific defaults
  if (emotions.length === 0) {
    switch (personalityType) {
      case 'mentor': emotions.push('thoughtful'); break;
      case 'creative': emotions.push('playful'); break;
      case 'analytical': emotions.push('focused'); break;
      case 'supportive': emotions.push('warm'); break;
      default: emotions.push('neutral');
    }
  }
  
  return emotions;
}
