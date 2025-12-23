/**
 * @deprecated This file is deprecated. Use the hooks from @/hooks/useStaticData instead:
 * - useTutorials() - Fetches all tutorials
 * - useTutorial(slug) - Fetches a single tutorial by slug
 * 
 * Tutorial data is now loaded from /public/data/tutorials.json
 */

import { Rocket, Code, Database, Shield, Palette, Zap } from 'lucide-react';

// Legacy type exports for backward compatibility
export interface TutorialStep {
  title: string;
  content: string;
  codeExample?: {
    language: string;
    code: string;
    filename?: string;
  };
  tip?: string;
  warning?: string;
}

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  type: 'video' | 'article';
  category: string;
  icon: React.ElementType;
  popular?: boolean;
  prerequisites: string[];
  whatYouWillLearn: string[];
  steps: TutorialStep[];
  nextTutorial?: string;
  prevTutorial?: string;
}

// Icon mapping for converting JSON iconName to component
const iconMap: Record<string, React.ElementType> = {
  Rocket,
  Code,
  Database,
  Shield,
  Palette,
  Zap,
};

/**
 * @deprecated Use useTutorials() hook instead
 */
export const tutorials: Tutorial[] = [];

/**
 * @deprecated Use useTutorial(slug) hook instead
 */
export const getTutorialBySlug = (slug: string): Tutorial | undefined => {
  console.warn('getTutorialBySlug is deprecated. Use useTutorial(slug) hook from @/hooks/useStaticData instead.');
  return undefined;
};

/**
 * @deprecated Related tutorials are now computed in the TutorialDetail component
 */
export const getRelatedTutorials = (currentTutorial: Tutorial, limit = 3): Tutorial[] => {
  console.warn('getRelatedTutorials is deprecated. Related tutorials are now computed in the TutorialDetail component.');
  return [];
};

// Export icon map for components that need to convert iconName to component
export { iconMap };
