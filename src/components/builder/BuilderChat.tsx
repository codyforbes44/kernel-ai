import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, CheckCircle, FileCode, Trash2, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ProjectFile } from '@/types/builder';

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

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  operations?: FileOperation[];
  isApplied?: boolean;
  isStreaming?: boolean;
}

interface BuilderChatProps {
  files: ProjectFile[];
  onApplyOperations: (operations: FileOperation[]) => Promise<void>;
  projectId: string;
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

export function BuilderChat({ files, onApplyOperations, projectId }: BuilderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    const assistantId = crypto.randomUUID();
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add streaming assistant message
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }]);

    try {
      // Prepare file context (limit to key files to avoid token limits)
      const fileContext = files
        .filter(f => f.type === 'file' && f.content)
        .slice(0, 10)
        .map(f => ({
          path: f.path,
          content: f.content || '',
          language: f.language || 'plaintext',
        }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/builder-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: input.trim() },
            ],
            files: fileContext,
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
              setMessages(prev => prev.map(m => 
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
        setMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { 
                ...m, 
                content: parsedResponse.thinking || 'Here are the changes I suggest:',
                operations: parsedResponse.operations,
                isStreaming: false,
                isApplied: false,
              }
            : m
        ));
      } else {
        // Could not parse, show raw content
        setMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { 
                ...m, 
                content: streamedContent || 'I generated some code but had trouble parsing it.',
                isStreaming: false,
              }
            : m
        ));
      }
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI response');
      
      // Update error in the assistant message
      setMessages(prev => prev.map(m => 
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
  }, [input, isLoading, messages, files]);

  const applyOperations = async (messageId: string, operations: FileOperation[]) => {
    setApplyingId(messageId);
    try {
      await onApplyOperations(operations);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isApplied: true } : m
      ));
      toast.success(`Applied ${operations.length} file operation(s)`);
    } catch (error) {
      toast.error('Failed to apply changes');
    } finally {
      setApplyingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border bg-muted/30">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">AI Assistant</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {messages.length === 0 ? (
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
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'text-sm',
                  message.role === 'user' && 'flex justify-end'
                )}
              >
                {message.role === 'user' ? (
                  <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[85%]">
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
            onClick={sendMessage}
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
