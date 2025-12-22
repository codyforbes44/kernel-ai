import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  User, 
  Wrench, 
  ChevronDown,
  ChevronRight,
  Sparkles,
  MessageSquare,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AgentPanel } from './AgentPanel';
import { AgentHistoryPanel } from './AgentHistoryPanel';
import { BuilderChat } from './BuilderChat';
import { useAgentMode } from '@/hooks/useAgentMode';
import { useAgentHistory } from '@/hooks/useAgentHistory';
import type { ProjectFile } from '@/types/builder';
import type { CapturedError } from './ErrorCapture';
import type { AgentMessage } from '@/types/agent';

interface AgentChatProps {
  files: ProjectFile[];
  projectId: string;
  errors: CapturedError[];
  onApplyOperations: (operations: Array<{ type: 'create' | 'update' | 'delete'; path: string; content?: string }>) => Promise<void>;
  onClearErrors: () => void;
  onFixHandlerReady: (handler: (errors: CapturedError[]) => void) => void;
  onRunningChange?: (isRunning: boolean) => void;
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const [expanded, setExpanded] = useState(false);
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';
  
  // Parse tool result for display
  let toolContent = message.content;
  if (isTool) {
    try {
      const parsed = JSON.parse(message.content);
      toolContent = JSON.stringify(parsed, null, 2);
    } catch {
      // Keep original content
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 p-3 rounded-lg",
        isUser && "bg-primary/5 ml-8",
        !isUser && !isTool && "bg-muted/50 mr-8",
        isTool && "bg-accent/30 mx-4 border border-border"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser && "bg-primary text-primary-foreground",
        !isUser && !isTool && "bg-secondary",
        isTool && "bg-accent"
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isTool ? (
          <Wrench className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? 'You' : isTool ? 'Tool Result' : 'Agent'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        {isTool ? (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {expanded ? 'Hide' : 'Show'} tool output
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.pre
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 text-xs bg-background p-2 rounded overflow-x-auto max-h-48"
                >
                  {toolContent}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        )}
        
        {/* Tool calls indicator */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.toolCalls.map((tc) => (
              <Badge key={tc.id} variant="outline" className="text-xs">
                <Wrench className="w-3 h-3 mr-1" />
                {tc.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AgentChat({
  files,
  projectId,
  errors,
  onApplyOperations,
  onClearErrors,
  onFixHandlerReady,
  onRunningChange,
}: AgentChatProps) {
  const [mode, setMode] = useState<'chat' | 'agent' | 'history'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { saveSession, sessions } = useAgentHistory(projectId);
  
  const {
    session,
    isRunning,
    messages,
    runAgent,
    cancelAgent,
    applyPendingOperations,
    clearSession,
  } = useAgentMode({
    projectId,
    files,
    errors,
    onApplyOperations,
    onSessionComplete: saveSession,
  });

  // Notify parent when running state changes
  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      {/* Mode Switcher */}
      <div className="p-2 border-b bg-background/80 backdrop-blur-sm">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'chat' | 'agent' | 'history')}>
          <TabsList className="w-full">
            <TabsTrigger value="chat" className="flex-1 gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="agent" className="flex-1 gap-2">
              <Sparkles className="w-4 h-4" />
              Agent
              {isRunning && (
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-2">
              <History className="w-4 h-4" />
              History
              {sessions.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {sessions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0">
        {mode === 'chat' ? (
          <BuilderChat
            files={files}
            onApplyOperations={onApplyOperations}
            errors={errors}
            onClearErrors={onClearErrors}
            projectId={projectId}
            onFixHandlerReady={onFixHandlerReady}
          />
        ) : mode === 'agent' ? (
          <AgentPanel
            session={session}
            isRunning={isRunning}
            onStart={runAgent}
            onCancel={cancelAgent}
            onApplyChanges={applyPendingOperations}
            onClear={clearSession}
          />
        ) : (
          <AgentHistoryPanel
            projectId={projectId}
          />
        )}
      </div>
    </div>
  );
}
