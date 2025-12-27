import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TRIVIA_QUESTIONS } from '@/constants/activities';
import { cn } from '@/lib/utils';
import type { CompanionProfile } from '@/types/companion';

interface TriviaGameProps {
  companion: CompanionProfile;
  onComplete: (score: number, maxScore: number) => void;
  onCancel: () => void;
}

const QUESTIONS_PER_GAME = 5;
const TIME_PER_QUESTION = 20;

export function TriviaGame({ companion, onComplete, onCancel }: TriviaGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result' | 'finished'>('ready');
  const [questions, setQuestions] = useState<typeof TRIVIA_QUESTIONS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [companionReaction, setCompanionReaction] = useState<string>('');

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || showResult || timeLeft <= 0) return;

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
  }, [gameState, showResult, timeLeft]);

  const startGame = useCallback(() => {
    // Shuffle and pick random questions
    const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, QUESTIONS_PER_GAME));
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(TIME_PER_QUESTION);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameState('playing');
  }, []);

  const getCompanionReaction = (isCorrect: boolean): string => {
    const correctReactions = [
      "Brilliant! You got it! 🎉",
      "That's right! Nice work! ✨",
      "Correct! You're so smart! 🌟",
      "Yes! I knew you'd get it! 💪",
    ];
    const incorrectReactions = [
      "Ooh, so close! 💭",
      "That's a tricky one! 🤔",
      "Don't worry, we're still learning together! 💫",
      "Almost! You'll get the next one! 🌈",
    ];
    
    const reactions = isCorrect ? correctReactions : incorrectReactions;
    return reactions[Math.floor(Math.random() * reactions.length)];
  };

  const handleTimeout = useCallback(() => {
    setShowResult(true);
    setCompanionReaction(getCompanionReaction(false));
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  }, []);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (showResult) return;
    
    const isCorrect = answerIndex === questions[currentIndex].answer;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setCompanionReaction(getCompanionReaction(isCorrect));
    
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  }, [questions, currentIndex, showResult]);

  const nextQuestion = useCallback(() => {
    if (currentIndex >= QUESTIONS_PER_GAME - 1) {
      setGameState('finished');
    } else {
      setCurrentIndex((i) => i + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentIndex]);

  if (gameState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <CardTitle>Trivia Challenge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Test your knowledge with {QUESTIONS_PER_GAME} trivia questions! 
            Answer quickly for bonus points.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline" className="gap-1">
              <Trophy className="h-3 w-3" /> {QUESTIONS_PER_GAME} questions
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" /> {TIME_PER_QUESTION}s each
            </Badge>
          </div>
          <div className="flex gap-2 justify-center pt-4">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={startGame} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'finished') {
    const performance = score / QUESTIONS_PER_GAME;
    const rating = performance >= 0.8 ? 'Genius!' : performance >= 0.6 ? 'Well done!' : performance >= 0.4 ? 'Good try!' : 'Keep learning!';

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
              {performance >= 0.6 ? '🏆' : '📚'}
            </motion.div>
            <CardTitle>Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {score} / {QUESTIONS_PER_GAME}
            </div>
            <p className="text-muted-foreground">{rating}</p>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                {companion.name} says: "{performance >= 0.6 
                  ? "That was amazing! I love quizzing with you!" 
                  : "Great effort! We should do this again sometime!"}"
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" onClick={onCancel}>
                Done
              </Button>
              <Button onClick={() => onComplete(score, QUESTIONS_PER_GAME)} className="gap-2">
                Claim Reward
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Question {currentIndex + 1} / {QUESTIONS_PER_GAME}</CardTitle>
          <Badge variant="outline" className="tabular-nums">
            Score: {score}
          </Badge>
        </div>
        <Progress value={(timeLeft / TIME_PER_QUESTION) * 100} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question */}
        <motion.div
          key={currentIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="p-4 bg-muted rounded-xl"
        >
          <p className="font-medium text-center">{currentQuestion.question}</p>
        </motion.div>

        {/* Companion reaction */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-muted-foreground"
            >
              {companion.name}: {companionReaction}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer options */}
        <div className="grid gap-2">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.answer;
            const isSelected = index === selectedAnswer;
            
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all flex items-center gap-2',
                  !showResult && 'hover:bg-muted hover:border-primary/50 cursor-pointer',
                  showResult && isCorrect && 'bg-green-500/10 border-green-500',
                  showResult && isSelected && !isCorrect && 'bg-destructive/10 border-destructive',
                  showResult && !isCorrect && !isSelected && 'opacity-50'
                )}
              >
                <span className="flex-1">{option}</span>
                {showResult && isCorrect && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Timer warning */}
        {!showResult && timeLeft <= 5 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="text-center text-destructive font-medium"
          >
            ⏰ {timeLeft}s remaining!
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
