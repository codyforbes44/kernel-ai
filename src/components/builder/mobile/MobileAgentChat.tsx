import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Bot, 
  Play, 
  Square, 
  Check, 
  Loader2, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileCode,
  Search,
  FolderTree,
  Wrench,
  Bug,
  Brain,
  Sparkles,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/hooks/useHaptic';
import { useAgentMode } from '@/hooks/useAgentMode';
import { MobileBuilderChat } from './MobileBuilderChat';
import type { ProjectFile } from '@/types/builder';
import type { CapturedError } from '../ErrorCapture';
import type { AgentSession, AgentStep, AgentStatus } from '@/types/agent';

interface FileOperation {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
}

interface MobileAgentChatProps {
  files: ProjectFile[];
  projectId: string;
  onApplyOperations: (operations: FileOperation[]) => Promise<void>;
  errors?: CapturedError[];
  onClearErrors?: () => void;
  onClose: () => void;
  onFileOpen?: (file: ProjectFile) => void;
  onFixHandlerReady?: (handler: (errors: CapturedError[]) => void) => void;
}

const statusConfig: Record<AgentStatus, { label: string; color: string; icon: typeof Bot }> = {
  idle: { label: 'Ready', color: 'text-muted-foreground', icon: Bot },
  planning: { label: 'Planning...', color: 'text-blue-500', icon: Brain },
  executing: { label: 'Executing...', color: 'text-amber-500', icon: Loader2 },
  applying: { label: 'Applying...', color: 'text-purple-500', icon: Wrench },
  verifying: { label: 'Verifying...', color: 'text-cyan-500', icon: Search },
  correcting: { label: 'Correcting...', color: 'text-orange-500', icon: Bug },
  complete: { label: 'Complete', color: 'text-green-500', icon: Check },
  error: { label: 'Error', color: 'text-destructive', icon: AlertCircle },
};

const stepIconMap: Record<AgentStep['type'], typeof Bot> = {
  think: Brain,
  read_file: FileCode,
  search_files: Search,
  list_files: FolderTree,
  apply_changes: Wrench,
  verify: Check,
  fix_error: Bug,
};

