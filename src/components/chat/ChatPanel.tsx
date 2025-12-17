import { useRef, useEffect, useState } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatHeader } from "./ChatHeader";
import { EmptyState } from "./EmptyState";
import { messageService } from "@/services/messageService";
import { toast } from "sonner";
import type { Message } from "@/types/database";
import type { UploadedFile } from "@/hooks/useFileUpload";

export function ChatPanel() {
  const { currentConversation } = useWorkspace();
  const { messages, loading: messagesLoading, refresh } = useMessages(currentConversation?.id);
  const { streamingMessage, isStreaming, sendMessage, stopStreaming } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleSendMessage = async (content: string, attachments?: UploadedFile[]) => {
    if (!currentConversation) return;
    setEditingContent(""); // Clear any editing state
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
      <ChatHeader />

      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto py-6 space-y-6">
          {!currentConversation ? (
            <EmptyState type="no-conversation" />
          ) : messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 && !streamingMessage ? (
            <EmptyState type="empty-conversation" onPromptSelect={handleSendMessage} />
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRegenerate={() => handleRegenerate(message.id)}
                  onEdit={handleEdit}
                  onDelete={() => handleDeleteMessage(message.id)}
                  onPin={(isPinned) => handlePinMessage(message.id, isPinned)}
                />
              ))}
              {streamingMessageObj && (
                <ChatMessage message={streamingMessageObj} isStreaming />
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto p-4">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isStreaming}
            onStop={stopStreaming}
            disabled={!currentConversation}
            initialValue={editingContent}
            onInitialValueConsumed={() => setEditingContent("")}
          />
        </div>
      </div>
    </div>
  );
}
