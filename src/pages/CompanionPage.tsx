import { useState, useCallback, useMemo } from 'react';
import { CompanionSelector } from '@/components/companion/CompanionSelector';
import { CompanionChat } from '@/components/companion/CompanionChat';
import { ConversationHistory } from '@/components/companion/ConversationHistory';
import { DailyCheckIn } from '@/components/companion/DailyCheckIn';
import { CompanionThoughts } from '@/components/companion/CompanionThoughts';
import { StreakDisplay } from '@/components/companion/StreakDisplay';
import { MilestoneCelebration } from '@/components/companion/MilestoneCelebration';
import { MobileCompanionSheet } from '@/components/companion/MobileCompanionSheet';
import { CompanionPageSkeleton } from '@/components/companion/CompanionPageSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useCompanionRelationship, useCompanion } from '@/hooks/useCompanion';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare } from 'lucide-react';
import type { Milestone } from '@/types/companion';

export default function CompanionPage() {
  const { user, loading } = useAuth();
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [celebratingMilestone, setCelebratingMilestone] = useState<Milestone | null>(null);
  
  const { data: relationship, isLoading: relationshipLoading } = useCompanionRelationship(selectedCompanionId);
  const { data: companion, isLoading: companionLoading } = useCompanion(selectedCompanionId);

  if (loading) return <CompanionPageSkeleton />;
  if (!user) return <Navigate to="/auth" replace />;

  const handleSelectCompanion = useCallback((id: string) => {
    setSelectedCompanionId(id);
    setActiveConversationId(undefined);
  }, []);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(undefined);
  }, []);

  const handleCheckIn = useCallback(() => {
    // Just scroll to chat - the chat component handles sending messages
  }, []);

  const handleNewMilestone = useCallback((milestone: Milestone) => {
    setCelebratingMilestone(milestone);
  }, []);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const hasCheckedInToday = relationship?.last_check_in_date === today;

  return (
    <main className="container max-w-6xl py-8" role="main" aria-label="AI Companions">
      <header className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold">AI Companions</h1>
        <p className="text-muted-foreground">Choose a companion to chat with and build your connection</p>
        {/* Mobile companion selector */}
        <div className="lg:hidden pt-2">
          <MobileCompanionSheet 
            selectedId={selectedCompanionId} 
            onSelect={handleSelectCompanion} 
          />
        </div>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Left Sidebar - Companion Selection & History */}
        <div className="space-y-4">
          {/* Daily Check-in Card */}
          {companion && relationship && !hasCheckedInToday && (
            <DailyCheckIn
              companionName={companion.name}
              personalityType={companion.personality_type}
              hasCheckedInToday={hasCheckedInToday}
              currentStreak={relationship.current_streak}
              onCheckIn={handleCheckIn}
            />
          )}

          {/* Streak Display */}
          {relationship && relationship.current_streak > 0 && (
            <Card>
              <CardContent className="pt-4">
                <StreakDisplay
                  currentStreak={relationship.current_streak}
                  longestStreak={relationship.longest_streak}
                  lastCheckIn={relationship.last_check_in_date}
                />
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="companions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="companions" className="gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Companions</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="companions" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Select Companion</CardTitle>
                </CardHeader>
                <CardContent>
                  <CompanionSelector 
                    selectedId={selectedCompanionId} 
                    onSelect={handleSelectCompanion} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <ConversationHistory
                relationshipId={relationship?.id ?? null}
                currentConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
              />
            </TabsContent>
          </Tabs>

          {/* Companion Thoughts */}
          {companion && relationship && (
            <Card>
              <CardContent className="pt-4">
                <CompanionThoughts
                  companionName={companion.name}
                  personalityType={companion.personality_type}
                  affinityLevel={relationship.affinity_level}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="lg:min-h-[600px]">
          {selectedCompanionId ? (
            <CompanionChat 
              companionId={selectedCompanionId}
              conversationId={activeConversationId}
              onConversationChange={setActiveConversationId}
              onNewMilestone={handleNewMilestone}
            />
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <CardContent className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Companion Selected</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a companion from the left panel to start chatting
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Milestone Celebration Modal */}
      <MilestoneCelebration
        milestone={celebratingMilestone}
        onClose={() => setCelebratingMilestone(null)}
      />
    </main>
  );
}
