import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, Trophy, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { WORD_CATEGORIES } from '@/constants/activities';
import { cn } from '@/lib/utils';
import type { CompanionProfile } from '@/types/companion';

interface WordGameProps {
  companion: CompanionProfile;
  onComplete: (score: number, maxScore: number) => void;
  onCancel: () => void;
}

const ROUNDS = 5;
const TIME_LIMIT = 15; // seconds per round

export function WordGame({ companion, onComplete, onCancel }: WordGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'waiting' | 'finished'>('ready');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [wordHistory, setWordHistory] = useState<{ word: string; player: 'user' | 'companion' }[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [category, setCategory] = useState<typeof WORD_CATEGORIES[0] | null>(null);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = useCallback(() => {
    const randomCategory = WORD_CATEGORIES[Math.floor(Math.random() * WORD_CATEGORIES.length)];
    const startWord = randomCategory.words[Math.floor(Math.random() * randomCategory.words.length)];
    
    setCategory(randomCategory);
    setCurrentWord(startWord);
    setWordHistory([{ word: startWord, player: 'companion' }]);
    setRound(1);
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setGameState('playing');
    setFeedback({ type: 'info', message: `${companion.name} starts with "${startWord}"` });
  }, [companion.name]);

  const handleTimeout = useCallback(() => {
    if (round >= ROUNDS) {
      setGameState('finished');
    } else {
      setFeedback({ type: 'error', message: 'Time\'s up!' });
      setRound((r) => r + 1);
      
      // Companion's turn
      setTimeout(() => {
        const companionWord = generateCompanionWord();
        setCurrentWord(companionWord);
        setWordHistory((h) => [...h, { word: companionWord, player: 'companion' }]);
        setTimeLeft(TIME_LIMIT);
        setFeedback({ type: 'info', message: `${companion.name} says "${companionWord}"` });
      }, 1000);
    }
  }, [round, companion.name]);

  const generateCompanionWord = useCallback((): string => {
    // Simple word association - in a real app, this could use AI
    const associatedWords = category?.words || WORD_CATEGORIES[0].words;
    const usedWords = wordHistory.map((h) => h.word.toLowerCase());
    const available = associatedWords.filter((w) => !usedWords.includes(w.toLowerCase()));
    
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
    
    // Fallback to any category
    const allWords = WORD_CATEGORIES.flatMap((c) => c.words);
    const fallback = allWords.filter((w) => !usedWords.includes(w.toLowerCase()));
    return fallback[Math.floor(Math.random() * fallback.length)] || 'continue';
  }, [category, wordHistory]);

  const isValidAssociation = useCallback((word: string): boolean => {
    // Check if not already used
    if (wordHistory.some((h) => h.word.toLowerCase() === word.toLowerCase())) {
      return false;
    }
    
    // Simple validation - word should be at least 2 characters
    if (word.length < 2) return false;
    
    // In a real app, you could validate with an API or word list
    return true;
  }, [wordHistory]);

  const handleSubmit = useCallback(() => {
    const word = userInput.trim().toLowerCase();
    
    if (!word) return;
    
    if (!isValidAssociation(word)) {
      setFeedback({ type: 'error', message: 'Word already used or invalid!' });
      return;
    }

    // Valid word - add points and continue
    setScore((s) => s + 1);
    setWordHistory((h) => [...h, { word, player: 'user' }]);
    setUserInput('');
    setFeedback({ type: 'success', message: 'Great association!' });

    if (round >= ROUNDS) {
      setTimeout(() => setGameState('finished'), 500);
      return;
    }

    // Companion's turn
    setGameState('waiting');
    setTimeout(() => {
      const companionWord = generateCompanionWord();
      setCurrentWord(companionWord);
      setWordHistory((h) => [...h, { word: companionWord, player: 'companion' }]);
      setRound((r) => r + 1);
      setTimeLeft(TIME_LIMIT);
      setGameState('playing');
      setFeedback({ type: 'info', message: `${companion.name} says "${companionWord}"` });
    }, 1000);
  }, [userInput, isValidAssociation, round, generateCompanionWord, companion.name]);

  if (gameState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <CardTitle>Word Association</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Take turns saying words that connect to the previous one. 
            The faster you respond, the better!
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline" className="gap-1">
              <Trophy className="h-3 w-3" /> {ROUNDS} rounds
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" /> {TIME_LIMIT}s per turn
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
    const performance = score / ROUNDS;
    const rating = performance >= 0.8 ? 'Amazing!' : performance >= 0.6 ? 'Great job!' : performance >= 0.4 ? 'Good effort!' : 'Keep practicing!';

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
              🏆
            </motion.div>
            <CardTitle>Game Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {score} / {ROUNDS}
            </div>
            <p className="text-muted-foreground">{rating}</p>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Word Chain:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {wordHistory.map((h, i) => (
                  <Badge
                    key={i}
                    variant={h.player === 'user' ? 'default' : 'secondary'}
                  >
                    {h.word}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" onClick={onCancel}>
                Done
              </Button>
              <Button onClick={() => onComplete(score, ROUNDS)} className="gap-2">
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
          <CardTitle className="text-base">Round {round} / {ROUNDS}</CardTitle>
          <Badge variant="outline" className="tabular-nums">
            Score: {score}
          </Badge>
        </div>
        <Progress value={(timeLeft / TIME_LIMIT) * 100} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current word display */}
        <motion.div
          key={currentWord}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 bg-muted rounded-xl text-center"
        >
          <p className="text-sm text-muted-foreground mb-1">Current word:</p>
          <p className="text-2xl font-bold">{currentWord}</p>
        </motion.div>

        {/* Feedback */}
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                'text-center text-sm p-2 rounded-lg',
                feedback.type === 'success' && 'bg-green-500/10 text-green-600',
                feedback.type === 'error' && 'bg-destructive/10 text-destructive',
                feedback.type === 'info' && 'bg-primary/10 text-primary'
              )}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User input */}
        {gameState === 'playing' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex gap-2"
          >
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type an associated word..."
              autoFocus
              disabled={gameState !== 'playing'}
            />
            <Button type="submit" disabled={!userInput.trim()}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {gameState === 'waiting' && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
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
