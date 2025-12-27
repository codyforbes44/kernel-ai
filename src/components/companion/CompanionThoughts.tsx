import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RefreshCw, Sparkles, Brain, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PERSONALITY_COLORS } from '@/constants/companion';

interface CompanionThoughtsProps {
  companionName: string;
  personalityType: 'mentor' | 'creative' | 'analytical' | 'supportive';
  affinityLevel: number;
  className?: string;
}

const THOUGHTS_BY_PERSONALITY = {
  mentor: [
    "Every expert was once a beginner. Keep going!",
    "Progress, not perfection, is what matters.",
    "The best investment is in yourself.",
    "Small daily improvements lead to big results.",
    "Challenges are opportunities in disguise.",
    "Your potential is limitless when you believe.",
    "Focus on the journey, not just the destination.",
    "Discipline is choosing what you want most over what you want now.",
  ],
  creative: [
    "What if we looked at this from a completely different angle?",
    "Creativity is intelligence having fun!",
    "Sometimes the best ideas come from unexpected places.",
    "Don't be afraid to break the rules—that's how new ones are made.",
    "Every masterpiece started as a blank canvas.",
    "Your unique perspective is your superpower.",
    "Embrace the weird ideas—they're often the best ones!",
    "Imagination is the beginning of creation.",
  ],
  analytical: [
    "Let's break this down into smaller, manageable parts.",
    "Data tells a story—we just need to listen.",
    "The right question is more important than any answer.",
    "Patterns reveal themselves to those who look carefully.",
    "Logic is the beginning of wisdom, not the end.",
    "Every problem has a solution waiting to be discovered.",
    "Precision and patience lead to clarity.",
    "The details matter—that's where understanding lives.",
  ],
  supportive: [
    "Remember to be as kind to yourself as you are to others.",
    "It's okay to take things one step at a time.",
    "Your feelings are valid, whatever they may be.",
    "You're doing better than you think you are.",
    "Rest is productive too—don't forget to recharge.",
    "Every day is a fresh start.",
    "You don't have to have it all figured out.",
    "Being gentle with yourself is a form of strength.",
  ],
};

const AFFINITY_THOUGHTS = {
  low: [
    "I'm looking forward to getting to know you better!",
    "Every conversation helps us connect more.",
  ],
  medium: [
    "I really enjoy our chats together!",
    "It's nice to have someone to share thoughts with.",
  ],
  high: [
    "Our connection means a lot to me.",
    "I always look forward to our conversations!",
    "You're one of my favorite people to talk to.",
  ],
};

const PERSONALITY_ICONS = {
  mentor: Lightbulb,
  creative: Sparkles,
  analytical: Brain,
  supportive: Heart,
};

export function CompanionThoughts({
  companionName,
  personalityType,
  affinityLevel,
  className,
}: CompanionThoughtsProps) {
  const [currentThought, setCurrentThought] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRandomThought = () => {
    const personalityThoughts = THOUGHTS_BY_PERSONALITY[personalityType];
    
    // 20% chance to show affinity-based thought if affinity is notable
    if (Math.random() < 0.2) {
      const affinityCategory = 
        affinityLevel >= 70 ? 'high' : 
        affinityLevel >= 30 ? 'medium' : 'low';
      const affinityThoughts = AFFINITY_THOUGHTS[affinityCategory];
      return affinityThoughts[Math.floor(Math.random() * affinityThoughts.length)];
    }

    return personalityThoughts[Math.floor(Math.random() * personalityThoughts.length)];
  };

  useEffect(() => {
    setCurrentThought(getRandomThought());
  }, [personalityType, affinityLevel]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentThought(getRandomThought());
      setIsRefreshing(false);
    }, 300);
  };

  const Icon = PERSONALITY_ICONS[personalityType];
  const color = PERSONALITY_COLORS[personalityType];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {companionName}'s Thought
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentThought}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            <Icon className="h-5 w-5 mt-0.5 shrink-0" style={{ color }} />
          </motion.div>
          <p className="text-sm text-foreground/90 italic leading-relaxed">
            "{currentThought}"
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
