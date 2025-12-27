import { useState, useCallback, useRef, useEffect } from 'react';
import { XAIVoiceChat, XAIRealtimeMessage } from '@/utils/XAIRealtimeAudio';
import { XAI_PERSONALITY_VOICE_MAP } from '@/constants/companion';
import { toast } from 'sonner';

interface UseXAIVoiceOptions {
  personalityType: string;
  companionName: string;
  systemPrompt: string;
  onTranscript?: (text: string, role: 'user' | 'assistant') => void;
  onMessage?: (message: XAIRealtimeMessage) => void;
}

export function useXAIVoice({
  personalityType,
  companionName,
  systemPrompt,
  onTranscript,
  onMessage,
}: UseXAIVoiceOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [agentTranscript, setAgentTranscript] = useState('');
  
  const chatRef = useRef<XAIVoiceChat | null>(null);
  const agentTranscriptBuffer = useRef('');

  const voice = XAI_PERSONALITY_VOICE_MAP[personalityType] || 'Charon';

  const connect = useCallback(async () => {
    if (chatRef.current?.connected || isConnecting) return;

    setIsConnecting(true);
    
    try {
      const chat = new XAIVoiceChat({
        onConnect: () => {
          setIsConnected(true);
          setIsConnecting(false);
          toast.success('Voice conversation started');
        },
        onDisconnect: () => {
          setIsConnected(false);
          setIsConnecting(false);
          setIsSpeaking(false);
        },
        onSpeakingChange: (speaking) => {
          setIsSpeaking(speaking);
        },
        onTranscript: (text, isFinal) => {
          if (isFinal) {
            setUserTranscript(text);
            onTranscript?.(text, 'user');
          }
        },
        onAgentTranscript: (text, isFinal) => {
          if (isFinal) {
            setAgentTranscript(text);
            agentTranscriptBuffer.current = '';
            onTranscript?.(text, 'assistant');
          } else {
            agentTranscriptBuffer.current += text;
            setAgentTranscript(agentTranscriptBuffer.current);
          }
        },
        onMessage: (message) => {
          onMessage?.(message);
        },
        onError: (error) => {
          console.error('Voice error:', error);
          toast.error(error.message || 'Voice connection error');
          setIsConnecting(false);
        },
      });

      chatRef.current = chat;
      
      const fullSystemPrompt = `You are ${companionName}, ${systemPrompt}. 
Speak naturally and conversationally. Be engaging, warm, and helpful. 
Match your personality to your role. Keep responses concise for voice conversation.`;

      await chat.connect(voice, fullSystemPrompt);
    } catch (error) {
      console.error('Failed to start voice conversation:', error);
      toast.error('Failed to start voice conversation');
      setIsConnecting(false);
    }
  }, [voice, companionName, systemPrompt, onTranscript, onMessage, isConnecting]);

  const disconnect = useCallback(() => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setUserTranscript('');
    setAgentTranscript('');
    agentTranscriptBuffer.current = '';
  }, []);

  const sendText = useCallback((text: string) => {
    chatRef.current?.sendTextMessage(text);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return {
    connect,
    disconnect,
    sendText,
    isConnected,
    isConnecting,
    isSpeaking,
    userTranscript,
    agentTranscript,
  };
}
