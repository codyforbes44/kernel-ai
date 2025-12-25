import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useVoiceAgent, VoiceAgentStatus, VoiceAgentUserContext } from '@/hooks/useVoiceAgent';
import { useLocation } from 'react-router-dom';

interface VoiceAgentWidgetProps {
  agentId: string;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  userName?: string;
  isNewUser?: boolean;
  hasActiveProject?: boolean;
  projectName?: string;
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
  position = 'bottom-right',
  userName,
  isNewUser = false,
  hasActiveProject = false,
  projectName,
}: VoiceAgentWidgetProps) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'agent';
    text: string;
  }>>([]);

  // Build user context for the voice agent
  const userContext: VoiceAgentUserContext = useMemo(() => ({
    isNewUser,
    hasActiveProject,
    projectName,
    userName,
    currentPage: location.pathname,
  }), [isNewUser, hasActiveProject, projectName, userName, location.pathname]);

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
    userContext,
    onTranscript: (text, isFinal) => {
      if (isFinal && text) {
        // Determine if this is user or agent based on context
        // Agent responses come after speaking state
        setConversationHistory(prev => {
          const lastEntry = prev[prev.length - 1];
          // Avoid duplicates
          if (lastEntry?.text === text) return prev;
          
          return [...prev, { 
            role: isSpeaking ? 'agent' : 'user', 
            text 
          }];
        });
      }
    },
    onFirstMessage: (message) => {
      // Add the first message from the agent to conversation history
      setConversationHistory([{ role: 'agent', text: message }]);
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
    setConversationHistory([]);
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

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <ScrollArea className="h-32 rounded-lg border border-border bg-muted/30">
                <div className="p-3 space-y-2">
                  {conversationHistory.slice(-5).map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "text-xs rounded-lg p-2",
                        entry.role === 'agent' 
                          ? "bg-primary/10 text-foreground" 
                          : "bg-muted text-muted-foreground ml-4"
                      )}
                    >
                      <span className="font-medium text-[10px] uppercase tracking-wider opacity-60">
                        {entry.role === 'agent' ? 'Kernel' : 'You'}
                      </span>
                      <p className="mt-0.5">{entry.text}</p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
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
