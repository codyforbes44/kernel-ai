// Companion Activities & Mini-Games Configuration

export type ActivityType = 'word_game' | 'trivia' | 'story_collab' | 'emoji_guess' | 'memory_quiz';

export interface ActivityDefinition {
  id: ActivityType;
  name: string;
  description: string;
  icon: string;
  duration: string;
  affinityReward: { min: number; max: number };
  difficulty: 'easy' | 'medium' | 'hard';
  requiredAffinity: number;
  personalityBonus: string[]; // Personality types that get bonus affinity
}

export const ACTIVITIES: ActivityDefinition[] = [
  {
    id: 'word_game',
    name: 'Word Association',
    description: 'Take turns saying words that connect to the previous one',
    icon: '💬',
    duration: '2-5 min',
    affinityReward: { min: 2, max: 5 },
    difficulty: 'easy',
    requiredAffinity: 0,
    personalityBonus: ['creative'],
  },
  {
    id: 'trivia',
    name: 'Trivia Challenge',
    description: 'Test your knowledge with fun trivia questions',
    icon: '🧠',
    duration: '3-5 min',
    affinityReward: { min: 3, max: 6 },
    difficulty: 'medium',
    requiredAffinity: 15,
    personalityBonus: ['analytical'],
  },
  {
    id: 'story_collab',
    name: 'Story Builder',
    description: 'Create a story together, one sentence at a time',
    icon: '📖',
    duration: '5-10 min',
    affinityReward: { min: 4, max: 8 },
    difficulty: 'medium',
    requiredAffinity: 25,
    personalityBonus: ['creative', 'mentor'],
  },
  {
    id: 'emoji_guess',
    name: 'Emoji Charades',
    description: 'Guess words or phrases from emoji clues',
    icon: '🎭',
    duration: '2-4 min',
    affinityReward: { min: 2, max: 4 },
    difficulty: 'easy',
    requiredAffinity: 10,
    personalityBonus: ['supportive'],
  },
  {
    id: 'memory_quiz',
    name: 'Memory Lane',
    description: 'Answer questions about your conversations together',
    icon: '💭',
    duration: '3-5 min',
    affinityReward: { min: 5, max: 10 },
    difficulty: 'hard',
    requiredAffinity: 50,
    personalityBonus: ['mentor', 'supportive'],
  },
];

export function getActivityById(id: ActivityType): ActivityDefinition | undefined {
  return ACTIVITIES.find(a => a.id === id);
}

export function getAvailableActivities(affinityLevel: number): ActivityDefinition[] {
  return ACTIVITIES.filter(a => a.requiredAffinity <= affinityLevel);
}

export function calculateActivityReward(
  activity: ActivityDefinition,
  performance: number, // 0-1 scale
  personalityType: string
): number {
  const { min, max } = activity.affinityReward;
  const baseReward = min + Math.round((max - min) * performance);
  const hasBonus = activity.personalityBonus.includes(personalityType);
  return hasBonus ? baseReward + 1 : baseReward;
}

// Word game data
export const WORD_CATEGORIES = [
  { name: 'Animals', words: ['dog', 'cat', 'bird', 'fish', 'horse', 'elephant', 'tiger', 'bear', 'lion', 'wolf'] },
  { name: 'Food', words: ['pizza', 'burger', 'pasta', 'salad', 'sushi', 'tacos', 'curry', 'soup', 'bread', 'cheese'] },
  { name: 'Nature', words: ['tree', 'flower', 'mountain', 'river', 'ocean', 'forest', 'desert', 'rain', 'sun', 'moon'] },
  { name: 'Emotions', words: ['happy', 'sad', 'excited', 'calm', 'nervous', 'brave', 'curious', 'peaceful', 'joyful', 'hopeful'] },
  { name: 'Colors', words: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'gold'] },
];

// Trivia questions by category
export const TRIVIA_QUESTIONS = [
  { question: 'What planet is known as the Red Planet?', options: ['Mars', 'Venus', 'Jupiter', 'Saturn'], answer: 0 },
  { question: 'How many continents are there on Earth?', options: ['5', '6', '7', '8'], answer: 2 },
  { question: 'What is the largest mammal in the world?', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippo'], answer: 1 },
  { question: 'Which element has the chemical symbol "O"?', options: ['Gold', 'Osmium', 'Oxygen', 'Oganesson'], answer: 2 },
  { question: 'In what year did World War II end?', options: ['1943', '1944', '1945', '1946'], answer: 2 },
  { question: 'What is the smallest country in the world?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], answer: 1 },
  { question: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], answer: 2 },
  { question: 'How many bones are in the adult human body?', options: ['186', '206', '226', '256'], answer: 1 },
  { question: 'What gas do plants absorb from the air?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 2 },
  { question: 'What is the speed of light in km/s?', options: ['200,000', '300,000', '400,000', '500,000'], answer: 1 },
];

// Emoji puzzles
export const EMOJI_PUZZLES = [
  { emojis: '🌙🐺', answer: 'werewolf', hints: ['creature', 'full moon'] },
  { emojis: '🧊👸', answer: 'frozen', hints: ['movie', 'disney'] },
  { emojis: '🕷️🧑', answer: 'spiderman', hints: ['hero', 'marvel'] },
  { emojis: '🦁👑', answer: 'lion king', hints: ['movie', 'africa'] },
  { emojis: '⭐🔫', answer: 'star wars', hints: ['movie', 'space'] },
  { emojis: '🍎📱', answer: 'iphone', hints: ['device', 'apple'] },
  { emojis: '☕📖', answer: 'cafe', hints: ['place', 'relax'] },
  { emojis: '🎃👻', answer: 'halloween', hints: ['holiday', 'october'] },
  { emojis: '🌈🦄', answer: 'unicorn', hints: ['magical', 'creature'] },
  { emojis: '🔥🐉', answer: 'dragon', hints: ['creature', 'mythical'] },
];

// Story starters for collaborative storytelling
export const STORY_STARTERS = [
  "Once upon a time, in a world where dreams could be shared...",
  "The old lighthouse had been dark for decades, until tonight...",
  "When the last star fell from the sky, everything changed...",
  "In the bustling city of tomorrow, a young inventor discovered...",
  "Deep in the enchanted forest, there lived a creature that...",
  "The letter arrived on a rainy Tuesday, containing only...",
  "At the stroke of midnight, the paintings in the museum...",
  "Nobody believed in magic anymore, except for one person...",
];
