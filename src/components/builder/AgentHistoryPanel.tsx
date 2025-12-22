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
  RotateCcw,
  Pencil,
  BookmarkPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAgentHistory } from '@/hooks/useAgentHistory';
import { useTemplates } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';
import type { AgentSession, AgentStatus } from '@/types/agent';
import type { TemplateCategory } from '@/types/database';

interface AgentHistoryPanelProps {
  projectId: string;
  onRestoreSession?: (session: AgentSession) => void;
  onRerunSession?: (request: string) => void;
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
  onRerun,
  onSaveAsTemplate,
}: {
  session: AgentSession;
  onDelete: () => void;
  onRestore?: () => void;
  onRerun?: (request: string) => void;
  onSaveAsTemplate?: (session: AgentSession) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rerunDialogOpen, setRerunDialogOpen] = useState(false);
  const [editedRequest, setEditedRequest] = useState(session.originalRequest);
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
                {onRerun && (
                  <>
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={() => onRerun(session.originalRequest)} 
                      className="gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Re-run
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setEditedRequest(session.originalRequest);
                        setRerunDialogOpen(true);
                      }} 
                      className="gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit & Run
                    </Button>
                  </>
                )}
                {onRestore && session.appliedOperations.length > 0 && (
                  <Button size="sm" variant="outline" onClick={onRestore} className="gap-1">
                    <ArrowRight className="w-3 h-3" />
                    View Changes
                  </Button>
                )}
                {onSaveAsTemplate && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onSaveAsTemplate(session)} 
                    className="gap-1"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    Save Template
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
      
      {/* Edit & Re-run Dialog */}
      <Dialog open={rerunDialogOpen} onOpenChange={setRerunDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>
              Modify the request before re-running the agent.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedRequest}
              onChange={(e) => setEditedRequest(e.target.value)}
              placeholder="Enter your request..."
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {editedRequest.length}/2000
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRerunDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editedRequest.trim() && onRerun) {
                  onRerun(editedRequest.trim());
                  setRerunDialogOpen(false);
                }
              }}
              disabled={!editedRequest.trim()}
              className="gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Run Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'custom', label: 'Custom' },
  { value: 'component', label: 'Component' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'debug', label: 'Debug' },
  { value: 'database', label: 'Database' },
  { value: 'edge_function', label: 'Edge Function' },
  { value: 'ui_ux', label: 'UI/UX' },
  { value: 'performance', label: 'Performance' },
];

export function AgentHistoryPanel({
  projectId,
  onRestoreSession,
  onRerunSession,
  onClose,
}: AgentHistoryPanelProps) {
  const { sessions, isLoading, deleteSession, clearHistory } = useAgentHistory(projectId);
  const { createTemplate } = useTemplates();
  const { toast } = useToast();
  
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateSession, setTemplateSession] = useState<AgentSession | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('custom');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAsTemplate = (session: AgentSession) => {
    setTemplateSession(session);
    setTemplateName(session.originalRequest.slice(0, 50) + (session.originalRequest.length > 50 ? '...' : ''));
    setTemplateDescription(`Agent task with ${session.appliedOperations.length} file changes`);
    setTemplateCategory('custom');
    setTemplateDialogOpen(true);
  };

  const handleCreateTemplate = async () => {
    if (!templateSession || !templateName.trim()) return;
    
    setIsSaving(true);
    try {
      const result = await createTemplate({
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        content: templateSession.originalRequest,
        category: templateCategory,
      });
      
      if (result) {
        toast({
          title: 'Template saved',
          description: 'Your agent task has been saved as a template.',
        });
        setTemplateDialogOpen(false);
        setTemplateSession(null);
        setTemplateName('');
        setTemplateDescription('');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save template. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

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
                  onRerun={onRerunSession}
                  onSaveAsTemplate={handleSaveAsTemplate}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
      
      {/* Save as Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this agent task as a reusable template for similar tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name..."
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (optional)</Label>
              <Input
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description..."
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select value={templateCategory} onValueChange={(v) => setTemplateCategory(v as TemplateCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Request Content</Label>
              <div className="p-3 bg-muted rounded-md text-sm max-h-32 overflow-y-auto">
                {templateSession?.originalRequest}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              disabled={!templateName.trim() || isSaving}
              className="gap-1"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookmarkPlus className="w-4 h-4" />
              )}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
