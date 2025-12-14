import { useRef, useEffect } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatHeader } from "./ChatHeader";
import { EmptyState } from "./EmptyState";
import type { Message } from "@/types/database";

export function ChatPanel() {
  const { currentConversation } = useWorkspace();
  const { messages, loading: messagesLoading, refresh } = useMessages(currentConversation?.id);
  const { streamingMessage, isStreaming, sendMessage, stopStreaming } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) return;
    await sendMessage(content, currentConversation.id);
    // Refetch messages to get persisted messages with proper IDs
    setTimeout(() => refresh(), 100);
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
            <EmptyState type="empty-conversation" />
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
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
          />
        </div>
      </div>
    </div>
  );
}
