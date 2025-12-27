import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';
import { useXAIVoice } from '@/hooks/useXAIVoice';
import { cn } from '@/lib/utils';

interface VoiceConversationProps {
  companionName: string;
  personalityType: string;
  systemPrompt: string;
  onTranscript?: (text: string, role: 'user' | 'assistant') => void;
}

export function VoiceConversation({
  companionName,
  personalityType,
  systemPrompt,
  onTranscript,
}: VoiceConversationProps) {
  const [showTranscript, setShowTranscript] = useState(true);
  
  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    isSpeaking,
    userTranscript,
    agentTranscript,
  } = useXAIVoice({
    personalityType,
    companionName,
    systemPrompt,
    onTranscript,
  });

  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500 animate-pulse" : "bg-muted"
        )} />
        <span>
          {isConnecting ? 'Connecting...' : isConnected ? 'Voice Active' : 'Voice Inactive'}
        </span>
      </div>

      {/* Voice Visualization */}
      {isConnected && (
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Outer ring animation when speaking */}
          <div className={cn(
            "absolute inset-0 rounded-full border-4 transition-all duration-300",
            isSpeaking 
              ? "border-primary animate-pulse scale-110" 
              : "border-muted scale-100"
          )} />
          
          {/* Inner circle */}
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isSpeaking ? "bg-primary/20" : "bg-muted"
          )}>
            {isSpeaking ? (
              <Volume2 className="h-6 w-6 text-primary animate-pulse" />
            ) : (
              <Mic className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        </div>
      )}

      {/* Transcripts */}
      {isConnected && showTranscript && (
        <div className="w-full max-w-md space-y-2">
          {userTranscript && (
            <div className="p-3 rounded-lg bg-primary/10 text-sm">
              <span className="text-xs text-muted-foreground block mb-1">You said:</span>
              {userTranscript}
            </div>
          )}
          {agentTranscript && (
            <div className="p-3 rounded-lg bg-muted text-sm">
              <span className="text-xs text-muted-foreground block mb-1">{companionName}:</span>
              {agentTranscript}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleToggleConnection}
          variant={isConnected ? "destructive" : "default"}
          size="lg"
          disabled={isConnecting}
          className="gap-2"
        >
          {isConnected ? (
            <>
              <PhoneOff className="h-4 w-4" />
              End Voice
            </>
          ) : (
            <>
              <Phone className="h-4 w-4" />
              {isConnecting ? 'Starting...' : 'Start Voice'}
            </>
          )}
        </Button>

        {isConnected && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            {showTranscript ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Help text */}
      {!isConnected && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Start a real-time voice conversation with {companionName}. 
          Your microphone will be used for voice input.
        </p>
      )}
    </div>
  );
}
