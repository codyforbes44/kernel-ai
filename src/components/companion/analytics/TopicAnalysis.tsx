import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PERSONALITY_COLORS } from '@/constants/companion';
import { companionService } from '@/services/companionService';
import type { CompanionProfile, CompanionConversation, CompanionMessage } from '@/types/companion';

interface TopicAnalysisProps {
  companion: CompanionProfile;
  conversations: CompanionConversation[];
}

interface TopicData {
  topic: string;
  count: number;
  percentage: number;
}

// Common words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
  'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'about', 'like', 'really', 'think',
  'know', 'want', 'going', 'get', 'got', 'make', 'made', 'see', 'say',
  'said', 'there', 'here', 'now', 'then', 'also', 'well', 'even', 'back',
  "i'm", "you're", "it's", "that's", "don't", "didn't", "won't", "can't",
  "couldn't", "wouldn't", "shouldn't", "i've", "you've", "we've", "they've",
  'your', 'my', 'me', 'something', 'anything', 'nothing', 'everything',
  'right', 'yeah', 'yes', 'okay', 'ok', 'sure', 'maybe', 'probably'
]);

export function TopicAnalysis({ companion, conversations }: TopicAnalysisProps) {
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const color = PERSONALITY_COLORS[companion.personality_type] || PERSONALITY_COLORS.mentor;

  const loadMessages = async () => {
    if (conversations.length === 0) return;
    
    setIsLoading(true);
    try {
      // Load messages from recent conversations
      const recentConvs = conversations.slice(0, 5);
      const allMessages: CompanionMessage[] = [];
      
      for (const conv of recentConvs) {
        const msgs = await companionService.getMessages(conv.id, 100);
        allMessages.push(...msgs);
      }
      
      setMessages(allMessages);
    } catch (error) {
      console.error('Failed to load messages for analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversations]);

  const topics = useMemo(() => {
    if (messages.length === 0) return [];

    const wordFrequency: Map<string, number> = new Map();

    // Only analyze user messages
    const userMessages = messages.filter(m => m.role === 'user');

    for (const message of userMessages) {
      // Extract words, filter short ones and stop words
      const words = message.content
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !STOP_WORDS.has(word));

      for (const word of words) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    }

    // Sort by frequency and take top topics
    const sortedTopics = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const totalMentions = sortedTopics.reduce((sum, [, count]) => sum + count, 0);

    return sortedTopics.map(([topic, count]): TopicData => ({
      topic,
      count,
      percentage: totalMentions > 0 ? Math.round((count / totalMentions) * 100) : 0
    }));
  }, [messages]);

  const emotionTopics = useMemo(() => {
    // Aggregate emotion tags from messages
    const emotionCounts: Map<string, number> = new Map();
    
    for (const message of messages) {
      if (message.emotion_tags && Array.isArray(message.emotion_tags)) {
        for (const tag of message.emotion_tags) {
          emotionCounts.set(tag, (emotionCounts.get(tag) || 0) + 1);
        }
      }
    }

    return Array.from(emotionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [messages]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="h-4 w-4" style={{ color }} />
              Topic Analysis
            </CardTitle>
            <CardDescription>What you talk about most</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={loadMessages}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : topics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Not enough data yet. Keep chatting!
          </p>
        ) : (
          <>
            {/* Word Cloud Style */}
            <div className="flex flex-wrap gap-2 justify-center py-2">
              <AnimatePresence>
                {topics.map((topic, index) => (
                  <motion.span
                    key={topic.topic}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-3 py-1 rounded-full font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: `${color}${Math.max(20, topic.percentage)}`,
                      color: topic.percentage > 50 ? 'white' : color,
                      fontSize: `${Math.max(12, Math.min(20, 10 + topic.percentage / 5))}px`
                    }}
                  >
                    {topic.topic}
                    <span className="ml-1 opacity-70">({topic.count})</span>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* Bar Chart */}
            <div className="space-y-2">
              {topics.slice(0, 5).map((topic, index) => (
                <motion.div
                  key={topic.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{topic.topic}</span>
                    <span className="text-muted-foreground">{topic.count} mentions</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.percentage}%` }}
                      transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Emotion Tags */}
            {emotionTopics.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Emotional Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {emotionTopics.map(([emotion, count]) => (
                    <span
                      key={emotion}
                      className="px-2 py-1 rounded text-xs bg-muted"
                    >
                      {emotion} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
