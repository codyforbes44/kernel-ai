import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompanionChat } from '@/hooks/useCompanionChat';
import { useCompanionMessages, useCompanion, useCompanionRelationship, useCompanionConversations } from '@/hooks/useCompanion';
import { useCompanionVoice } from '@/hooks/useCompanionVoice';
import { useCompanionVoiceSettings } from '@/hooks/useCompanionVoiceSettings';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';
import { StreamingMessage } from './StreamingMessage';
import { Loader2 } from 'lucide-react';

import type { Milestone } from '@/types/companion';

interface CompanionChatProps {
  companionId: string;
  conversationId?: string;
  onConversationChange?: (conversationId: string) => void;
  onNewMilestone?: (milestone: Milestone) => void;
}

export function CompanionChat({ companionId, conversationId: externalConversationId, onConversationChange, onNewMilestone }: CompanionChatProps) {
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [lastAutoPlayedId, setLastAutoPlayedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: companion, isLoading: isLoadingCompanion } = useCompanion(companionId);
  const { data: relationship } = useCompanionRelationship(companionId);
  const { data: conversations = [] } = useCompanionConversations(relationship?.id ?? null);
  
  // Voice settings per companion
  const { settings: voiceSettings, updateSettings: updateVoiceSettings } = useCompanionVoiceSettings(companionId);

  const { 
    sendMessage, 
    isLoading, 
    isStreaming,
    conversationId: activeConversationId, 
    pendingMessage,
    streamingContent 
  } = useCompanionChat({
    companionId,
    conversationId: externalConversationId,
    enableStreaming: true,
    onNewMilestone,
    onAffinityChange: (level, change) => {
      console.log(`Affinity changed: ${change > 0 ? '+' : ''}${change} → ${level}`);
    },
  });

  // Sync conversation ID changes back to parent
  useEffect(() => {
    if (activeConversationId && onConversationChange && activeConversationId !== externalConversationId) {
      onConversationChange(activeConversationId);
    }
  }, [activeConversationId, externalConversationId, onConversationChange]);

  const conversationId = externalConversationId || activeConversationId;
  const { data: messages = [] } = useCompanionMessages(conversationId ?? null);

  const { speak, stop, isPlaying, isLoading: isVoiceLoading } = useCompanionVoice({
    personalityType: companion?.personality_type || 'mentor',
    voiceSettings: {
      stability: voiceSettings.stability,
      similarity_boost: voiceSettings.similarity_boost,
      style: voiceSettings.style,
      speed: voiceSettings.speed,
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingMessage, streamingContent]);

  useEffect(() => {
    if (!isPlaying && playingMessageId) {
      setPlayingMessageId(null);
    }
  }, [isPlaying, playingMessageId]);

  // Auto-play latest companion message when enabled
  useEffect(() => {
    if (
      voiceSettings.enabled &&
      voiceSettings.autoPlay &&
      messages.length > 0 &&
      !isStreaming &&
      !isLoading &&
      !isPlaying &&
      !isVoiceLoading
    ) {
      const latestMessage = messages[messages.length - 1];
      if (
        latestMessage.role === 'assistant' &&
        latestMessage.id !== lastAutoPlayedId
      ) {
        setLastAutoPlayedId(latestMessage.id);
        setPlayingMessageId(latestMessage.id);
        speak(latestMessage.content);
      }
    }
  }, [messages, voiceSettings, isStreaming, isLoading, isPlaying, isVoiceLoading, lastAutoPlayedId, speak]);

  const handleVoiceClick = (messageId: string, content: string) => {
    if (playingMessageId === messageId && isPlaying) {
      stop();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(messageId);
      speak(content);
    }
  };

  if (isLoadingCompanion) {
    return (
      <div className="flex items-center justify-center h-[600px] border rounded-xl bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!companion) return null;

  return (
    <div className="flex flex-col h-[600px] border rounded-xl overflow-hidden bg-card">
      <ChatHeader 
        companion={companion} 
        relationship={relationship ?? null} 
        conversations={conversations}
        voiceSettings={voiceSettings}
        onVoiceSettingsChange={updateVoiceSettings}
      />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !pendingMessage && !streamingContent && (
            <EmptyState
              companionName={companion.name}
              personalityType={companion.personality_type}
              avatarUrl={companion.avatar_url}
              greeting={companion.default_greeting}
            />
          )}
          
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isPlaying={playingMessageId === msg.id && isPlaying}
              isVoiceLoading={playingMessageId === msg.id && isVoiceLoading}
              onVoiceClick={handleVoiceClick}
              voiceEnabled={voiceSettings.enabled}
            />
          ))}
          
          {/* Pending user message */}
          {pendingMessage && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-primary text-primary-foreground">
                <p className="text-sm">{pendingMessage}</p>
              </div>
            </div>
          )}

          {/* Streaming response or typing indicator */}
          {isStreaming && streamingContent ? (
            <StreamingMessage 
              content={streamingContent} 
              personalityType={companion.personality_type}
            />
          ) : pendingMessage && !streamingContent ? (
            <TypingIndicator personalityType={companion.personality_type} />
          ) : null}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <ChatInput 
        companionName={companion.name}
        isLoading={isLoading}
        onSend={sendMessage}
      />
    </div>
  );
}