function MobileStepItem({ step, isExpanded, onToggle }: { 
  step: AgentStep; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = stepIconMap[step.type];
  const isRunning = step.status === 'running';
  const isComplete = step.status === 'complete';
  const isError = step.status === 'error';
  
  return (
    <div className="border-l-2 border-border pl-3 py-2 relative">
      <div 
        className="absolute -left-[7px] top-3 w-3.5 h-3.5 rounded-full bg-background border-2 border-border flex items-center justify-center"
      >
        {isRunning ? (
          <Loader2 className="w-2 h-2 text-primary animate-spin" />
        ) : isComplete ? (
          <Check className="w-2 h-2 text-green-500" />
        ) : isError ? (
          <AlertCircle className="w-2 h-2 text-destructive" />
        ) : (
          <div className="w-1 h-1 rounded-full bg-muted-foreground" />
        )}
      </div>
      
      <button 
        onClick={() => { hapticFeedback('light'); onToggle(); }}
        className="w-full text-left flex items-center gap-2 active:bg-accent/50 rounded px-2 py-1.5 -ml-2 touch-manipulation"
      >
        {step.detail ? (
          isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        ) : (
          <div className="w-4" />
        )}
        <Icon className={cn("w-4 h-4", isRunning && "animate-pulse")} />
        <span className="text-sm flex-1 truncate">{step.description}</span>
        {step.duration && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {(step.duration / 1000).toFixed(1)}s
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && step.detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-x-auto whitespace-pre-wrap">
              {step.detail.slice(0, 300)}
              {step.detail.length > 300 && '...'}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileAgentChat({
  files,
  projectId,
  onApplyOperations,
  errors = [],
  onClearErrors,
  onClose,
  onFileOpen,
  onFixHandlerReady,
}: MobileAgentChatProps) {
  const [mode, setMode] = useState<'chat' | 'agent'>('chat');
  const [request, setRequest] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showPendingDrawer, setShowPendingDrawer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    session,
    isRunning,
    runAgent,
    cancelAgent,
    applyPendingOperations,
    clearSession,
  } = useAgentMode({
    projectId,
    files,
    errors,
    onApplyOperations,
  });

  const status = session?.status || 'idle';
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  
  const progress = session 
    ? (session.iterationCount / session.maxIterations) * 100 
    : 0;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [request]);

  // Escape key to cancel agent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRunning) {
        hapticFeedback('medium');
        cancelAgent();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, cancelAgent]);

  // Show pending drawer when operations are ready
  useEffect(() => {
    if (session?.pendingOperations && session.pendingOperations.length > 0 && !isRunning) {
      hapticFeedback('success');
      setShowPendingDrawer(true);
    }
  }, [session?.pendingOperations, isRunning]);

  const handleSubmit = () => {
    if (request.trim() && !isRunning) {
      hapticFeedback('medium');
      runAgent(request.trim());
      setRequest('');
    }
  };

  const handleApplyChanges = async () => {
    hapticFeedback('medium');
    await applyPendingOperations();
    setShowPendingDrawer(false);
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  // If in chat mode, show the regular mobile chat
  if (mode === 'chat') {
    return (
      <div className="h-full flex flex-col">
        {/* Header with mode switcher */}
        <header className="h-12 flex items-center justify-between px-3 border-b border-border bg-card shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { hapticFeedback('light'); onClose(); }}
            className="touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Tabs value={mode} onValueChange={(v) => { hapticFeedback('light'); setMode(v as 'chat' | 'agent'); }}>
            <TabsList className="h-8">
              <TabsTrigger value="chat" className="h-7 px-3 text-xs gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="agent" className="h-7 px-3 text-xs gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Agent
                {isRunning && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="w-9" />
        </header>
        
        {/* Regular chat content - embedded mode hides its own header */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <MobileBuilderChat
            files={files}
            projectId={projectId}
            onApplyOperations={onApplyOperations}
            errors={errors}
            onClearErrors={onClearErrors}
            onClose={onClose}
            onFileOpen={onFileOpen}
            onFixHandlerReady={onFixHandlerReady}
            embedded
          />
        </div>
      </div>
    );
  }

  // Agent mode
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-3 border-b border-border bg-card shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { hapticFeedback('light'); onClose(); }}
          className="touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Tabs value={mode} onValueChange={(v) => { hapticFeedback('light'); setMode(v as 'chat' | 'agent'); }}>
          <TabsList className="h-8">
            <TabsTrigger value="chat" className="h-7 px-3 text-xs gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="agent" className="h-7 px-3 text-xs gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Agent
              {isRunning && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {session && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { hapticFeedback('light'); clearSession(); }}
            className="h-8 text-xs"
          >
            Clear
          </Button>
        )}
        {!session && <div className="w-12" />}
      </header>
      
      {/* Status Bar */}
      {session && (
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("w-4 h-4", config.color, isRunning && "animate-spin")} />
              <span className={cn("text-sm font-medium", config.color)}>
                {config.label}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Step {session.iterationCount}/{session.maxIterations}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
      
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {!session ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <Bot className="w-14 h-14 text-muted-foreground" />
                <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1" />
              </div>
              <h3 className="font-semibold mb-2">Agent Mode</h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto mb-6">
                Let the AI agent autonomously explore, plan, and implement complex changes with your confirmation.
              </p>
              
              {/* Quick prompts */}
              <div className="space-y-2 max-w-[280px] mx-auto">
                <button
                  onClick={() => setRequest('Add dark mode toggle with persistent preference')}
                  className="w-full text-sm text-left px-4 py-3 rounded-lg bg-muted/50 active:bg-muted transition-colors touch-manipulation"
                >
                  "Add dark mode with persistence"
                </button>
                <button
                  onClick={() => setRequest('Refactor the main component to improve performance')}
                  className="w-full text-sm text-left px-4 py-3 rounded-lg bg-muted/50 active:bg-muted transition-colors touch-manipulation"
                >
                  "Refactor for performance"
                </button>
                <button
                  onClick={() => setRequest('Add form validation to all input fields')}
                  className="w-full text-sm text-left px-4 py-3 rounded-lg bg-muted/50 active:bg-muted transition-colors touch-manipulation"
                >
                  "Add form validation"
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Original Request */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-xs font-medium text-primary">Task:</span>
                <p className="text-sm mt-1">{session.originalRequest}</p>
              </div>
              
              {/* Steps Timeline */}
              <div className="space-y-0">
                {session.steps.map((step) => (
                  <MobileStepItem
                    key={step.id}
                    step={step}
                    isExpanded={expandedSteps.has(step.id)}
                    onToggle={() => toggleStep(step.id)}
                  />
                ))}
              </div>
              
              {/* Thinking display */}
              {session.thinking && isRunning && (
                <div className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-medium">Thinking...</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {session.thinking}
                  </p>
                </div>
              )}
              
              {/* Pending Operations Banner */}
              {session.pendingOperations.length > 0 && !isRunning && (
                <button
                  onClick={() => { hapticFeedback('medium'); setShowPendingDrawer(true); }}
                  className="w-full p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-left touch-manipulation"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {session.pendingOperations.length} change(s) ready
                    </span>
                    <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
                      Tap to review
                    </Badge>
                  </div>
                </button>
              )}
              
              {/* Applied Operations */}
              {session.appliedOperations.length > 0 && (
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {session.appliedOperations.length} change(s) applied
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div 
        className="p-4 border-t border-border bg-background"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Describe a complex task..."
            disabled={isRunning}
            className="flex-1 min-h-[48px] max-h-[100px] resize-none text-base"
            rows={1}
          />
          {isRunning ? (
            <Button 
              variant="destructive" 
              size="icon"
              className="h-12 w-12 touch-manipulation"
              onClick={() => { hapticFeedback('medium'); cancelAgent(); }}
            >
              <Square className="w-5 h-5" />
            </Button>
          ) : (
            <Button 
              size="icon"
              className="h-12 w-12 touch-manipulation"
              onClick={handleSubmit}
              disabled={!request.trim()}
            >
              <Play className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Pending Operations Drawer */}
      <Drawer open={showPendingDrawer} onOpenChange={setShowPendingDrawer}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-500" />
              Review Changes
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 pb-4">
            <ScrollArea className="max-h-[40vh]">
              <div className="space-y-2">
                {session?.pendingOperations.map((op, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    {op.type === 'create' && <FileCode className="h-4 w-4 text-green-500" />}
                    {op.type === 'update' && <Wrench className="h-4 w-4 text-primary" />}
                    {op.type === 'delete' && <AlertCircle className="h-4 w-4 text-destructive" />}
                    <span className="text-sm font-mono truncate flex-1">{op.path}</span>
                    <Badge variant="outline" className="capitalize text-xs">{op.type}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <DrawerFooter className="pt-2">
            <Button
              onClick={handleApplyChanges}
              className="w-full h-12 text-base touch-manipulation"
            >
              <Check className="h-5 w-5 mr-2" />
              Apply {session?.pendingOperations.length} Change{session?.pendingOperations.length !== 1 ? 's' : ''}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPendingDrawer(false)}
              className="w-full h-12 touch-manipulation"
            >
              Review Later
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
