import { useState, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type VoiceAgentStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

export interface VoiceAgentUserContext {
  isNewUser?: boolean;
  hasActiveProject?: boolean;
  projectName?: string;
  userName?: string;
  currentPage?: string;
  isAuthenticated?: boolean;
  sessionId?: string;
}

export interface ClientToolResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface ClientTools {
  capture_project_idea?: (params: {
    name: string;
    description: string;
    features?: string[];
    techStack?: string[];
    targetAudience?: string;
    additionalNotes?: string;
  }) => Promise<ClientToolResult> | ClientToolResult;
  start_signup_flow?: () => Promise<ClientToolResult> | ClientToolResult;
  confirm_understanding?: (params: { confirmed: boolean }) => Promise<ClientToolResult> | ClientToolResult;
}

interface UseVoiceAgentOptions {
  agentId: string;
  userContext?: VoiceAgentUserContext;
  clientTools?: ClientTools;
  onMessage?: (message: unknown) => void;
  onTranscript?: (text: string, isFinal: boolean, role: 'user' | 'agent') => void;
  onFirstMessage?: (message: string) => void;
  onClientToolCall?: (toolName: string, params: unknown) => void;
}

interface UseVoiceAgentReturn {
  status: VoiceAgentStatus;
  isSpeaking: boolean;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (text: string) => void;
  setVolume: (volume: number) => Promise<void>;
  retry: () => Promise<void>;
}

export function useVoiceAgent({ 
  agentId, 
  userContext,
  clientTools,
  onMessage, 
  onTranscript,
  onFirstMessage,
  onClientToolCall,
}: UseVoiceAgentOptions): UseVoiceAgentReturn {
  const { toast } = useToast();
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isConnectingRef = useRef(false);

  // Build client tools configuration for ElevenLabs
  const elevenLabsClientTools = clientTools ? {
    capture_project_idea: async (params: {
      name: string;
      description: string;
      features?: string[];
      techStack?: string[];
      targetAudience?: string;
      additionalNotes?: string;
    }) => {
      console.log('Client tool called: capture_project_idea', params);
      onClientToolCall?.('capture_project_idea', params);
      
      if (clientTools.capture_project_idea) {
        const result = await clientTools.capture_project_idea(params);
        return result.message || 'Project idea captured successfully';
      }
      return 'Project idea captured';
    },
    start_signup_flow: async () => {
      console.log('Client tool called: start_signup_flow');
      onClientToolCall?.('start_signup_flow', {});
      
      if (clientTools.start_signup_flow) {
        const result = await clientTools.start_signup_flow();
        return result.message || 'Signup flow initiated';
      }
      return 'Signup flow started';
    },
    confirm_understanding: async (params: { confirmed: boolean }) => {
      console.log('Client tool called: confirm_understanding', params);
      onClientToolCall?.('confirm_understanding', params);
      
      if (clientTools.confirm_understanding) {
        const result = await clientTools.confirm_understanding(params);
        return result.message || 'Understanding confirmed';
      }
      return params.confirmed ? 'Great! I understand what you want to build.' : 'Let me know if you have any changes.';
    },
  } : undefined;

  const conversation = useConversation({
    clientTools: elevenLabsClientTools,
    onConnect: () => {
      console.log('Voice agent connected');
      setStatus('connected');
      setError(null);
      toast({
        title: 'Voice Agent Connected',
        description: 'You can now speak with the AI assistant.',
      });
    },
    onDisconnect: () => {
      console.log('Voice agent disconnected');
      setStatus('idle');
      isConnectingRef.current = false;
    },
    onMessage: (message) => {
      console.log('Voice agent message:', message);
      
      // Cast to unknown first, then to Record for type safety
      const msg = message as unknown as Record<string, unknown>;
      
      // Handle transcription events
      if (msg.type === 'user_transcript') {
        const event = msg.user_transcription_event as Record<string, unknown> | undefined;
        const transcript = event?.user_transcript as string | undefined;
        if (transcript && onTranscript) {
          onTranscript(transcript, true, 'user');
        }
      }
      
      // Handle agent response
      if (msg.type === 'agent_response') {
        const event = msg.agent_response_event as Record<string, unknown> | undefined;
        const response = event?.agent_response as string | undefined;
        if (response && onTranscript) {
          onTranscript(response, true, 'agent');
        }
      }

      // Handle client tool calls
      if (msg.type === 'client_tool_call') {
        const toolName = msg.tool_name as string | undefined;
        const parameters = msg.parameters as Record<string, unknown> | undefined;
        if (toolName) {
          onClientToolCall?.(toolName, parameters);
        }
      }
      
      onMessage?.(message);
    },
    onError: (err) => {
      console.error('Voice agent error:', err);
      const errorMessage = typeof err === 'string' ? err : (err as Error)?.message || 'Connection error';
      setError(errorMessage);
      setStatus('error');
      isConnectingRef.current = false;
      toast({
        title: 'Voice Agent Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Update status based on speaking state
  const isSpeaking = conversation.isSpeaking;
  const isConnected = conversation.status === 'connected';

  const connect = useCallback(async () => {
    if (isConnectingRef.current || isConnected) {
      console.log('Already connecting or connected');
      return;
    }

    if (!agentId) {
      setError('Agent ID is not configured');
      toast({
        title: 'Configuration Error',
        description: 'Voice agent ID is not configured.',
        variant: 'destructive',
      });
      return;
    }

    isConnectingRef.current = true;
    setStatus('connecting');
    setError(null);

    try {
      // Check for HTTPS - be more lenient since isSecureContext can be false in iframes even over HTTPS
      const isHttps = typeof window !== 'undefined' && (
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      );

      if (!isHttps) {
        throw new Error('Microphone access requires HTTPS. Please open the secure (https://) version of this site.');
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not available in this browser. Please use a modern browser.');
      }

      // Request microphone permission first
      console.log('Requesting microphone permission...');
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
      } catch (micError) {
        // Re-throw with more context
        throw micError;
      }

      // Get signed URL from edge function with user context
      console.log('Fetching signed URL with context...');
      const { data, error: fnError } = await supabase.functions.invoke(
        'elevenlabs-conversation-token',
        { body: { agentId, userContext } }
      );

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to get signed URL');
      }

      console.log('Edge function response:', data);

      if (!data?.signedUrl) {
        console.error('Invalid response data:', data);
        throw new Error('No signed URL received from server');
      }

      // Notify about the first message if callback provided
      if (data.firstMessage && onFirstMessage) {
        onFirstMessage(data.firstMessage);
      }

      console.log('Starting conversation session with WebSocket...');
      // Start session with signed URL only - overrides must be enabled in ElevenLabs dashboard
      await conversation.startSession({
        signedUrl: data.signedUrl,
      });
    } catch (err) {
      console.error('Failed to connect:', err);

      const errorMessage = (() => {
        const msg = err instanceof Error ? err.message : String(err ?? 'Failed to connect');
        const domErr = err instanceof DOMException ? err : null;

        if (domErr?.name === 'NotAllowedError') {
          return 'Microphone permission was blocked. Please allow microphone access and try again.';
        }

        if (domErr?.name === 'NotFoundError') {
          return 'No microphone was found. Please connect a microphone and try again.';
        }

        if (domErr?.name === 'SecurityError' || msg === 'The operation is insecure.') {
          return 'Microphone access requires HTTPS. Please open the secure (https://) version of this site.';
        }

        return msg;
      })();

      setError(errorMessage);
      setStatus('error');
      isConnectingRef.current = false;

      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [agentId, isConnected, conversation, toast, userContext, onFirstMessage]);

  const retry = useCallback(async () => {
    setError(null);
    setStatus('idle');
    isConnectingRef.current = false;
    await connect();
  }, [connect]);

  const disconnect = useCallback(async () => {
    try {
      await conversation.endSession();
      setStatus('idle');
      isConnectingRef.current = false;
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  }, [conversation]);

  const sendMessage = useCallback((text: string) => {
    if (isConnected) {
      conversation.sendUserMessage(text);
    }
  }, [isConnected, conversation]);

  const setVolume = useCallback(async (volume: number) => {
    await conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
  }, [conversation]);

  return {
    status: isSpeaking ? 'speaking' : (isConnected ? 'listening' : status),
    isSpeaking,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    setVolume,
    retry,
  };
}
