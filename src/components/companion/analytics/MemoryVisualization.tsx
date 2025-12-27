import { motion } from 'framer-motion';
import { Brain, User, Target, Heart, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MemoryContext } from '@/types/companion';

interface MemoryVisualizationProps {
  memoryContext: MemoryContext;
  companionName: string;
  className?: string;
}

interface MemorySectionProps {
  icon: React.ElementType;
  title: string;
  items: string[];
  color: string;
  emptyText: string;
  delay?: number;
}

function MemorySection({ icon: Icon, title, items, color, emptyText, delay = 0 }: MemorySectionProps) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + i * 0.05 }}
            >
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ borderColor: `${color}40` }}
              >
                {item}
              </Badge>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">{emptyText}</p>
      )}
    </motion.div>
  );
}

export function MemoryVisualization({ memoryContext, companionName, className }: MemoryVisualizationProps) {
  const { user_name, goals = [], interests = [], last_topics = [], important_dates = {} } = memoryContext;

  const dateEntries = Object.entries(important_dates || {});

  const hasAnyMemory = user_name || goals.length > 0 || interests.length > 0 || 
                       last_topics.length > 0 || dateEntries.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          {companionName}'s Memory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAnyMemory ? (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No memories yet</p>
            <p className="text-xs mt-1">
              As you chat, {companionName} will learn about you
            </p>
          </div>
        ) : (
          <>
            {/* User Name */}
            {user_name && (
              <motion.div
                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Knows you as</p>
                  <p className="font-semibold">{user_name}</p>
                </div>
              </motion.div>
            )}

            {/* Goals */}
            <MemorySection
              icon={Target}
              title="Your Goals"
              items={goals}
              color="hsl(140, 70%, 45%)"
              emptyText="Share your goals to help me support you"
              delay={0.1}
            />

            {/* Interests */}
            <MemorySection
              icon={Heart}
              title="Your Interests"
              items={interests}
              color="hsl(340, 80%, 60%)"
              emptyText="Tell me what you're interested in"
              delay={0.2}
            />

            {/* Recent Topics */}
            <MemorySection
              icon={MessageCircle}
              title="Recent Topics"
              items={last_topics}
              color="hsl(200, 80%, 50%)"
              emptyText="Topics from our conversations will appear here"
              delay={0.3}
            />

            {/* Important Dates */}
            {dateEntries.length > 0 && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Important Dates</span>
                </div>
                <div className="space-y-1">
                  {dateEntries.map(([key, value], i) => (
                    <div 
                      key={key}
                      className="flex items-center justify-between text-sm px-2 py-1 rounded bg-muted/50"
                    >
                      <span className="capitalize text-muted-foreground">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Memory Strength Indicator */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Memory Strength</span>
            <span>{Math.min(100, (goals.length + interests.length + last_topics.length) * 10)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, (goals.length + interests.length + last_topics.length) * 10)}%` 
              }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
