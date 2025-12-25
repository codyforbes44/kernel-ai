import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  Sparkles, 
  CheckCircle, 
  FileCode, 
  Trash2, 
  FilePlus, 
  RotateCcw, 
  MessageSquarePlus 
} from 'lucide-react';
import { KernelThinkingIndicator } from '../KernelThinkingIndicator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { hapticFeedback } from '@/hooks/useHaptic';
import { useBuilderConversation, type BuilderMessage } from '@/hooks/useBuilderConversation';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { MobileOperationConfirm } from './MobileOperationConfirm';
import type { ProjectFile } from '@/types/builder';
import type { CapturedError } from '../ErrorCapture';

interface FileOperation {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
}

interface AIResponse {
  thinking: string;
  operations: FileOperation[];
  error?: string;
}

interface MobileBuilderChatProps {
  files: ProjectFile[];
  projectId: string;
  onApplyOperations: (operations: FileOperation[]) => Promise<void>;
  errors?: CapturedError[];
  onClearErrors?: () => void;
  onClose: () => void;
  onFileOpen?: (file: ProjectFile) => void;
  onFixHandlerReady?: (handler: (errors: CapturedError[]) => void) => void;
  /** When true, hides the header (for embedding in MobileAgentChat) */
  embedded?: boolean;
}

function parseStreamedResponse(content: string): AIResponse | null {
  try {
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();
    return JSON.parse(jsonContent);
  } catch {
    return null;
  }
}

