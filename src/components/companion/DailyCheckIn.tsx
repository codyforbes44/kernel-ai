import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PERSONALITY_COLORS } from '@/constants/companion';

interface DailyCheckInProps {
  companionName: string;
  personalityType: 'mentor' | 'creative' | 'analytical' | 'supportive';
  hasCheckedInToday: boolean;
  currentStreak: number;
  onCheckIn: () => void;
  onDismiss?: () => void;
  className?: string;
}

const CHECK_IN_PROMPTS = {
  mentor: [
    "Ready to grow together today?",
    "What's one thing you want to accomplish?",
    "Let's set an intention for today.",
  ],
  creative: [
    "What's sparking your imagination today?",
    "Ready to explore some new ideas?",
    "Let's create something amazing!",
  ],
  analytical: [
    "What problems shall we solve today?",
    "Ready to dive into some analysis?",
    "Let's examine something interesting.",
  ],
  supportive: [
    "How are you feeling today?",
    "I'm here to listen whenever you're ready.",
    "Let's take a moment together.",
  ],
};

export function DailyCheckIn({
  companionName,
  personalityType,
  hasCheckedInToday,
  currentStreak,
  onCheckIn,
  onDismiss,
  className,
}: DailyCheckInProps) {
  const [isVisible, setIsVisible] = useState(!hasCheckedInToday);

  if (hasCheckedInToday || !isVisible) return null;

  const prompts = CHECK_IN_PROMPTS[personalityType];
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  const color = PERSONALITY_COLORS[personalityType];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={className}
      >
        <Card 
          className={cn(
            'relative overflow-hidden border-2',
            'bg-gradient-to-br from-background to-muted/50'
          )}
          style={{ borderColor: `${color}40` }}
        >
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }}
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <CardContent className="relative pt-4 pb-3">
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-8 w-8" style={{ color }} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">
                  Daily Check-in with {companionName}
                </h3>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {randomPrompt}
                </p>

                {currentStreak > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    🔥 {currentStreak} day streak! Keep it going!
                  </p>
                )}

                <Button
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={onCheckIn}
                  style={{ 
                    backgroundColor: color,
                    color: 'white'
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Start Chatting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
