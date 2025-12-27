import { useState } from 'react';
import { CompanionSelector } from '@/components/companion/CompanionSelector';
import { CompanionChat } from '@/components/companion/CompanionChat';
import { ConversationHistory } from '@/components/companion/ConversationHistory';
import { useAuth } from '@/hooks/useAuth';
import { useCompanionRelationship } from '@/hooks/useCompanion';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare } from 'lucide-react';

export default function CompanionPage() {
  const { user, loading } = useAuth();
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  
  const { data: relationship } = useCompanionRelationship(selectedCompanionId);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleSelectCompanion = (id: string) => {
    setSelectedCompanionId(id);
    setActiveConversationId(undefined); // Start fresh conversation when switching companions
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold">AI Companions</h1>
        <p className="text-muted-foreground">Choose a companion to chat with and build your connection</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Left Sidebar - Companion Selection & History */}
        <div className="space-y-4">
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
        </div>

        {/* Main Chat Area */}
        <div className="lg:min-h-[600px]">
          {selectedCompanionId ? (
            <CompanionChat 
              companionId={selectedCompanionId}
              conversationId={activeConversationId}
              onConversationChange={setActiveConversationId}
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
    </div>
  );
}
