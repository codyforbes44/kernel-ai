import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Trophy, Sparkles, ArrowRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EMOJI_PUZZLES } from '@/constants/activities';
import { cn } from '@/lib/utils';
import type { CompanionProfile } from '@/types/companion';

interface EmojiGameProps {
  companion: CompanionProfile;
  onComplete: (score: number, maxScore: number) => void;
  onCancel: () => void;
}

const PUZZLES_PER_GAME = 5;

export function EmojiGame({ companion, onComplete, onCancel }: EmojiGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [puzzles, setPuzzles] = useState<typeof EMOJI_PUZZLES>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [attempts, setAttempts] = useState(0);

  const startGame = useCallback(() => {
    const shuffled = [...EMOJI_PUZZLES].sort(() => Math.random() - 0.5);
    setPuzzles(shuffled.slice(0, PUZZLES_PER_GAME));
    setCurrentIndex(0);
    setScore(0);
    setHintsUsed(0);
    setCurrentHintIndex(-1);
    setAttempts(0);
    setShowResult(null);
    setGameState('playing');
  }, []);

  const checkAnswer = useCallback((guess: string): boolean => {
    const answer = puzzles[currentIndex].answer.toLowerCase();
    const normalizedGuess = guess.toLowerCase().trim();
    
    // Exact match or close enough (allow spaces/hyphens)
    return normalizedGuess === answer || 
           normalizedGuess.replace(/[\s-]/g, '') === answer.replace(/[\s-]/g, '');
  }, [puzzles, currentIndex]);

  const handleGuess = useCallback(() => {
    if (!userGuess.trim()) return;

    const isCorrect = checkAnswer(userGuess);
    setAttempts((a) => a + 1);

    if (isCorrect) {
      // Points based on hints used and attempts
      const points = Math.max(1, 3 - hintsUsed - Math.floor(attempts / 2));
      setScore((s) => s + points);
      setShowResult('correct');
      
      setTimeout(() => {
        nextPuzzle();
      }, 1500);
    } else if (attempts >= 2) {
      setShowResult('wrong');
      setTimeout(() => {
        nextPuzzle();
      }, 2000);
    } else {
      // Wrong guess, try again
      setShowResult('wrong');
      setTimeout(() => {
        setShowResult(null);
        setUserGuess('');
      }, 1000);
    }
  }, [userGuess, checkAnswer, hintsUsed, attempts]);

  const useHint = useCallback(() => {
    const puzzle = puzzles[currentIndex];
    if (currentHintIndex < puzzle.hints.length - 1) {
      setCurrentHintIndex((i) => i + 1);
      setHintsUsed((h) => h + 1);
    }
  }, [puzzles, currentIndex, currentHintIndex]);

  const nextPuzzle = useCallback(() => {
    if (currentIndex >= PUZZLES_PER_GAME - 1) {
      setGameState('finished');
    } else {
      setCurrentIndex((i) => i + 1);
      setUserGuess('');
      setCurrentHintIndex(-1);
      setAttempts(0);
      setShowResult(null);
    }
  }, [currentIndex]);

  if (gameState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🎭</div>
          <CardTitle>Emoji Charades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Guess the word or phrase from the emoji clues! 
            Use hints if you're stuck, but they'll cost you points.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline" className="gap-1">
              <Trophy className="h-3 w-3" /> {PUZZLES_PER_GAME} puzzles
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Lightbulb className="h-3 w-3" /> Hints available
            </Badge>
          </div>
          <div className="flex gap-2 justify-center pt-4">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={startGame} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'finished') {
    const maxPossibleScore = PUZZLES_PER_GAME * 3;
    const performance = score / maxPossibleScore;
    const rating = performance >= 0.7 ? 'Emoji Master!' : performance >= 0.4 ? 'Great guessing!' : 'Keep practicing!';

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
              🎉
            </motion.div>
            <CardTitle>Game Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {score} points
            </div>
            <p className="text-muted-foreground">{rating}</p>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                {companion.name}: "That was so fun! 
                {score >= maxPossibleScore * 0.5 
                  ? " You're really good at reading emojis!" 
                  : " Let's play again sometime!"}"
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" onClick={onCancel}>
                Done
              </Button>
              <Button onClick={() => onComplete(score, maxPossibleScore)} className="gap-2">
                Claim Reward
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const currentPuzzle = puzzles[currentIndex];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Puzzle {currentIndex + 1} / {PUZZLES_PER_GAME}</CardTitle>
          <Badge variant="outline" className="tabular-nums">
            Score: {score}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emoji display */}
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 bg-muted rounded-xl text-center"
        >
          <p className="text-5xl">{currentPuzzle.emojis}</p>
        </motion.div>

        {/* Hints */}
        {currentHintIndex >= 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              {currentPuzzle.hints.slice(0, currentHintIndex + 1).map((hint, i) => (
                <Badge key={i} variant="secondary">
                  💡 {hint}
                </Badge>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'text-center p-2 rounded-lg font-medium',
                showResult === 'correct' && 'bg-green-500/10 text-green-600',
                showResult === 'wrong' && 'bg-destructive/10 text-destructive'
              )}
            >
              {showResult === 'correct' ? (
                <>✨ Correct! It's "{currentPuzzle.answer}"</>
              ) : attempts >= 2 ? (
                <>The answer was "{currentPuzzle.answer}"</>
              ) : (
                <>Not quite, try again!</>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        {!showResult && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGuess();
            }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <Input
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Type your guess..."
                autoFocus
              />
              <Button type="submit" disabled={!userGuess.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={useHint}
              disabled={currentHintIndex >= currentPuzzle.hints.length - 1}
            >
              <Lightbulb className="h-4 w-4" />
              {currentHintIndex >= currentPuzzle.hints.length - 1 
                ? 'No more hints' 
                : `Use Hint (${currentPuzzle.hints.length - currentHintIndex - 1} left)`}
            </Button>
          </form>
        )}

        {/* Attempt counter */}
        {!showResult && attempts > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Attempt {attempts + 1} of 3
          </p>
        )}
      </CardContent>
    </Card>
  );
}
