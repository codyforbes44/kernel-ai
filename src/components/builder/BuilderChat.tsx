import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, CheckCircle, FileCode, Trash2, FilePlus, RotateCcw, MessageSquarePlus, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useBuilderConversation, type BuilderMessage } from '@/hooks/useBuilderConversation';
import { useSchemaGenerator, isSchemaRequest } from '@/hooks/useSchemaGenerator';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { SchemaPreview, type GeneratedSchema } from './SchemaPreview';
import type { ProjectFile } from '@/types/builder';
import type { CapturedError } from './ErrorCapture';

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

// Extended message type to include schema
interface ExtendedBuilderMessage extends BuilderMessage {
  generatedSchema?: GeneratedSchema;
}

interface BuilderChatProps {
  files: ProjectFile[];
  onApplyOperations: (operations: FileOperation[]) => Promise<void>;
  projectId: string;
  errors?: CapturedError[];
  onClearErrors?: () => void;
  /** Callback that receives the fix errors handler for parent to invoke */
  onFixHandlerReady?: (handler: (errors: CapturedError[]) => void) => void;
}

// Parse the streamed JSON response
function parseStreamedResponse(content: string): AIResponse | null {
  try {
    // Clean up potential markdown code blocks
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

export function BuilderChat({ files, onApplyOperations, projectId, errors = [], onClearErrors, onFixHandlerReady }: BuilderChatProps) {
  const {
    conversationId,
    messages: persistedMessages,
    isLoading: isLoadingConversation,
    addMessage,
    updateMessage,
    startNewConversation,
    updateTitle,
  } = useBuilderConversation(projectId);

  const { isGenerating, generateSchema } = useSchemaGenerator();
  const { knowledgeBase } = useKnowledgeBase(projectId);

  const [localMessages, setLocalMessages] = useState<ExtendedBuilderMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync persisted messages to local state
  useEffect(() => {
    if (persistedMessages.length > 0) {
      setLocalMessages(persistedMessages as ExtendedBuilderMessage[]);
    }
  }, [persistedMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  const sendMessage = useCallback(async (customContent?: string, errorContext?: CapturedError[]) => {
    const messageContent = customContent || input.trim();
    if (!messageContent || isLoading || isGenerating) return;

    const userMessage: ExtendedBuilderMessage = {
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

    // Check if this is a schema generation request
    const isSchemaReq = isSchemaRequest(messageContent);

    // Add streaming/loading assistant message
    const streamingMessage: ExtendedBuilderMessage = {
      id: assistantId,
      role: 'assistant',
      content: isSchemaReq ? 'Generating database schema...' : '',
      isStreaming: true,
      createdAt: new Date(),
    };
    setLocalMessages(prev => [...prev, streamingMessage]);

    try {
      // Persist user message
      await addMessage({
        role: 'user',
        content: messageContent,
        errorContext,
      });

      // Update conversation title based on first message
      if (localMessages.length === 0) {
        await updateTitle(messageContent.slice(0, 50));
      }

      // Handle schema generation separately
      if (isSchemaReq) {
        const schema = await generateSchema(messageContent);
        
        if (schema) {
          const schemaMessage: ExtendedBuilderMessage = {
            id: assistantId,
            role: 'assistant',
            content: schema.thinking || 'I generated a database schema for you:',
            generatedSchema: schema,
            isStreaming: false,
            createdAt: new Date(),
          };

          setLocalMessages(prev => prev.map(m => 
            m.id === assistantId ? schemaMessage : m
          ));

          // Persist with schema info
          await addMessage({
            role: 'assistant',
            content: `${schema.thinking}\n\n---\n\nGenerated ${schema.tables.length} table(s) with ${schema.rlsPolicies.length} RLS policies.`,
            operations: [], // Schema doesn't have file operations
          });
        } else {
          setLocalMessages(prev => prev.map(m => 
            m.id === assistantId 
              ? { ...m, content: 'Failed to generate schema. Please try again.', isStreaming: false }
              : m
          ));
        }
        
        setIsLoading(false);
        return;
      }
      // Prepare file context (limit to key files to avoid token limits)
      const fileContext = files
        .filter(f => f.type === 'file' && f.content)
        .slice(0, 15)
        .map(f => ({
          path: f.path,
          content: f.content || '',
          language: f.language || 'plaintext',
        }));

      // Prepare error context for AI
      const errorPayload = errorContext?.map(e => ({
        type: e.type,
        message: e.message,
        stack: e.stack,
        file: e.file,
        line: e.line,
        column: e.column,
      })) || [];

      // Prepare knowledge base context for AI
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

      if (!response.body) {
        throw new Error('No response body');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE lines
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
              // Update the streaming message
              setLocalMessages(prev => prev.map(m => 
                m.id === assistantId 
                  ? { ...m, content: streamedContent }
                  : m
              ));
            }
          } catch {
            // Incomplete JSON, put back and wait
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

      // Parse the complete response
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

        // Persist assistant message
        await addMessage({
          role: 'assistant',
          content: parsedResponse.thinking || 'Here are the changes I suggest:',
          operations: parsedResponse.operations,
          isApplied: false,
        });

        // Clear errors if we were fixing them
        if (errorContext && errorContext.length > 0 && onClearErrors) {
          onClearErrors();
        }
      } else {
        // Could not parse, show raw content
        setLocalMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { 
                ...m, 
                content: streamedContent || 'I generated some code but had trouble parsing it.',
                isStreaming: false,
              }
            : m
        ));

        await addMessage({
          role: 'assistant',
          content: streamedContent || 'I generated some code but had trouble parsing it.',
        });
      }
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI response');
      
      // Update error in the assistant message
      setLocalMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { 
              ...m, 
              content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              isStreaming: false,
            }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, localMessages, files, conversationId, addMessage, updateTitle, onClearErrors]);

  // Method to fix errors - called from parent
  const handleFixErrors = useCallback((errorsToFix: CapturedError[]) => {
    const errorDescriptions = errorsToFix.map(e => 
      `[${e.type.toUpperCase()}] ${e.message}${e.file ? ` in ${e.file}` : ''}${e.line ? `:${e.line}` : ''}`
    ).join('\n');

    const prompt = `Please fix the following error${errorsToFix.length > 1 ? 's' : ''}:\n\n${errorDescriptions}`;
    sendMessage(prompt, errorsToFix);
  }, [sendMessage]);

  // Store the fix handler for parent access via ref callback
  const fixHandlerRef = useRef<(errors: CapturedError[]) => void>(handleFixErrors);
  fixHandlerRef.current = handleFixErrors;
  
  // Expose handler to parent through a stable callback
  useEffect(() => {
    if (onFixHandlerReady) {
      // Pass a function that can be called later by the parent
      onFixHandlerReady(fixHandlerRef.current);
    }
  }, [onFixHandlerReady]);

  const applyOperations = async (messageId: string, operations: FileOperation[]) => {
    setApplyingId(messageId);
    try {
      await onApplyOperations(operations);
      setLocalMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isApplied: true } : m
      ));
      
      // Update persisted message
      await updateMessage({ id: messageId, updates: { isApplied: true } });
      
      toast.success(`Applied ${operations.length} file operation(s)`);
    } catch (error) {
      toast.error('Failed to apply changes');
    } finally {
      setApplyingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't interfere with IME composition (for Chinese, Japanese, Korean input)
    if (e.nativeEvent.isComposing) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'create': return <FilePlus className="h-3.5 w-3.5 text-success" />;
      case 'update': return <FileCode className="h-3.5 w-3.5 text-primary" />;
      case 'delete': return <Trash2 className="h-3.5 w-3.5 text-destructive" />;
      default: return <FileCode className="h-3.5 w-3.5" />;
    }
  };

  const handleNewConversation = async () => {
    await startNewConversation();
    setLocalMessages([]);
  };

  if (isLoadingConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-background border-l border-border">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="h-10 flex items-center justify-between gap-2 px-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleNewConversation}
          title="New conversation"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {localMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-[250px]">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary/50" />
              <p className="text-sm text-muted-foreground">
                Describe what you want to build, and I'll generate the code for you.
              </p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setInput('Add a dark mode toggle button')}
                  className="w-full text-xs text-left px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  "Add a dark mode toggle button"
                </button>
                <button
                  onClick={() => setInput('Create a contact form with name, email, and message fields')}
                  className="w-full text-xs text-left px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  "Create a contact form"
                </button>
                <button
                  onClick={() => setInput('Add a navigation bar with links to Home, About, and Contact')}
                  className="w-full text-xs text-left px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  "Add a navigation bar"
                </button>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Database className="h-3.5 w-3.5" />
                    Database Schema
                  </div>
                  <button
                    onClick={() => setInput('Create a database schema for a blog with posts, authors, and comments')}
                    className="w-full text-xs text-left px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    "Create a blog database schema"
                  </button>
                  <button
                    onClick={() => setInput('Create database tables to store user profiles with settings and preferences')}
                    className="w-full text-xs text-left px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors mt-1"
                  >
                    "User profiles database"
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {localMessages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'text-sm',
                  message.role === 'user' && 'flex justify-end'
                )}
              >
                {message.role === 'user' ? (
                  <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[85%]">
                    {message.errorContext && message.errorContext.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs opacity-80 mb-1">
                        <RotateCcw className="h-3 w-3" />
                        Fixing {message.errorContext.length} error{message.errorContext.length > 1 ? 's' : ''}
                      </div>
                    )}
                    {message.content}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-muted px-3 py-2 rounded-lg">
                      {message.isStreaming && !message.content ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-muted-foreground">Thinking...</span>
                        </div>
                      ) : message.isStreaming ? (
                        <div>
                          <pre className="whitespace-pre-wrap font-mono text-xs overflow-hidden">
                            {message.content.slice(0, 500)}
                            {message.content.length > 500 && '...'}
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
                    
                    {/* Generated Schema */}
                    {(message as ExtendedBuilderMessage).generatedSchema && !message.isStreaming && (
                      <SchemaPreview 
                        schema={(message as ExtendedBuilderMessage).generatedSchema!}
                        onCopy={() => toast.success('SQL copied to clipboard')}
                      />
                    )}
                    
                    {/* File Operations */}
                    {message.operations && message.operations.length > 0 && !message.isStreaming && (
                      <div className="bg-card border border-border rounded-lg p-2 space-y-1.5">
                        <div className="text-xs text-muted-foreground mb-2">
                          {message.operations.length} file operation(s):
                        </div>
                        {message.operations.map((op, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs bg-muted/50 px-2 py-1.5 rounded"
                          >
                            {getOperationIcon(op.type)}
                            <span className="font-mono truncate flex-1">{op.path}</span>
                            <span className="text-muted-foreground capitalize">{op.type}</span>
                          </div>
                        ))}
                        
                        {!message.isApplied ? (
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => applyOperations(message.id, message.operations!)}
                            disabled={applyingId === message.id}
                          >
                            {applyingId === message.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3.5 w-3.5 mr-2" />
                                Apply Changes
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-xs text-success py-2">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Changes applied
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            className="min-h-[60px] max-h-[120px] resize-none pr-12 text-sm"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2 h-8 w-8"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
