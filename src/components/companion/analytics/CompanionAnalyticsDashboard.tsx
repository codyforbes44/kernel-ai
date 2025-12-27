import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ConversationStats } from './ConversationStats';
import { AffinityChart } from './AffinityChart';
import { MoodHistory } from './MoodHistory';
import { MemoryVisualization } from './MemoryVisualization';
import { RelationshipTrends } from './RelationshipTrends';
import { TopicAnalysis } from './TopicAnalysis';
import type { CompanionProfile, CompanionRelationship, CompanionConversation } from '@/types/companion';

interface CompanionAnalyticsDashboardProps {
  companion: CompanionProfile;
  relationship: CompanionRelationship;
  conversations: CompanionConversation[];
  trigger?: React.ReactNode;
}

export function CompanionAnalyticsDashboard({
  companion,
  relationship,
  conversations,
  trigger,
}: CompanionAnalyticsDashboardProps) {
  const content = (
    <ScrollArea className="h-full pr-4">
      <motion.div 
        className="space-y-6 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Stats Overview */}
        <ConversationStats 
          relationship={relationship} 
          conversations={conversations} 
        />

        {/* Affinity Progress */}
        <AffinityChart relationship={relationship} />

        {/* Relationship Trends - NEW */}
        <RelationshipTrends
          companion={companion}
          relationship={relationship}
          conversations={conversations}
        />

        {/* Topic Analysis - NEW */}
        <TopicAnalysis
          companion={companion}
          conversations={conversations}
        />

        {/* Mood Patterns */}
        <MoodHistory 
          conversations={conversations} 
          currentMood={relationship.current_mood}
        />

        {/* Memory Visualization */}
        <MemoryVisualization 
          memoryContext={relationship.memory_context}
          companionName={companion.name}
        />
      </motion.div>
    </ScrollArea>
  );

  if (trigger) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Analytics for {companion.name}
            </SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Analytics for {companion.name}</h2>
      </div>
      {content}
    </div>
  );
}
