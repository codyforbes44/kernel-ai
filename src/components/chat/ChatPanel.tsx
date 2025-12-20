import { useRef, useEffect, useState, useCallback } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useOfflineQueue, type QueuedMessage } from "@/hooks/useOfflineQueue";
import { ModelSelector } from "./ModelSelector";
import { MessageSearch } from "./MessageSearch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatHeader } from "./ChatHeader";
import { EmptyState } from "./EmptyState";
import { messageService } from "@/services/messageService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/database";
import type { UploadedFile } from "@/hooks/useFileUpload";

interface ChatPanelProps {
  isMobile?: boolean;
}

export function ChatPanel({ isMobile }: ChatPanelProps = {}) {
  const { currentConversation, branchConversation } = useWorkspace();
  const { messages, loading: messagesLoading, refresh } = useMessages(currentConversation?.id);
  const { streamingMessage, isStreaming, sendMessage, stopStreaming, selectedModel, setSelectedModel } = useChat();
  const { preferences } = useUserPreferences();
  const { isOnline, isChecking, retryConnection, queue, queueLength, isSyncing, addToQueue, setSyncHandler } = useOfflineQueue();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingContent, setEditingContent] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Set up sync handler for queued messages
  const handleSyncMessage = useCallback(async (queuedMsg: QueuedMessage) => {
    await sendMessage(
      queuedMsg.content,
      queuedMsg.conversationId,
      queuedMsg.linkedProject,
      queuedMsg.attachments
    );
  }, [sendMessage]);

  useEffect(() => {
    setSyncHandler(handleSyncMessage);
  }, [setSyncHandler, handleSyncMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleSendMessage = async (content: string, attachments?: UploadedFile[]) => {
    if (!currentConversation) return;
    setEditingContent(""); // Clear any editing state

    // If offline, queue the message
    if (!isOnline) {
      addToQueue(content, currentConversation.id, {
        url: currentConversation.lovable_project_url,
        name: currentConversation.lovable_project_name,
      }, attachments);
      return;
    }

    await sendMessage(content, currentConversation.id, {
      url: currentConversation.lovable_project_url,
      name: currentConversation.lovable_project_name,
    }, attachments);
    // Refetch messages to get persisted messages with proper IDs
    setTimeout(() => refresh(), 100);
  };

  const handleRegenerate = async (messageId: string) => {
    if (!currentConversation) return;
    
    // Find the message to regenerate (should be an AI message)
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Find the preceding user message
    let userMessage: Message | null = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMessage = messages[i];
        break;
      }
    }
    
    if (!userMessage) {
      toast.error("Could not find the original message to regenerate");
      return;
    }
    
    try {
      // Delete the AI message we're regenerating
      await messageService.delete(messageId);
      await refresh();
      
      // Resend the user message to get a new response
      await sendMessage(userMessage.content, currentConversation.id, {
        url: currentConversation.lovable_project_url,
        name: currentConversation.lovable_project_name,
      });
      
      setTimeout(() => refresh(), 100);
      toast.success("Response regenerated");
    } catch {
      toast.error("Failed to regenerate response");
    }
  };

  const handleEdit = (content: string) => {
    setEditingContent(content);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.delete(messageId);
      await refresh();
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    try {
      await messageService.pin(messageId, isPinned);
      await refresh();
      toast.success(isPinned ? "Message pinned" : "Message unpinned");
    } catch {
      toast.error("Failed to update message");
    }
  };

  const handleBranchFromMessage = async (messageId: string) => {
    if (!currentConversation) return;
    
    const branched = await branchConversation(currentConversation.id, messageId);
    if (branched) {
      toast.success("Conversation branched! You can now continue from this point.");
    } else {
      toast.error("Failed to branch conversation");
    }
  };

  // Handle search result selection - scroll to and highlight message
  const handleSearchResultSelect = useCallback((messageId: string) => {
    setHighlightedMessageId(messageId);
    
    // Find the message element and scroll to it
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    
    // Clear highlight after a delay
    setTimeout(() => setHighlightedMessageId(null), 2000);
  }, []);
    
    const branched = await branchConversation(currentConversation.id, messageId);
    if (branched) {
      toast.success("Conversation branched! You can now continue from this point.");
    } else {
      toast.error("Failed to branch conversation");
    }
  };

  const streamingMessageObj: Message | null = streamingMessage ? {
    id: "streaming",
    content: streamingMessage,
    role: "assistant",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "",
    conversation_id: currentConversation?.id || "",
    is_starred: false,
    is_pinned: false,
    is_helpful: null,
    tokens_used: 0,
    model: null,
    metadata: null,
  } : null;

  return (
    <div className="h-full flex flex-col bg-background">
      {!isMobile && <ChatHeader />}

      {/* Search bar for conversations with messages */}
      {currentConversation && messages.length > 0 && !isMobile && (
        <div className="flex justify-end px-4 py-2 border-b border-border/30">
          <MessageSearch
            messages={messages}
            onResultSelect={handleSearchResultSelect}
          />
        </div>
      )}

      {/* Offline indicator for desktop */}
      {!isMobile && (!isOnline || queueLength > 0 || isSyncing) && (
        <div className="flex justify-center py-2 border-b border-border/50">
          <OfflineIndicator
            isOnline={isOnline}
            queueLength={queueLength}
            isSyncing={isSyncing}
            isChecking={isChecking}
            onRetry={retryConnection}
          />
        </div>
      )}

      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className={cn("mx-auto py-6 space-y-6", isMobile ? "max-w-full px-2" : "max-w-3xl")}>
          {!currentConversation ? (
            <EmptyState type="no-conversation" />
          ) : messagesLoading ? (
            <div className="space-y-6 animate-fade-in">
              {/* User message skeleton */}
              <div className="flex justify-end">
                <div className="max-w-[80%] space-y-2">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <Skeleton className="h-3 w-16" delay={0} />
                    <Skeleton className="h-6 w-6 rounded-full" delay={25} />
                  </div>
                  <div className="bg-primary/10 rounded-2xl rounded-tr-md p-4 space-y-2">
                    <Skeleton className="h-4 w-48" delay={50} />
                    <Skeleton className="h-4 w-32" delay={75} />
                  </div>
                </div>
              </div>
              
              {/* Assistant message skeleton */}
              <div className="flex justify-start">
                <div className="max-w-[80%] space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-6 w-6 rounded-full" delay={100} />
                    <Skeleton className="h-3 w-20" delay={125} />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-md p-4 space-y-3">
                    <Skeleton className="h-4 w-full" delay={150} />
                    <Skeleton className="h-4 w-full" delay={175} />
                    <Skeleton className="h-4 w-3/4" delay={200} />
                    <Skeleton className="h-4 w-5/6" delay={225} />
                  </div>
                </div>
              </div>
              
              {/* Second user message skeleton */}
              <div className="flex justify-end">
                <div className="max-w-[80%] space-y-2">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <Skeleton className="h-3 w-12" delay={250} />
                    <Skeleton className="h-6 w-6 rounded-full" delay={275} />
                  </div>
                  <div className="bg-primary/10 rounded-2xl rounded-tr-md p-4 space-y-2">
                    <Skeleton className="h-4 w-36" delay={300} />
                  </div>
                </div>
              </div>
              
              {/* Second assistant message skeleton */}
              <div className="flex justify-start">
                <div className="max-w-[80%] space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-6 w-6 rounded-full" delay={325} />
                    <Skeleton className="h-3 w-16" delay={350} />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-md p-4 space-y-3">
                    <Skeleton className="h-4 w-full" delay={375} />
                    <Skeleton className="h-4 w-2/3" delay={400} />
                  </div>
                </div>
              </div>
            </div>
          ) : messages.length === 0 && !streamingMessage ? (
            <EmptyState type="empty-conversation" onPromptSelect={handleSendMessage} />
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  id={`message-${message.id}`}
                  className={cn(
                    "transition-all duration-500",
                    highlightedMessageId === message.id && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg"
                  )}
                >
                  <ChatMessage
                    message={message}
                    onRegenerate={() => handleRegenerate(message.id)}
                    onEdit={handleEdit}
                    onDelete={() => handleDeleteMessage(message.id)}
                    onPin={(isPinned) => handlePinMessage(message.id, isPinned)}
                    onBranch={handleBranchFromMessage}
                  />
                </div>
              ))}
              {streamingMessageObj && (
                <ChatMessage message={streamingMessageObj} isStreaming />
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className={cn(
        "border-t border-border/50 bg-background/80 backdrop-blur-sm",
        isMobile && "safe-area-bottom"
      )}>
        <div className={cn("p-4", isMobile ? "px-3" : "max-w-3xl mx-auto")}>
          <div className="flex items-center gap-2 mb-2">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              disabled={isStreaming}
              defaultModel={preferences.defaultAIModel}
            />
          </div>
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isStreaming}
            onStop={stopStreaming}
            disabled={!currentConversation}
            initialValue={editingContent}
            onInitialValueConsumed={() => setEditingContent("")}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}
