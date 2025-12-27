import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { EvolvedAvatar } from './evolution/EvolvedAvatar';
import { EvolutionProgress } from './evolution/EvolutionProgress';
import { AffinityMeter } from './AffinityMeter';
import { MilestonesBadges } from './MilestonesBadges';
import { MoodIndicator } from './MoodIndicator';
import { useUpdateNickname } from '@/hooks/useCompanion';
import { PERSONALITY_ICONS, getAffinityLevel } from '@/constants/companion';
import { formatDistanceToNow } from 'date-fns';
import { Edit2, Check, X, Calendar, MessageSquare, Heart, Brain, Sparkles } from 'lucide-react';
import type { CompanionProfile as CompanionProfileType, CompanionRelationship, MemoryContext } from '@/types/companion';

interface CompanionProfileProps {
  companion: CompanionProfileType;
  relationship: CompanionRelationship | null;
  trigger?: React.ReactNode;
}

export function CompanionProfile({ companion, relationship, trigger }: CompanionProfileProps) {
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(relationship?.nickname || '');
  const updateNickname = useUpdateNickname();

  const affinityLevel = getAffinityLevel(relationship?.affinity_level || 0);
  const memoryContext = (relationship?.memory_context || {}) as MemoryContext;

  const handleSaveNickname = () => {
    if (relationship) {
      updateNickname.mutate({ relationshipId: relationship.id, nickname });
      setIsEditingNickname(false);
    }
  };

  const content = (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-1">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <EvolvedAvatar 
            personalityType={companion.personality_type} 
            avatarUrl={companion.avatar_url}
            affinity={relationship?.affinity_level || 0}
            size="xl"
            showTooltip={false}
          />
          <div>
            <div className="flex items-center justify-center gap-2">
              {!isEditingNickname ? (
                <>
                  <h2 className="text-2xl font-bold">
                    {relationship?.nickname || companion.name}
                  </h2>
                  {relationship && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => setIsEditingNickname(true)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Input 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter nickname"
                    className="h-8 w-40"
                  />
                  <Button size="icon" className="h-6 w-6" onClick={handleSaveNickname}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingNickname(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {relationship?.nickname && (
              <p className="text-sm text-muted-foreground">({companion.name})</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-lg">{PERSONALITY_ICONS[companion.personality_type]}</span>
              <span className="text-sm text-muted-foreground capitalize">{companion.personality_type}</span>
            </div>
          </div>
        </div>

        {/* Affinity & Mood */}
        {relationship && (
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{affinityLevel.name}</p>
                  <p className="text-xs text-muted-foreground">{affinityLevel.description}</p>
                </div>
                <MoodIndicator mood={relationship.current_mood} size="md" />
              </div>
              <AffinityMeter level={relationship.affinity_level} size="md" showLabel />
            </CardContent>
          </Card>
        )}

        {/* Evolution Progress */}
        {relationship && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Evolution Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EvolutionProgress affinity={relationship.affinity_level} showAllTiers />
            </CardContent>
          </Card>
        )}
        {relationship && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <MessageSquare className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xl font-bold">{relationship.total_messages}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Heart className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xl font-bold">{relationship.total_interactions}</p>
                <p className="text-xs text-muted-foreground">Interactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-medium">
                  {relationship.created_at 
                    ? formatDistanceToNow(new Date(relationship.created_at), { addSuffix: false })
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Together</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Backstory */}
        {companion.backstory && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Backstory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{companion.backstory}</p>
            </CardContent>
          </Card>
        )}

        {/* Personality Traits */}
        {Object.keys(companion.personality_traits).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Personality Traits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(companion.personality_traits).map(([trait, value]) => (
                  <div key={trait} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{trait}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(value as number) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {Math.round((value as number) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Memory Context */}
        {relationship && Object.keys(memoryContext).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                What I Remember About You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {memoryContext.user_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Your Name</p>
                  <p className="text-sm font-medium">{memoryContext.user_name}</p>
                </div>
              )}
              {memoryContext.interests && memoryContext.interests.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Your Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {memoryContext.interests.map((interest, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {memoryContext.goals && memoryContext.goals.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Your Goals</p>
                  <div className="flex flex-wrap gap-1">
                    {memoryContext.goals.map((goal, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{goal}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {memoryContext.last_topics && memoryContext.last_topics.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Recent Topics</p>
                  <div className="flex flex-wrap gap-1">
                    {memoryContext.last_topics.map((topic, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        {relationship && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestonesBadges milestones={relationship.milestones} showLocked />
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );

  if (trigger) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Companion Profile</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100vh-100px)]">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return content;
}
