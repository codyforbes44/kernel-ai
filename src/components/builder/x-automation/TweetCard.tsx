import { format } from 'date-fns';
import { Star, Edit2, Trash2, Clock, Calendar, Copy, AlertCircle, CheckCircle, XCircle, Send, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TweetCardProps {
  content: string;
  type: 'tweet' | 'thread';
  createdAt?: string;
  scheduledFor?: string;
  status?: 'pending' | 'posted' | 'failed' | 'cancelled';
  isFavorite?: boolean;
  hashtags?: string[];
  postedUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onSchedule?: () => void;
  onCopy?: () => void;
  onToggleFavorite?: () => void;
  onCancel?: () => void;
  onPostNow?: () => void;
  isPosting?: boolean;
  isXApiConfigured?: boolean;
}

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', variant: 'secondary' as const, className: 'text-warning' },
  posted: { icon: CheckCircle, label: 'Posted', variant: 'default' as const, className: 'text-success' },
  failed: { icon: AlertCircle, label: 'Failed', variant: 'destructive' as const, className: 'text-destructive' },
  cancelled: { icon: XCircle, label: 'Cancelled', variant: 'outline' as const, className: 'text-muted-foreground' },
};

export function TweetCard({
  content,
  type,
  createdAt,
  scheduledFor,
  status,
  isFavorite,
  hashtags,
  postedUrl,
  onEdit,
  onDelete,
  onSchedule,
  onCopy,
  onToggleFavorite,
  onCancel,
  onPostNow,
  isPosting,
  isXApiConfigured,
}: TweetCardProps) {
  const StatusIcon = status ? statusConfig[status].icon : null;
  const truncatedContent = content.length > 140 ? content.slice(0, 140) + '...' : content;

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {type === 'thread' ? 'Thread' : 'Tweet'}
              </Badge>
              {status && StatusIcon && (
                <Badge variant={statusConfig[status].variant} className="text-xs">
                  <StatusIcon className={cn('h-3 w-3 mr-1', statusConfig[status].className)} />
                  {statusConfig[status].label}
                </Badge>
              )}
              {isFavorite && (
                <Star className="h-4 w-4 fill-warning text-warning" />
              )}
            </div>
            
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {truncatedContent}
            </p>
            
            {hashtags && hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {hashtags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-primary">
                    #{tag}
                  </span>
                ))}
                {hashtags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{hashtags.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              {createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(createdAt), 'MMM d, yyyy')}
                </span>
              )}
              {scheduledFor && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(scheduledFor), 'MMM d, yyyy h:mm a')}
                </span>
              )}
              <span>{content.length}/280</span>
              {postedUrl && (
                <a 
                  href={postedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on X
                </a>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Post Now button - show for drafts and pending scheduled tweets */}
            {onPostNow && isXApiConfigured && !status && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={onPostNow}
                      disabled={isPosting}
                    >
                      {isPosting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Post to X now</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleFavorite}
              >
                <Star className={cn('h-4 w-4', isFavorite && 'fill-warning text-warning')} />
              </Button>
            )}
            {onCopy && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {onSchedule && !status && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onSchedule}
              >
                <Clock className="h-4 w-4" />
              </Button>
            )}
            {onCancel && status === 'pending' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onCancel}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
