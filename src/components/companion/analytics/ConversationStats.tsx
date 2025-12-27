import { motion } from 'framer-motion';
import { MessageSquare, Clock, TrendingUp, Calendar, Zap, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CompanionRelationship, CompanionConversation } from '@/types/companion';

interface ConversationStatsProps {
  relationship: CompanionRelationship;
  conversations: CompanionConversation[];
  className?: string;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, subValue, color = 'text-primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
              {subValue && (
                <p className="text-xs text-muted-foreground">{subValue}</p>
              )}
            </div>
            <div className={cn('p-2 rounded-lg bg-muted/50', color)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ConversationStats({ relationship, conversations, className }: ConversationStatsProps) {
  const totalMessages = relationship.total_messages;
  const totalConversations = conversations.length;
  const avgMessagesPerConvo = totalConversations > 0 
    ? Math.round(totalMessages / totalConversations) 
    : 0;

  // Calculate days since first interaction
  const daysSinceStart = Math.floor(
    (Date.now() - new Date(relationship.created_at).getTime()) / (1000 * 60 * 60 * 24)
  ) || 1;

  const messagesPerDay = (totalMessages / daysSinceStart).toFixed(1);

  // Find most active time (mock for now since we don't have detailed timestamps)
  const activeConvos = conversations.filter(c => c.is_active).length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Conversation Analytics</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={MessageSquare}
          label="Total Messages"
          value={totalMessages}
          subValue={`${messagesPerDay}/day avg`}
          color="text-blue-500"
          delay={0}
        />
        <StatCard
          icon={Heart}
          label="Interactions"
          value={relationship.total_interactions}
          color="text-rose-500"
          delay={0.1}
        />
        <StatCard
          icon={Calendar}
          label="Conversations"
          value={totalConversations}
          subValue={`${avgMessagesPerConvo} msgs avg`}
          color="text-emerald-500"
          delay={0.2}
        />
        <StatCard
          icon={Clock}
          label="Days Together"
          value={daysSinceStart}
          subValue={relationship.current_streak > 0 ? `${relationship.current_streak} day streak` : undefined}
          color="text-amber-500"
          delay={0.3}
        />
        <StatCard
          icon={Zap}
          label="Active Chats"
          value={activeConvos}
          color="text-purple-500"
          delay={0.4}
        />
        <StatCard
          icon={TrendingUp}
          label="Affinity Level"
          value={`${relationship.affinity_level}%`}
          color="text-pink-500"
          delay={0.5}
        />
      </div>
    </div>
  );
}
