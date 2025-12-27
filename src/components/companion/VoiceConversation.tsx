import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, PhoneOff, Volume2, MessageSquare } from 'lucide-react';
import { useXAIVoice } from '@/hooks/useXAIVoice';
import { cn } from '@/lib/utils';
import { AudioWaveformVisualizer } from './voice/AudioWaveformVisualizer';
import { PushToTalkButton } from './voice/PushToTalkButton';
import { LiveTranscript } from './voice/LiveTranscript';

interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  
  const handleTranscript = useCallback((text: string, role: 'user' | 'assistant') => {
    const entry: TranscriptEntry = {
      id: `${role}-${Date.now()}`,
      role,
      text,
      timestamp: new Date(),
    };
    setTranscriptEntries(prev => [...prev, entry]);
    onTranscript?.(text, role);
  }, [onTranscript]);
  
  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    isSpeaking,
    userTranscript,
    agentTranscript,
    inputMode,
    setInputMode,
    isMuted,
    toggleMute,
    audioLevel,
    startSpeaking,
    stopSpeaking,
  } = useXAIVoice({
    personalityType,
    companionName,
    systemPrompt,
    onTranscript: handleTranscript,
  });

  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
      setTranscriptEntries([]);
    } else {
      connect();
    }
  };

  const isListening = isConnected && !isSpeaking && !isMuted;

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
        <div className="relative flex flex-col items-center justify-center gap-4 w-full max-w-md">
          {/* Audio Waveform */}
          <AudioWaveformVisualizer
            audioLevel={isSpeaking ? 0.6 : audioLevel}
            isActive={isSpeaking || isListening}
            variant="bars"
            barCount={24}
            className="w-full"
          />
          
          {/* Speaking/Listening Indicator */}
          <div className={cn(
            "text-sm font-medium transition-colors",
            isSpeaking ? "text-primary" : isListening ? "text-green-500" : "text-muted-foreground"
          )}>
            {isSpeaking ? (
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 animate-pulse" />
                {companionName} is speaking...
              </span>
            ) : isListening ? (
              <span className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Listening...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MicOff className="h-4 w-4" />
                Muted
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input Mode Toggle */}
      {isConnected && (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 w-full max-w-md">
          <div className="flex items-center gap-2">
            <Switch
              id="input-mode"
              checked={inputMode === 'push-to-talk'}
              onCheckedChange={(checked) => setInputMode(checked ? 'push-to-talk' : 'vad')}
            />
            <Label htmlFor="input-mode" className="text-sm">
              {inputMode === 'push-to-talk' ? 'Push-to-Talk' : 'Auto-detect (VAD)'}
            </Label>
          </div>
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="sm"
            onClick={toggleMute}
            className="ml-auto"
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Push-to-Talk Button */}
      {isConnected && inputMode === 'push-to-talk' && (
        <PushToTalkButton
          isActive={false}
          audioLevel={audioLevel}
          onStart={startSpeaking}
          onStop={stopSpeaking}
          disabled={isMuted}
          className="w-full max-w-md"
        />
      )}

      {/* Transcripts */}
      {isConnected && showTranscript && (
        <LiveTranscript
          entries={transcriptEntries}
          isListening={isListening}
          companionName={companionName}
          className="w-full max-w-md"
          maxHeight={200}
        />
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
            title={showTranscript ? 'Hide transcript' : 'Show transcript'}
          >
            <MessageSquare className="h-4 w-4" />
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
