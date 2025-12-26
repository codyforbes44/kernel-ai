import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Loader2, Copy, Check, Maximize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useVoiceAgent, VoiceAgentStatus, VoiceAgentUserContext, ClientTools } from '@/hooks/useVoiceAgent';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePreAuthSession, ConversationEntry, ProjectRequirements } from '@/hooks/usePreAuthSession';
import { useAuth } from '@/hooks/useAuth';
import { useClipboard } from '@/hooks/useClipboard';
import { TranscriptEntry } from './TranscriptEntry';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'agent';
    text: string;
  }>>([]);

  // Clipboard hook for copy all functionality
  const { copied: allCopied, copy: copyAll } = useClipboard({ resetDelay: 2000 });

  // Pre-auth session management for unauthenticated users
  const {
    sessionId,
    captureProjectIdea,
    addTranscriptEntry,
    hasPendingProject,
  } = usePreAuthSession();

  // Build user context for the voice agent
  const userContext: VoiceAgentUserContext = useMemo(() => ({
    isNewUser: isNewUser || !isAuthenticated,
    hasActiveProject,
    projectName,
    userName: userName || user?.email?.split('@')[0],
    currentPage: location.pathname,
    isAuthenticated,
    sessionId: sessionId || undefined,
  }), [isNewUser, hasActiveProject, projectName, userName, location.pathname, isAuthenticated, sessionId, user?.email]);

  // Client tools for ElevenLabs agent to call
  const clientTools: ClientTools = useMemo(() => ({
    capture_project_idea: async (params) => {
      console.log('Capturing project idea:', params);
      
      const requirements: ProjectRequirements = {
        projectName: params.name,
        projectDescription: params.description,
        features: params.features,
        techStack: params.techStack,
        targetAudience: params.targetAudience,
        additionalNotes: params.additionalNotes,
      };

      const result = await captureProjectIdea(
        params.name,
        params.description,
        requirements
      );

      if (result) {
        return {
          success: true,
          message: `Great! I've captured your project idea "${params.name}". Let me help you get started with an account.`,
        };
      }

      return {
        success: false,
        message: 'I had trouble saving your project idea. Let me try again.',
      };
    },

    start_signup_flow: async () => {
      console.log('Starting signup flow, navigating to auth...');
      
      // Navigate to auth page with voice session context
      navigate('/auth?from=voice&session=' + sessionId);
      
      return {
        success: true,
        message: 'Opening the signup page for you. Once you create your account, I\'ll automatically start building your project!',
      };
    },

    confirm_understanding: async (params) => {
      console.log('Understanding confirmed:', params.confirmed);
      
      return {
        success: true,
        message: params.confirmed 
          ? 'Perfect! I have a clear picture of what you want to build.'
          : 'No problem, tell me more about what you\'re looking for.',
      };
    },
  }), [captureProjectIdea, navigate, sessionId]);

  const handleTranscript = useCallback((text: string, isFinal: boolean, role: 'user' | 'agent') => {
    if (isFinal && text) {
      // Add to local conversation history for display
      setConversationHistory(prev => {
        const lastEntry = prev[prev.length - 1];
        // Avoid duplicates
        if (lastEntry?.text === text && lastEntry?.role === role) return prev;
        return [...prev, { role, text }];
      });

      // For unauthenticated users, sync to database
      if (!isAuthenticated) {
        const entry: ConversationEntry = {
          role,
          text,
          timestamp: new Date().toISOString(),
        };
        addTranscriptEntry(entry);
      }
    }
  }, [isAuthenticated, addTranscriptEntry]);

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
    clientTools,
    onTranscript: handleTranscript,
    onFirstMessage: (message) => {
      // Add the first message from the agent to conversation history
      setConversationHistory([{ role: 'agent', text: message }]);
    },
    onClientToolCall: (toolName, params) => {
      console.log('Client tool called:', toolName, params);
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

  // Format transcript for copying
  const formatTranscriptForCopy = useCallback(() => {
    return conversationHistory
      .map(entry => `${entry.role === 'agent' ? 'Kernel' : 'You'}: ${entry.text}`)
      .join('\n\n');
  }, [conversationHistory]);

  // Copy all conversation
  const handleCopyAll = useCallback(() => {
    const transcript = formatTranscriptForCopy();
    copyAll(transcript, 'Full conversation copied!');
  }, [formatTranscriptForCopy, copyAll]);

  // Download transcript as text file
  const handleDownloadTranscript = useCallback(() => {
    const transcript = formatTranscriptForCopy();
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kernel-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formatTranscriptForCopy]);

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
                {!isAuthenticated && hasPendingProject && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    Project Ready
                  </span>
                )}
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

            {/* Auth Status Banner for unauthenticated users */}
            {!isAuthenticated && (
              <div className="text-xs bg-muted/50 rounded-lg p-2 text-muted-foreground">
                <p>Tell me what you want to build, and I'll help you create an account to get started!</p>
              </div>
            )}

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Conversation</span>
                  <div className="flex items-center gap-1">
                    {conversationHistory.length > 3 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsTranscriptModalOpen(true)}
                        title="View full transcript"
                      >
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyAll}
                      title="Copy all"
                    >
                      {allCopied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-36 rounded-lg border border-border bg-muted/30">
                  <div className="p-2 space-y-2">
                    {conversationHistory.slice(-5).map((entry, index) => (
                      <TranscriptEntry
                        key={index}
                        role={entry.role}
                        text={entry.text}
                        compact
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
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

      {/* Full Transcript Modal */}
      <Dialog open={isTranscriptModalOpen} onOpenChange={setIsTranscriptModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Full Conversation
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 min-h-0 max-h-[50vh] rounded-lg border border-border bg-muted/30">
            <div className="p-4 space-y-3">
              {conversationHistory.map((entry, index) => (
                <TranscriptEntry
                  key={index}
                  role={entry.role}
                  text={entry.text}
                />
              ))}
            </div>
          </ScrollArea>

          {!isAuthenticated && (
            <div className="text-sm bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-muted-foreground">
                Sign up to save your conversation and project ideas
              </p>
              <Button
                variant="gold"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/auth?from=voice&session=' + sessionId)}
              >
                Create Account
              </Button>
            </div>
          )}

          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTranscript}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCopyAll}
              className="flex-1"
            >
              {allCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
