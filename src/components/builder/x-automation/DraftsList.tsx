import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TweetCard } from './TweetCard';
import { XTweetDraft } from '@/services/xDatabaseService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DraftsListProps {
  drafts: XTweetDraft[];
  isLoading: boolean;
  onEdit: (draft: XTweetDraft) => void;
  onDelete: (id: string) => void;
  onSchedule: (draft: XTweetDraft) => void;
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
  onNewDraft: () => void;
}

export function DraftsList({
  drafts,
  isLoading,
  onEdit,
  onDelete,
  onSchedule,
  onCopy,
  onToggleFavorite,
  onNewDraft,
}: DraftsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Drafts ({drafts.length})</h3>
        </div>
        <Button variant="outline" size="sm" onClick={onNewDraft}>
          <Plus className="h-4 w-4 mr-1" />
          New Draft
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No drafts yet</p>
          <p className="text-sm mt-1">Generate tweets or create a new draft</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {drafts.map((draft) => (
              <TweetCard
                key={draft.id}
                content={draft.content}
                type={draft.type as 'tweet' | 'thread'}
                createdAt={draft.created_at}
                isFavorite={draft.is_favorite}
                hashtags={draft.hashtags}
                onEdit={() => onEdit(draft)}
                onDelete={() => onDelete(draft.id)}
                onSchedule={() => onSchedule(draft)}
                onCopy={() => onCopy(draft.content)}
                onToggleFavorite={() => onToggleFavorite(draft.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