export function MobileBuilderChat({
  files,
  projectId,
  onApplyOperations,
  errors = [],
  onClearErrors,
  onClose,
  onFileOpen,
  onFixHandlerReady,
  embedded = false,
}: MobileBuilderChatProps) {
  const {
    conversationId,
    messages: persistedMessages,
    isLoading: isLoadingConversation,
    addMessage,
    updateMessage,
    startNewConversation,
    updateTitle,
  } = useBuilderConversation(projectId);

  const { knowledgeBase } = useKnowledgeBase(projectId);

  const [localMessages, setLocalMessages] = useState<BuilderMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [pendingOperations, setPendingOperations] = useState<{
    messageId: string;
    operations: FileOperation[];
  } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync persisted messages
  useEffect(() => {
    if (persistedMessages.length > 0) {
      setLocalMessages(persistedMessages);
    }
  }, [persistedMessages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  const sendMessage = useCallback(async (customContent?: string, errorContext?: CapturedError[]) => {
    const messageContent = customContent || input.trim();
    if (!messageContent || isLoading) return;

    hapticFeedback('medium');

    const userMessage: BuilderMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageContent,
      errorContext,
      createdAt: new Date(),
    };

    const assistantId = crypto.randomUUID();
    
    setLocalMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const streamingMessage: BuilderMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      createdAt: new Date(),
    };
    setLocalMessages(prev => [...prev, streamingMessage]);

    try {
      await addMessage({
        role: 'user',
        content: messageContent,
        errorContext,
      });

      if (localMessages.length === 0) {
        await updateTitle(messageContent.slice(0, 50));
      }

      const fileContext = files
        .filter(f => f.type === 'file' && f.content)
        .slice(0, 15)
        .map(f => ({
          path: f.path,
          content: f.content || '',
          language: f.language || 'plaintext',
        }));

      const errorPayload = errorContext?.map(e => ({
        type: e.type,
        message: e.message,
        stack: e.stack,
        file: e.file,
        line: e.line,
        column: e.column,
      })) || [];

      const kbContext = {
        instructions: knowledgeBase.instructions || undefined,
        techStack: knowledgeBase.techStack.length > 0 ? knowledgeBase.techStack : undefined,
        conventions: (knowledgeBase.conventions.componentNaming || knowledgeBase.conventions.fileNaming || 
                     knowledgeBase.conventions.stateManagement || knowledgeBase.conventions.styling ||
                     knowledgeBase.conventions.customRules.length > 0) ? knowledgeBase.conventions : undefined,
        contextDocs: knowledgeBase.contextDocs.length > 0 ? knowledgeBase.contextDocs : undefined,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/builder-ai-enhanced`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              ...localMessages.filter(m => !m.isStreaming).map(m => ({ 
                role: m.role, 
                content: m.content 
              })),
              { role: 'user', content: messageContent },
            ],
            files: fileContext,
            errors: errorPayload,
            conversationId,
            knowledgeBase: kbContext,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              streamedContent += content;
              setLocalMessages(prev => prev.map(m => 
                m.id === assistantId ? { ...m, content: streamedContent } : m
              ));
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) streamedContent += content;
          } catch { /* ignore */ }
        }
      }

      const parsedResponse = parseStreamedResponse(streamedContent);
      
      if (parsedResponse) {
        const finalMessage: BuilderMessage = {
          id: assistantId,
          role: 'assistant',
          content: parsedResponse.thinking || 'Here are the changes I suggest:',
          operations: parsedResponse.operations,
          isStreaming: false,
          isApplied: false,
          createdAt: new Date(),
        };

        setLocalMessages(prev => prev.map(m => 
          m.id === assistantId ? finalMessage : m
        ));

        await addMessage({
          role: 'assistant',
          content: parsedResponse.thinking || 'Here are the changes I suggest:',
          operations: parsedResponse.operations,
          isApplied: false,
        });

        if (errorContext && errorContext.length > 0 && onClearErrors) {
          onClearErrors();
        }

        hapticFeedback('success');
      } else {
        setLocalMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: streamedContent || 'I generated some code but had trouble parsing it.', isStreaming: false }
            : m
        ));

        await addMessage({
          role: 'assistant',
          content: streamedContent || 'I generated some code but had trouble parsing it.',
        });
      }
    } catch (error) {
      console.error('AI chat error:', error);
      hapticFeedback('error');
      toast.error(error instanceof Error ? error.message : 'Failed to get AI response');
      
      setLocalMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`, isStreaming: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, localMessages, files, conversationId, addMessage, updateTitle, onClearErrors, knowledgeBase]);

  // Fix errors handler
  const handleFixErrors = useCallback((errorsToFix: CapturedError[]) => {
    const errorDescriptions = errorsToFix.map(e => 
      `[${e.type.toUpperCase()}] ${e.message}${e.file ? ` in ${e.file}` : ''}${e.line ? `:${e.line}` : ''}`
    ).join('\n');

    const prompt = `Please fix the following error${errorsToFix.length > 1 ? 's' : ''}:\n\n${errorDescriptions}`;
    sendMessage(prompt, errorsToFix);
  }, [sendMessage]);

  // Expose handler to parent
  const fixHandlerRef = useRef<(errors: CapturedError[]) => void>(handleFixErrors);
  fixHandlerRef.current = handleFixErrors;
  
  useEffect(() => {
    if (onFixHandlerReady) {
      onFixHandlerReady(fixHandlerRef.current);
    }
  }, [onFixHandlerReady]);

  const handleApplyOperations = async () => {
    if (!pendingOperations) return;
    
    setApplyingId(pendingOperations.messageId);
    try {
      await onApplyOperations(pendingOperations.operations);
      setLocalMessages(prev => prev.map(m => 
        m.id === pendingOperations.messageId ? { ...m, isApplied: true } : m
      ));
      
      await updateMessage({ id: pendingOperations.messageId, updates: { isApplied: true } });
      
      hapticFeedback('success');
      toast.success(`Applied ${pendingOperations.operations.length} file operation(s)`);
    } catch (error) {
      hapticFeedback('error');
      toast.error('Failed to apply changes');
    } finally {
      setApplyingId(null);
      setPendingOperations(null);
    }
  };

  const handleNewConversation = async () => {
    hapticFeedback('medium');
    await startNewConversation();
    setLocalMessages([]);
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'create': return <FilePlus className="h-4 w-4 text-success" />;
      case 'update': return <FileCode className="h-4 w-4 text-primary" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-destructive" />;
      default: return <FileCode className="h-4 w-4" />;
    }
  };

  if (isLoadingConversation) {
    return (
      <div className="h-full flex flex-col">
        {!embedded && (
          <header className="h-12 flex items-center justify-between px-3 border-b border-border bg-card shrink-0">
            <Button variant="ghost" size="icon" onClick={onClose} className="touch-manipulation">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">AI Assistant</span>
            <div className="w-9" />
          </header>
        )}
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - only shown when not embedded */}
      {!embedded && (
        <header className="h-12 flex items-center justify-between px-3 border-b border-border bg-card shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { hapticFeedback('light'); onClose(); }}
            className="touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 touch-manipulation"
            onClick={handleNewConversation}
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </header>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {localMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-[280px]">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary/50" />
              <p className="text-sm text-muted-foreground mb-4">
                Describe what you want to build, and I'll generate the code for you.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setInput('Add a dark mode toggle button')}
                  className="w-full text-sm text-left px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted active:bg-muted/70 transition-colors touch-manipulation"
                >
                  "Add a dark mode toggle"
                </button>
                <button
                  onClick={() => setInput('Create a contact form with validation')}
                  className="w-full text-sm text-left px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted active:bg-muted/70 transition-colors touch-manipulation"
                >
                  "Create a contact form"
                </button>
                <button
                  onClick={() => setInput('Add a navigation bar')}
                  className="w-full text-sm text-left px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted active:bg-muted/70 transition-colors touch-manipulation"
                >
                  "Add a navigation bar"
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {localMessages.map((message, index) => {
              // Find the preceding user message for context
              const precedingUserMessage = message.role === 'assistant' 
                ? localMessages.slice(0, index).reverse().find(m => m.role === 'user')
                : undefined;
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    'text-sm',
                    message.role === 'user' && 'flex justify-end'
                  )}
                >
                  {message.role === 'user' ? (
                    <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl max-w-[85%]">
                      {message.errorContext && message.errorContext.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs opacity-80 mb-1">
                          <RotateCcw className="h-3 w-3" />
                          Fixing {message.errorContext.length} error{message.errorContext.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {message.content}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-muted px-4 py-3 rounded-2xl">
                        {message.isStreaming && !message.content ? (
                          <KernelThinkingIndicator prompt={precedingUserMessage?.content} />
                        ) : message.isStreaming ? (
                        <div>
                          <pre className="whitespace-pre-wrap font-mono text-xs overflow-hidden">
                            {message.content.slice(0, 300)}
                            {message.content.length > 300 && '...'}
                          </pre>
                          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs">Generating code...</span>
                          </div>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    
                    {/* File Operations */}
                    {message.operations && message.operations.length > 0 && !message.isStreaming && (
                      <div className="bg-card border border-border rounded-xl p-3 space-y-2">
                        <div className="text-xs text-muted-foreground">
                          {message.operations.length} file operation(s):
                        </div>
                        {message.operations.slice(0, 3).map((op, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-2 rounded-lg"
                          >
                            {getOperationIcon(op.type)}
                            <span className="font-mono truncate flex-1 text-xs">{op.path}</span>
                          </div>
                        ))}
                        {message.operations.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{message.operations.length - 3} more
                          </div>
                        )}
                        
                        {!message.isApplied ? (
                          <Button
                            className="w-full h-11 mt-2 touch-manipulation"
                            onClick={() => {
                              hapticFeedback('medium');
                              setPendingOperations({ messageId: message.id, operations: message.operations! });
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Review & Apply
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-sm text-success py-2">
                            <CheckCircle className="h-4 w-4" />
                            Changes applied
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div 
        className="p-4 border-t border-border bg-background"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Describe what you want to build..."
            className="min-h-[52px] max-h-[120px] resize-none pr-14 text-base"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2 h-10 w-10 touch-manipulation"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Operation Confirmation Sheet */}
      <MobileOperationConfirm
        open={!!pendingOperations}
        onOpenChange={(open) => !open && setPendingOperations(null)}
        operations={pendingOperations?.operations || []}
        onApply={handleApplyOperations}
        isApplying={!!applyingId}
      />
    </div>
  );
}
