import { useState, useRef, useEffect } from 'react';
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
}

interface BuilderChatProps {
  files: ProjectFile[];
  onApplyOperations: (operations: FileOperation[]) => Promise<void>;
  projectId: string;
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare file context (limit to key files to avoid token limits)
      const fileContext = files
        .filter(f => f.type === 'file' && f.content)
        .slice(0, 10) // Limit files
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

      const data: AIResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.thinking || 'Here are the changes I suggest:',
        operations: data.operations,
        isApplied: false,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI response');
      
      // Add error message
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
                      {message.content}
                    </div>
                    
                    {/* File Operations */}
                    {message.operations && message.operations.length > 0 && (
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
            
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating code...
              </div>
            )}
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
