import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, MessageCircle, Zap } from 'lucide-react';
import { format, differenceInDays, startOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { PERSONALITY_COLORS } from '@/constants/companion';
import type { CompanionProfile, CompanionRelationship, CompanionConversation } from '@/types/companion';

interface RelationshipTrendsProps {
  companion: CompanionProfile;
  relationship: CompanionRelationship;
  conversations: CompanionConversation[];
}

export function RelationshipTrends({ companion, relationship, conversations }: RelationshipTrendsProps) {
  const color = PERSONALITY_COLORS[companion.personality_type] || PERSONALITY_COLORS.mentor;

  const stats = useMemo(() => {
    const daysTogether = differenceInDays(new Date(), new Date(relationship.created_at)) + 1;
    const avgMessagesPerDay = daysTogether > 0 ? (relationship.total_messages / daysTogether).toFixed(1) : '0';
    const avgMessagesPerConvo = conversations.length > 0 
      ? Math.round(relationship.total_messages / conversations.length) 
      : 0;
    
    // Calculate weekly activity
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    const weeklyActivity = last7Days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const convsOnDay = conversations.filter(c => 
        format(new Date(c.created_at), 'yyyy-MM-dd') === dayStr
      );
      return {
        day: format(day, 'EEE'),
        conversations: convsOnDay.length,
        messages: convsOnDay.reduce((sum, c) => sum + c.message_count, 0)
      };
    });

    // Growth rate calculation
    const recentConversations = conversations.slice(0, 5);
    const olderConversations = conversations.slice(5, 10);
    const recentAvg = recentConversations.length > 0
      ? recentConversations.reduce((sum, c) => sum + c.message_count, 0) / recentConversations.length
      : 0;
    const olderAvg = olderConversations.length > 0
      ? olderConversations.reduce((sum, c) => sum + c.message_count, 0) / olderConversations.length
      : 0;
    const growthRate = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

    return {
      daysTogether,
      avgMessagesPerDay,
      avgMessagesPerConvo,
      weeklyActivity,
      growthRate,
      maxWeeklyMessages: Math.max(...weeklyActivity.map(d => d.messages), 1)
    };
  }, [relationship, conversations]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color }} />
          Relationship Trends
        </CardTitle>
        <CardDescription>Your journey with {companion.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Days Together</span>
            </div>
            <p className="text-2xl font-bold">{stats.daysTogether}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg/Day</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgMessagesPerDay}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg/Convo</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgMessagesPerConvo}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Engagement</span>
            </div>
            <p className="text-2xl font-bold">
              {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}%
            </p>
          </motion.div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Weekly Activity</h4>
          <div className="flex items-end justify-between gap-1 h-24">
            {stats.weeklyActivity.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: index * 0.05 }}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div 
                  className="w-full rounded-t transition-all duration-300"
                  style={{ 
                    height: `${(day.messages / stats.maxWeeklyMessages) * 80}px`,
                    backgroundColor: day.messages > 0 ? color : 'hsl(var(--muted))',
                    minHeight: '4px'
                  }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Milestone Progress */}
        {relationship.milestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Milestones Achieved</h4>
            <div className="flex flex-wrap gap-2">
              {relationship.milestones.slice(0, 5).map((milestone: any) => (
                <motion.span
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${color}20`,
                    color
                  }}
                >
                  {milestone.title}
                </motion.span>
              ))}
              {relationship.milestones.length > 5 && (
                <span className="px-2 py-1 rounded-full text-xs text-muted-foreground bg-muted">
                  +{relationship.milestones.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
