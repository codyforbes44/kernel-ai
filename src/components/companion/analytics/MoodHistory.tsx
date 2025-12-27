import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CompanionConversation } from '@/types/companion';

interface MoodHistoryProps {
  conversations: CompanionConversation[];
  currentMood: string;
  className?: string;
}

const MOOD_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  happy: { emoji: '😊', color: 'hsl(45, 100%, 50%)', label: 'Happy' },
  excited: { emoji: '🎉', color: 'hsl(340, 100%, 60%)', label: 'Excited' },
  curious: { emoji: '🤔', color: 'hsl(200, 100%, 50%)', label: 'Curious' },
  thoughtful: { emoji: '💭', color: 'hsl(260, 70%, 60%)', label: 'Thoughtful' },
  supportive: { emoji: '🤗', color: 'hsl(140, 70%, 45%)', label: 'Supportive' },
  neutral: { emoji: '😐', color: 'hsl(220, 10%, 50%)', label: 'Neutral' },
  concerned: { emoji: '😟', color: 'hsl(30, 100%, 50%)', label: 'Concerned' },
  empathetic: { emoji: '💝', color: 'hsl(350, 80%, 60%)', label: 'Empathetic' },
  playful: { emoji: '😄', color: 'hsl(280, 80%, 60%)', label: 'Playful' },
  focused: { emoji: '🎯', color: 'hsl(210, 80%, 50%)', label: 'Focused' },
};

export function MoodHistory({ conversations, currentMood, className }: MoodHistoryProps) {
  // Aggregate mood data from conversations
  const moodData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    conversations.forEach(conv => {
      const mood = conv.mood_at_end || conv.mood_at_start || 'neutral';
      counts[mood] = (counts[mood] || 0) + 1;
    });

    // Sort by frequency
    return Object.entries(counts)
      .map(([mood, count]) => ({
        mood,
        count,
        config: MOOD_CONFIG[mood] || MOOD_CONFIG.neutral,
        percentage: Math.round((count / Math.max(conversations.length, 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [conversations]);

  const currentMoodConfig = MOOD_CONFIG[currentMood] || MOOD_CONFIG.neutral;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Mood Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Mood */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <motion.span
            className="text-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentMoodConfig.emoji}
          </motion.span>
          <div>
            <p className="text-sm text-muted-foreground">Current Mood</p>
            <p className="font-semibold" style={{ color: currentMoodConfig.color }}>
              {currentMoodConfig.label}
            </p>
          </div>
        </div>

        {/* Mood Distribution */}
        {moodData.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Mood Distribution
            </p>
            <div className="space-y-2">
              {moodData.map(({ mood, count, config, percentage }, index) => (
                <motion.div
                  key={mood}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-lg w-8">{config.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{config.label}</span>
                      <span className="text-muted-foreground">{count}x</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: config.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Start chatting to see mood patterns
          </p>
        )}
      </CardContent>
    </Card>
  );
}
