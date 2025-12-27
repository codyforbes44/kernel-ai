import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Lock, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { WordGame } from './WordGame';
import { TriviaGame } from './TriviaGame';
import { EmojiGame } from './EmojiGame';
import { StoryGame } from './StoryGame';
import { MemoryGame } from './MemoryGame';
import { ACTIVITIES, getAvailableActivities, calculateActivityReward, type ActivityType } from '@/constants/activities';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { CompanionProfile, CompanionRelationship } from '@/types/companion';

interface ActivitiesHubProps {
  companion: CompanionProfile;
  relationship: CompanionRelationship;
  onAffinityChange?: (newLevel: number, change: number) => void;
  trigger?: React.ReactNode;
}

export function ActivitiesHub({ companion, relationship, onAffinityChange, trigger }: ActivitiesHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<ActivityType | null>(null);

  const availableActivities = getAvailableActivities(relationship.affinity_level);

  const handleGameComplete = async (activityId: ActivityType, score: number, maxScore: number) => {
    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    const performance = score / maxScore;
    const affinityReward = calculateActivityReward(activity, performance, companion.personality_type);
    const newAffinity = Math.min(100, relationship.affinity_level + affinityReward);

    // Update affinity in database
    const { error } = await supabase
      .from('companion_relationships')
      .update({ 
        affinity_level: newAffinity,
        total_interactions: relationship.total_interactions + 1,
      })
      .eq('id', relationship.id);

    if (error) {
      toast.error('Failed to save activity reward');
      return;
    }

    toast.success(`+${affinityReward} affinity earned!`, {
      description: `You and ${companion.name} grew closer!`,
    });

    onAffinityChange?.(newAffinity, affinityReward);
    setActiveGame(null);
  };

  const renderGame = () => {
    const props = {
      companion,
      onCancel: () => setActiveGame(null),
    };

    switch (activeGame) {
      case 'word_game':
        return <WordGame {...props} onComplete={(s, m) => handleGameComplete('word_game', s, m)} />;
      case 'trivia':
        return <TriviaGame {...props} onComplete={(s, m) => handleGameComplete('trivia', s, m)} />;
      case 'emoji_guess':
        return <EmojiGame {...props} onComplete={(s, m) => handleGameComplete('emoji_guess', s, m)} />;
      case 'story_collab':
        return <StoryGame {...props} onComplete={(s, m) => handleGameComplete('story_collab', s, m)} />;
      case 'memory_quiz':
        return (
          <MemoryGame 
            companion={companion}
            relationshipId={relationship.id}
            onComplete={(s, m) => handleGameComplete('memory_quiz', s, m)}
            onCancel={() => setActiveGame(null)}
          />
        );
      default:
        return null;
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Gamepad2 className="h-4 w-4" />
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            {activeGame ? (
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setActiveGame(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Gamepad2 className="h-5 w-5" />
            )}
            {activeGame ? 'Playing' : 'Activities'}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <AnimatePresence mode="wait">
            {activeGame ? (
              <motion.div
                key="game"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderGame()}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 pb-6"
              >
                {ACTIVITIES.map((activity) => {
                  const isLocked = activity.requiredAffinity > relationship.affinity_level;
                  const hasBonus = activity.personalityBonus.includes(companion.personality_type);

                  return (
                    <Card
                      key={activity.id}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary/50',
                        isLocked && 'opacity-60 cursor-not-allowed'
                      )}
                      onClick={() => !isLocked && setActiveGame(activity.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{activity.icon}</span>
                            <div>
                              <CardTitle className="text-base">{activity.name}</CardTitle>
                              <CardDescription className="text-xs">{activity.description}</CardDescription>
                            </div>
                          </div>
                          {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs gap-1">
                            <Clock className="h-3 w-3" /> {activity.duration}
                          </Badge>
                          <Badge variant="outline" className="text-xs gap-1">
                            <Trophy className="h-3 w-3" /> +{activity.affinityReward.min}-{activity.affinityReward.max}
                          </Badge>
                          {hasBonus && (
                            <Badge variant="secondary" className="text-xs">✨ Bonus</Badge>
                          )}
                          {isLocked && (
                            <Badge variant="destructive" className="text-xs">
                              Requires {activity.requiredAffinity} affinity
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
