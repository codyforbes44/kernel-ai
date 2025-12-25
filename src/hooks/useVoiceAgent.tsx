import { useState, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type VoiceAgentStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

interface UseVoiceAgentOptions {
  agentId: string;
  onMessage?: (message: any) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
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
  onMessage, 
  onTranscript 
}: UseVoiceAgentOptions): UseVoiceAgentReturn {
  const { toast } = useToast();
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isConnectingRef = useRef(false);

  const conversation = useConversation({
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
          onTranscript(transcript, true);
        }
      }
      
      // Handle agent response
      if (msg.type === 'agent_response') {
        const event = msg.agent_response_event as Record<string, unknown> | undefined;
        const response = event?.agent_response as string | undefined;
        if (response && onTranscript) {
          onTranscript(response, true);
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
      // Some browsers (especially mobile Safari) throw "The operation is insecure" when not in a secure context.
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('Microphone access requires HTTPS. Please open the secure (https://) version of this site.');
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not available in this browser. Please use a modern browser over HTTPS.');
      }

      // Request microphone permission first
      console.log('Requesting microphone permission...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');

      // Get signed URL from edge function
      console.log('Fetching signed URL...');
      const { data, error: fnError } = await supabase.functions.invoke(
        'elevenlabs-conversation-token',
        { body: { agentId } }
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

      console.log('Starting conversation session with WebSocket...');
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
  }, [agentId, isConnected, conversation, toast]);

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
