import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompanionChat } from '@/hooks/useCompanionChat';
import { useCompanionMessages, useCompanion, useCompanionRelationship } from '@/hooks/useCompanion';
import { useCompanionVoice } from '@/hooks/useCompanionVoice';
import { AffinityMeter } from './AffinityMeter';
import { PERSONALITY_ICONS } from '@/types/companion';
import { Send, Loader2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanionChatProps {
  companionId: string;
}

export function CompanionChat({ companionId }: CompanionChatProps) {
  const [input, setInput] = useState('');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: companion } = useCompanion(companionId);
  const { data: relationship } = useCompanionRelationship(companionId);

  const { sendMessage, isLoading, conversationId, pendingMessage } = useCompanionChat({
    companionId,
    onAffinityChange: (level, change) => {
      console.log(`Affinity changed: ${change > 0 ? '+' : ''}${change} → ${level}`);
    },
  });

  const { data: messages = [] } = useCompanionMessages(conversationId ?? null);

  const { speak, stop, isPlaying, isLoading: isVoiceLoading } = useCompanionVoice({
    personalityType: companion?.personality_type || 'mentor',
    voiceSettings: companion?.voice_settings as { stability?: number; similarity_boost?: number; style?: number } | undefined,
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingMessage]);

  // Reset playing state when voice stops
  useEffect(() => {
    if (!isPlaying && playingMessageId) {
      setPlayingMessageId(null);
    }
  }, [isPlaying, playingMessageId]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleVoiceClick = (messageId: string, content: string) => {
    if (playingMessageId === messageId && isPlaying) {
      stop();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(messageId);
      speak(content);
    }
  };

  if (!companion) return null;

  return (
    <div className="flex flex-col h-[600px] border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{PERSONALITY_ICONS[companion.personality_type]}</span>
          <div className="flex-1">
            <h2 className="font-semibold">{companion.name}</h2>
            {relationship && <AffinityMeter level={relationship.affinity_level} size="sm" />}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !pendingMessage && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg mb-2">{companion.default_greeting}</p>
              <p className="text-sm">Start chatting to build your connection!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2 group relative',
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'companion' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'absolute -right-10 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
                      (playingMessageId === msg.id || isVoiceLoading) && 'opacity-100'
                    )}
                    onClick={() => handleVoiceClick(msg.id, msg.content)}
                    disabled={isVoiceLoading && playingMessageId !== msg.id}
                  >
                    {isVoiceLoading && playingMessageId === msg.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : playingMessageId === msg.id && isPlaying ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
          {pendingMessage && (
            <>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-primary text-primary-foreground">
                  <p className="text-sm">{pendingMessage}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${companion.name}...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
