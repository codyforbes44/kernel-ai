import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCompanionConversations, useDeleteConversation } from '@/hooks/useCompanion';
import { formatDistanceToNow, isToday, isThisWeek } from 'date-fns';
import { MessageSquare, Trash2, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanionConversation } from '@/types/companion';

interface ConversationHistoryProps {
  relationshipId: string | null;
  currentConversationId: string | undefined;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

type ConversationGroup = {
  label: string;
  conversations: CompanionConversation[];
};

function groupConversations(conversations: CompanionConversation[]): ConversationGroup[] {
  const today: CompanionConversation[] = [];
  const thisWeek: CompanionConversation[] = [];
  const earlier: CompanionConversation[] = [];

  conversations.forEach((conv) => {
    const date = new Date(conv.updated_at);
    if (isToday(date)) {
      today.push(conv);
    } else if (isThisWeek(date)) {
      thisWeek.push(conv);
    } else {
      earlier.push(conv);
    }
  });

  const groups: ConversationGroup[] = [];
  if (today.length > 0) groups.push({ label: 'Today', conversations: today });
  if (thisWeek.length > 0) groups.push({ label: 'This Week', conversations: thisWeek });
  if (earlier.length > 0) groups.push({ label: 'Earlier', conversations: earlier });

  return groups;
}

export function ConversationHistory({
  relationshipId,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationHistoryProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const { data: conversations, isLoading } = useCompanionConversations(relationshipId);
  const deleteConversation = useDeleteConversation();

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation.mutate(conversationToDelete);
      if (conversationToDelete === currentConversationId) {
        onNewConversation();
      }
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  if (!relationshipId) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Conversation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Start chatting to see your conversation history
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedConversations = conversations ? groupConversations(conversations) : [];

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onNewConversation}
              className="h-7 px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4 pb-4">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : groupedConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedConversations.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-medium text-muted-foreground mb-2">{group.label}</p>
                    <div className="space-y-1">
                      {group.conversations.map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => onSelectConversation(conv.id)}
                          className={cn(
                            'group flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                            'hover:bg-muted/50',
                            currentConversationId === conv.id && 'bg-primary/10 hover:bg-primary/15'
                          )}
                        >
                          <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {conv.title || 'New Conversation'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conv.message_count} messages • {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDeleteClick(e, conv.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
