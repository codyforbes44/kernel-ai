import { Calendar, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TweetCard } from './TweetCard';
import { XScheduledTweet } from '@/services/xDatabaseService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ScheduledListProps {
  scheduledTweets: XScheduledTweet[];
  isLoading: boolean;
  onEdit: (tweet: XScheduledTweet) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  onCopy: (content: string) => void;
}

export function ScheduledList({
  scheduledTweets,
  isLoading,
  onEdit,
  onDelete,
  onCancel,
  onCopy,
}: ScheduledListProps) {
  const pendingTweets = scheduledTweets.filter((t) => t.status === 'pending');
  const completedTweets = scheduledTweets.filter((t) => t.status !== 'pending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Scheduled ({scheduledTweets.length})</h3>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1">
            <Clock className="h-4 w-4 mr-1" />
            Pending ({pendingTweets.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            History ({completedTweets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingTweets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled tweets</p>
              <p className="text-sm mt-1">Schedule a tweet from your drafts</p>
            </div>
          ) : (
            <ScrollArea className="h-[350px]">
              <div className="space-y-3 pr-4">
                {pendingTweets.map((tweet) => (
                  <TweetCard
                    key={tweet.id}
                    content={tweet.content}
                    type={tweet.type as 'tweet' | 'thread'}
                    scheduledFor={tweet.scheduled_for}
                    status={tweet.status as 'pending' | 'posted' | 'failed' | 'cancelled'}
                    hashtags={tweet.hashtags}
                    onEdit={() => onEdit(tweet)}
                    onDelete={() => onDelete(tweet.id)}
                    onCancel={() => onCancel(tweet.id)}
                    onCopy={() => onCopy(tweet.content)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {completedTweets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No history yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[350px]">
              <div className="space-y-3 pr-4">
                {completedTweets.map((tweet) => (
                  <TweetCard
                    key={tweet.id}
                    content={tweet.content}
                    type={tweet.type as 'tweet' | 'thread'}
                    scheduledFor={tweet.scheduled_for}
                    status={tweet.status as 'pending' | 'posted' | 'failed' | 'cancelled'}
                    hashtags={tweet.hashtags}
                    onDelete={() => onDelete(tweet.id)}
                    onCopy={() => onCopy(tweet.content)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
