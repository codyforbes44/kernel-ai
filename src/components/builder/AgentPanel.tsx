import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { AgentSession, AgentStep, AgentStatus } from '@/types/agent';

interface AgentPanelProps {
  session: AgentSession | null;
  isRunning: boolean;
  onStart: (request: string) => void;
  onCancel: () => void;
  onApplyChanges: () => void;
  onClear: () => void;
}

const statusConfig: Record<AgentStatus, { label: string; color: string; icon: typeof Bot }> = {
  idle: { label: 'Ready', color: 'text-muted-foreground', icon: Bot },
  planning: { label: 'Planning...', color: 'text-blue-500', icon: Brain },
  executing: { label: 'Executing...', color: 'text-amber-500', icon: Loader2 },
  applying: { label: 'Applying changes...', color: 'text-purple-500', icon: Wrench },
  verifying: { label: 'Verifying...', color: 'text-cyan-500', icon: Search },
  correcting: { label: 'Self-correcting...', color: 'text-orange-500', icon: Bug },
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

function StepItem({ step, isExpanded, onToggle }: { 
  step: AgentStep; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = stepIconMap[step.type];
  const isRunning = step.status === 'running';
  const isComplete = step.status === 'complete';
  const isError = step.status === 'error';
  
  return (
    <div className="border-l-2 border-border pl-4 py-2 relative">
      <div 
        className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-background border-2 border-border flex items-center justify-center"
      >
        {isRunning ? (
          <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
        ) : isComplete ? (
          <Check className="w-2.5 h-2.5 text-green-500" />
        ) : isError ? (
          <AlertCircle className="w-2.5 h-2.5 text-destructive" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
        )}
      </div>
      
      <button 
        onClick={onToggle}
        className="w-full text-left flex items-center gap-2 hover:bg-accent/50 rounded px-2 py-1 -ml-2"
      >
        {step.detail ? (
          isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
        ) : (
          <div className="w-3" />
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
            <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-x-auto">
              {step.detail}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AgentPanel({
  session,
  isRunning,
  onStart,
  onCancel,
  onApplyChanges,
  onClear,
}: AgentPanelProps) {
  const [request, setRequest] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  
  const status = session?.status || 'idle';
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  
  const progress = session 
    ? (session.iterationCount / session.maxIterations) * 100 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (request.trim() && !isRunning) {
      onStart(request.trim());
      setRequest('');
    }
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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-5 h-5 text-primary" />
            {isRunning && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </div>
          <span className="font-semibold">Agent Mode</span>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Autonomous
          </Badge>
        </div>
        
        {session && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
      
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
              Iteration {session.iterationCount}/{session.maxIterations}
            </span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}
      
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {!session ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">AI Agent Mode</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Let the agent autonomously explore, plan, and implement complex changes 
                with self-correcting capabilities.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Original Request */}
              <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <span className="text-xs font-medium text-primary">Task:</span>
                <p className="text-sm mt-1">{session.originalRequest}</p>
              </div>
              
              {/* Steps Timeline */}
              <div className="space-y-0">
                {session.steps.map((step) => (
                  <StepItem
                    key={step.id}
                    step={step}
                    isExpanded={expandedSteps.has(step.id)}
                    onToggle={() => toggleStep(step.id)}
                  />
                ))}
              </div>
              
              {/* Thinking display */}
              {session.thinking && isRunning && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-medium">Thinking...</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {session.thinking}
                  </p>
                </div>
              )}
              
              {/* Pending Operations */}
              {session.pendingOperations.length > 0 && (
                <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {session.pendingOperations.length} pending change(s)
                    </span>
                    <Button size="sm" onClick={onApplyChanges}>
                      Apply All
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {session.pendingOperations.map((op, i) => (
                      <div key={i} className="text-xs flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {op.type}
                        </Badge>
                        <span className="truncate">{op.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Applied Operations */}
              {session.appliedOperations.length > 0 && (
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {session.appliedOperations.length} change(s) applied
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Describe a complex task for the agent..."
            disabled={isRunning}
            className="flex-1"
          />
          {isRunning ? (
            <Button type="button" variant="destructive" onClick={onCancel}>
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!request.trim()}>
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
