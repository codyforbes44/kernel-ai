import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useVoiceAgent, VoiceAgentStatus } from '@/hooks/useVoiceAgent';

interface InlineVoiceButtonProps {
  projectId: string;
  projectName?: string;
  disabled?: boolean;
  onTranscript?: (text: string) => void;
}

const statusConfig: Record<VoiceAgentStatus, { 
  tooltip: string; 
  className: string;
  icon: React.ElementType;
}> = {
  idle: { 
    tooltip: 'Start voice input', 
    className: 'text-muted-foreground hover:text-foreground',
    icon: Mic 
  },
  connecting: { 
    tooltip: 'Connecting...', 
    className: 'text-yellow-500 animate-pulse',
    icon: Loader2 
  },
  connected: { 
    tooltip: 'Listening - click to stop', 
    className: 'text-green-500',
    icon: Mic 
  },
  speaking: { 
    tooltip: 'AI speaking...', 
    className: 'text-primary animate-pulse',
    icon: Volume2 
  },
  listening: { 
    tooltip: 'Listening...', 
    className: 'text-green-500 animate-pulse',
    icon: Mic 
  },
  error: { 
    tooltip: 'Connection error - click to retry', 
    className: 'text-destructive',
    icon: MicOff 
  },
};

export function InlineVoiceButton({ 
  projectId, 
  projectName,
  disabled,
  onTranscript,
}: InlineVoiceButtonProps) {
  const [lastTranscript, setLastTranscript] = useState<string>('');

  const handleTranscript = useCallback((text: string, isFinal: boolean, source: 'user' | 'agent') => {
    if (source === 'user' && isFinal && text.trim()) {
      setLastTranscript(text);
      onTranscript?.(text);
    }
  }, [onTranscript]);

  const {
    status,
    isConnected,
    connect,
    disconnect,
    retry,
  } = useVoiceAgent({
    agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID || '',
    userContext: {
      currentPage: 'builder',
      projectName,
      hasActiveProject: !!projectId,
    },
    onTranscript: handleTranscript,
  });

  const config = statusConfig[status];
  const Icon = config.icon;

  const handleClick = useCallback(async () => {
    if (status === 'idle' || status === 'error') {
      await (status === 'error' ? retry() : connect());
    } else if (isConnected) {
      await disconnect();
    }
  }, [status, isConnected, connect, disconnect, retry]);

  const isActive = status !== 'idle';
  const isProcessing = status === 'connecting';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 relative",
              config.className,
              isActive && "bg-accent"
            )}
            onClick={handleClick}
            disabled={disabled || isProcessing || !import.meta.env.VITE_ELEVENLABS_AGENT_ID}
          >
            {/* Pulse ring when active */}
            {(status === 'listening' || status === 'speaking') && (
              <span className="absolute inset-0 rounded-md animate-ping opacity-30 bg-current" />
            )}
            <Icon className={cn(
              "h-4 w-4 relative z-10",
              isProcessing && "animate-spin"
            )} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{config.tooltip}</p>
          {lastTranscript && status !== 'idle' && (
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
              Last: "{lastTranscript}"
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
