import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  History,
  Bot,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Trash2,
  Clock,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useAgentHistory } from '@/hooks/useAgentHistory';
import type { AgentSession, AgentStatus } from '@/types/agent';

interface AgentHistoryPanelProps {
  projectId: string;
  onRestoreSession?: (session: AgentSession) => void;
  onClose?: () => void;
}

const statusConfig: Record<AgentStatus, { label: string; color: string; icon: typeof Bot }> = {
  idle: { label: 'Idle', color: 'text-muted-foreground', icon: Bot },
  planning: { label: 'Planning', color: 'text-blue-500', icon: Loader2 },
  executing: { label: 'Executing', color: 'text-amber-500', icon: Loader2 },
  applying: { label: 'Applying', color: 'text-purple-500', icon: FileCode },
  verifying: { label: 'Verifying', color: 'text-cyan-500', icon: Check },
  correcting: { label: 'Correcting', color: 'text-orange-500', icon: AlertCircle },
  complete: { label: 'Complete', color: 'text-green-500', icon: Check },
  error: { label: 'Error', color: 'text-destructive', icon: AlertCircle },
};

function SessionCard({
  session,
  onDelete,
  onRestore,
}: {
  session: AgentSession;
  onDelete: () => void;
  onRestore?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[session.status];
  const StatusIcon = config.icon;
  
  const totalChanges = session.appliedOperations.length + session.pendingOperations.length;
  const duration = session.endTime 
    ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border rounded-lg overflow-hidden bg-card"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "mt-0.5 p-1.5 rounded-full",
            session.status === 'complete' ? 'bg-green-500/10' : 
            session.status === 'error' ? 'bg-destructive/10' : 'bg-primary/10'
          )}>
            <StatusIcon className={cn("w-4 h-4", config.color)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2">{session.originalRequest}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(session.startTime, { addSuffix: true })}
              </span>
              {duration && (
                <span>• {duration}s</span>
              )}
              {totalChanges > 0 && (
                <Badge variant="secondary" className="text-xs py-0">
                  {totalChanges} file{totalChanges !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          
          <ChevronRight className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            expanded && "rotate-90"
          )} />
        </div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t"
          >
            <div className="p-3 space-y-3">
              {/* Steps Summary */}
              <div>
                <span className="text-xs font-medium text-muted-foreground">Steps ({session.steps.length})</span>
                <div className="mt-1 space-y-1">
                  {session.steps.slice(0, 5).map((step, i) => (
                    <div key={step.id || i} className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        step.status === 'complete' ? 'bg-green-500' :
                        step.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground'
                      )} />
                      <span className="truncate">{step.description}</span>
                    </div>
                  ))}
                  {session.steps.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{session.steps.length - 5} more steps
                    </span>
                  )}
                </div>
              </div>
              
              {/* Applied Operations */}
              {session.appliedOperations.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Applied ({session.appliedOperations.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {session.appliedOperations.slice(0, 3).map((op, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-xs py-0 px-1">
                          {op.type}
                        </Badge>
                        <span className="truncate text-muted-foreground">{op.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {onRestore && session.appliedOperations.length > 0 && (
                  <Button size="sm" variant="outline" onClick={onRestore} className="gap-1">
                    <ArrowRight className="w-3 h-3" />
                    View Changes
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this agent session from your history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AgentHistoryPanel({
  projectId,
  onRestoreSession,
  onClose,
}: AgentHistoryPanelProps) {
  const { sessions, isLoading, deleteSession, clearHistory } = useAgentHistory(projectId);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span className="font-semibold">Agent History</span>
          {sessions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {sessions.length}
            </Badge>
          )}
        </div>
        
        {sessions.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {sessions.length} agent session(s) from your history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => clearHistory()}>Clear All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No History Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Your completed agent sessions will appear here for review.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={() => deleteSession(session.id)}
                  onRestore={onRestoreSession ? () => onRestoreSession(session) : undefined}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
