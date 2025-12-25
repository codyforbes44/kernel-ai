import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useVoiceAgent, VoiceAgentStatus } from '@/hooks/useVoiceAgent';

interface VoiceAgentWidgetProps {
  agentId: string;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

const statusConfig: Record<VoiceAgentStatus, { 
  label: string; 
  color: string; 
  pulseColor: string;
  icon: React.ElementType;
}> = {
  idle: { 
    label: 'Click to start', 
    color: 'bg-muted', 
    pulseColor: '',
    icon: Mic 
  },
  connecting: { 
    label: 'Connecting...', 
    color: 'bg-yellow-500', 
    pulseColor: 'bg-yellow-400',
    icon: Loader2 
  },
  connected: { 
    label: 'Connected', 
    color: 'bg-green-500', 
    pulseColor: 'bg-green-400',
    icon: Mic 
  },
  speaking: { 
    label: 'AI Speaking', 
    color: 'bg-primary', 
    pulseColor: 'bg-primary/60',
    icon: Volume2 
  },
  listening: { 
    label: 'Listening...', 
    color: 'bg-green-500', 
    pulseColor: 'bg-green-400',
    icon: Mic 
  },
  error: { 
    label: 'Error', 
    color: 'bg-destructive', 
    pulseColor: '',
    icon: MicOff 
  },
};

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
};

export function VoiceAgentWidget({ 
  agentId, 
  className,
  position = 'bottom-right' 
}: VoiceAgentWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  const {
    status,
    isSpeaking,
    isConnected,
    error,
    connect,
    disconnect,
    setVolume: setAgentVolume,
    retry,
  } = useVoiceAgent({
    agentId,
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        setTranscript(text);
        // Clear transcript after a delay
        setTimeout(() => setTranscript(''), 5000);
      }
    },
  });

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleClick = async () => {
    if (status === 'idle' || status === 'error') {
      await connect();
    } else if (isConnected) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setIsExpanded(false);
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    await setAgentVolume(isMuted ? 0 : newVolume);
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    await setAgentVolume(newMuted ? 0 : volume);
  };

  // Don't render if no agent ID
  if (!agentId) {
    return null;
  }

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      <AnimatePresence>
        {isExpanded && isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-72 bg-card border border-border rounded-xl shadow-xl p-4 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', config.color)} />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsExpanded(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Transcript */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground"
              >
                "{transcript}"
              </motion.div>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            {/* Disconnect Button */}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleDisconnect}
            >
              End Conversation
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        className={cn(
          'relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200',
          config.color,
          'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulse animation for active states */}
        {(status === 'speaking' || status === 'listening' || status === 'connecting') && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              config.pulseColor
            )}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        
        <StatusIcon 
          className={cn(
            'h-6 w-6 text-white',
            status === 'connecting' && 'animate-spin'
          )} 
        />
      </motion.button>

      {/* Error tooltip with retry */}
      {error && status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 right-0 bg-destructive text-destructive-foreground text-xs px-3 py-2 rounded-lg max-w-56 space-y-2"
        >
          <p>{error}</p>
          <Button
            size="sm"
            variant="secondary"
            className="w-full h-6 text-xs"
            onClick={retry}
          >
            Retry Connection
          </Button>
        </motion.div>
      )}
    </div>
  );
}
