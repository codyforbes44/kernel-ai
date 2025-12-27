import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, Sparkles, ArrowRight, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STORY_STARTERS } from '@/constants/activities';
import { cn } from '@/lib/utils';
import type { CompanionProfile } from '@/types/companion';

interface StoryGameProps {
  companion: CompanionProfile;
  onComplete: (score: number, maxScore: number) => void;
  onCancel: () => void;
}

const MAX_TURNS = 6;

export function StoryGame({ companion, onComplete, onCancel }: StoryGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'waiting' | 'finished'>('ready');
  const [story, setStory] = useState<{ text: string; author: 'user' | 'companion' }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [turnCount, setTurnCount] = useState(0);

  const startGame = useCallback(() => {
    const starter = STORY_STARTERS[Math.floor(Math.random() * STORY_STARTERS.length)];
    setStory([{ text: starter, author: 'companion' }]);
    setTurnCount(1);
    setGameState('playing');
  }, []);

  const generateCompanionContinuation = useCallback((): string => {
    // Simple story continuations based on companion personality
    const continuations: Record<string, string[]> = {
      mentor: [
        "With wisdom gained from years of experience, they knew exactly what to do next.",
        "The path ahead was challenging, but every challenge is a lesson waiting to be learned.",
        "Sometimes the greatest adventures begin with a single brave decision.",
      ],
      creative: [
        "Colors exploded across the sky as magic filled the air!",
        "In that moment, anything seemed possible - even the impossible.",
        "The world transformed before their eyes in the most unexpected way.",
      ],
      analytical: [
        "After careful consideration, the solution became crystal clear.",
        "Each piece of the puzzle began falling into place, one by one.",
        "The patterns revealed themselves, leading to an incredible discovery.",
      ],
      supportive: [
        "They realized they weren't alone - friends were always there to help.",
        "With a warm smile, they extended their hand in friendship.",
        "Together, they found strength they never knew they had.",
      ],
    };

    const personalityContinuations = continuations[companion.personality_type] || continuations.mentor;
    return personalityContinuations[Math.floor(Math.random() * personalityContinuations.length)];
  }, [companion.personality_type]);

  const handleSubmit = useCallback(() => {
    if (!userInput.trim()) return;

    // Add user's contribution
    setStory((s) => [...s, { text: userInput.trim(), author: 'user' }]);
    setUserInput('');
    setTurnCount((t) => t + 1);

    if (turnCount >= MAX_TURNS) {
      setGameState('finished');
      return;
    }

    // Companion's turn
    setGameState('waiting');
    setTimeout(() => {
      const continuation = generateCompanionContinuation();
      setStory((s) => [...s, { text: continuation, author: 'companion' }]);
      setTurnCount((t) => t + 1);
      
      if (turnCount + 1 >= MAX_TURNS) {
        setGameState('finished');
      } else {
        setGameState('playing');
      }
    }, 1500);
  }, [userInput, turnCount, generateCompanionContinuation]);

  if (gameState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">📖</div>
          <CardTitle>Story Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Create a story together with {companion.name}! 
            Take turns adding to the tale.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline" className="gap-1">
              <BookOpen className="h-3 w-3" /> {MAX_TURNS} turns
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Trophy className="h-3 w-3" /> Collaborative
            </Badge>
          </div>
          <div className="flex gap-2 justify-center pt-4">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={startGame} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Begin Story
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'finished') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-5xl mb-2"
            >
              ✨
            </motion.div>
            <CardTitle>Story Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-48 rounded-lg border p-4">
              <div className="space-y-2">
                {story.map((part, i) => (
                  <p 
                    key={i} 
                    className={cn(
                      'text-sm',
                      part.author === 'companion' && 'text-primary'
                    )}
                  >
                    {part.text}
                  </p>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm">
                {companion.name}: "What a wonderful story we created together! 
                I loved every moment of it. 💫"
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <Button variant="outline" onClick={onCancel}>
                Done
              </Button>
              <Button onClick={() => onComplete(story.length, MAX_TURNS)} className="gap-2">
                Claim Reward
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Turn {turnCount} / {MAX_TURNS}</CardTitle>
          <Badge variant="outline">
            {gameState === 'playing' ? 'Your turn' : `${companion.name}'s turn`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Story so far */}
        <ScrollArea className="h-40 rounded-lg border p-4 bg-muted/30">
          <div className="space-y-2">
            {story.map((part, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'text-sm',
                  part.author === 'companion' && 'text-primary font-medium'
                )}
              >
                {part.text}
              </motion.p>
            ))}
            
            {gameState === 'waiting' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground italic"
              >
                {companion.name} is writing...
              </motion.p>
            )}
          </div>
        </ScrollArea>

        {/* User input */}
        {gameState === 'playing' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-3"
          >
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Continue the story..."
              className="min-h-[80px] resize-none"
              maxLength={200}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {userInput.length}/200
              </span>
              <Button type="submit" disabled={!userInput.trim()} className="gap-2">
                <Send className="h-4 w-4" />
                Add to Story
              </Button>
            </div>
          </form>
        )}

        {gameState === 'waiting' && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RotateCcw className="h-4 w-4" />
            </motion.div>
            <span>{companion.name} is thinking...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
