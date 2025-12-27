import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { CompanionProfile } from '@/types/companion';

interface MemoryQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface MemoryGameProps {
  companion: CompanionProfile;
  relationshipId: string;
  onComplete: (score: number, maxScore: number) => void;
  onCancel: () => void;
}

export function MemoryGame({ companion, relationshipId, onComplete, onCancel }: MemoryGameProps) {
  const [questions, setQuestions] = useState<MemoryQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch conversation history for this relationship
      const { data: conversations } = await supabase
        .from('companion_conversations')
        .select('id, title, created_at')
        .eq('relationship_id', relationshipId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!conversations || conversations.length === 0) {
        // No conversation history, generate generic questions
        const genericQuestions: MemoryQuestion[] = [
          {
            question: `What type of personality does ${companion.name} have?`,
            options: ['Mentor', 'Creative', 'Analytical', 'Supportive'],
            correctIndex: ['mentor', 'creative', 'analytical', 'supportive'].indexOf(companion.personality_type),
          },
          {
            question: `What is ${companion.name}'s specialty?`,
            options: [
              'Guidance and teaching',
              'Imaginative thinking',
              'Logical problem-solving',
              'Emotional support'
            ],
            correctIndex: ['mentor', 'creative', 'analytical', 'supportive'].indexOf(companion.personality_type),
          },
          {
            question: `How would you describe your relationship with ${companion.name}?`,
            options: ['Just met', 'Getting to know each other', 'Good friends', 'Best companions'],
            correctIndex: 1, // Dynamic based on actual relationship
          },
        ];
        setQuestions(genericQuestions.slice(0, 3));
        setIsLoading(false);
        return;
      }

      // Fetch some messages from conversations
      const conversationIds = conversations.map(c => c.id);
      const { data: messages } = await supabase
        .from('companion_messages')
        .select('content, role, conversation_id, created_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
        .limit(50);

      // Generate questions based on conversation data
      const generatedQuestions: MemoryQuestion[] = [];

      // Question about number of conversations
      generatedQuestions.push({
        question: `How many conversations have you had with ${companion.name}?`,
        options: [
          'Less than 5',
          '5-10',
          '10-20',
          'More than 20'
        ],
        correctIndex: conversations.length < 5 ? 0 : conversations.length <= 10 ? 1 : conversations.length <= 20 ? 2 : 3,
      });

      // Question about companion personality
      generatedQuestions.push({
        question: `What best describes ${companion.name}'s approach?`,
        options: [
          'Offers guidance and mentorship',
          'Encourages creativity and imagination',
          'Focuses on logic and analysis',
          'Provides emotional support'
        ],
        correctIndex: ['mentor', 'creative', 'analytical', 'supportive'].indexOf(companion.personality_type),
      });

      // Question about recent topics (if messages exist)
      if (messages && messages.length > 0) {
        const recentTopics = conversations[0]?.title || 'general chat';
        generatedQuestions.push({
          question: `What was your most recent conversation about?`,
          options: [
            recentTopics.slice(0, 30) + (recentTopics.length > 30 ? '...' : ''),
            'Something else entirely',
            'Technical discussions',
            'Personal growth'
          ],
          correctIndex: 0,
        });
      }

      // Question about companion's greeting style
      generatedQuestions.push({
        question: `What is ${companion.name}'s default greeting style?`,
        options: [
          'Formal and professional',
          'Warm and friendly',
          'Curious and questioning',
          'Calm and supportive'
        ],
        correctIndex: ['mentor', 'creative', 'analytical', 'supportive'].indexOf(companion.personality_type),
      });

      setQuestions(generatedQuestions.slice(0, 5));
    } catch (err) {
      console.error('Failed to generate memory questions:', err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [companion, relationshipId]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === questions[currentIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      onComplete(score + (selectedAnswer === questions[currentIndex].correctIndex ? 1 : 0), questions.length);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Preparing memory questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <XCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={onCancel}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <Brain className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Not enough conversation history yet!</p>
          <p className="text-xs text-muted-foreground">Chat more with {companion.name} to unlock this activity.</p>
          <Button variant="outline" onClick={onCancel}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Memory Lane
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1}/{questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base font-medium">{currentQuestion.question}</p>
          
          <div className="grid gap-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;
              
              return (
                <Button
                  key={index}
                  variant={showCorrect ? "default" : showWrong ? "destructive" : isSelected ? "secondary" : "outline"}
                  className={`justify-start h-auto py-3 px-4 text-left ${
                    showCorrect ? 'bg-green-600 hover:bg-green-600' : ''
                  }`}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="flex items-center gap-2">
                    {showCorrect && <CheckCircle2 className="h-4 w-4" />}
                    {showWrong && <XCircle className="h-4 w-4" />}
                    {option}
                  </span>
                </Button>
              );
            })}
          </div>

          {showResult && (
            <div className="flex justify-between items-center pt-4">
              <p className={`text-sm font-medium ${
                selectedAnswer === currentQuestion.correctIndex ? 'text-green-600' : 'text-destructive'
              }`}>
                {selectedAnswer === currentQuestion.correctIndex ? 'Correct!' : 'Oops, not quite!'}
              </p>
              <Button onClick={handleNext}>
                {currentIndex + 1 >= questions.length ? 'Finish' : 'Next Question'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <div className="text-sm text-muted-foreground">
          Score: {score}/{currentIndex + (showResult ? 1 : 0)}
        </div>
      </div>
    </div>
  );
}
