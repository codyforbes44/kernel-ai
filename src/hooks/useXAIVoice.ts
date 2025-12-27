import { useState, useCallback, useRef, useEffect } from 'react';
import { XAIVoiceChat, XAIRealtimeMessage, InputMode } from '@/utils/XAIRealtimeAudio';
import { XAI_PERSONALITY_VOICE_MAP } from '@/constants/companion';
import { toast } from 'sonner';

interface UseXAIVoiceOptions {
  personalityType: string;
  companionName: string;
  systemPrompt: string;
  inputMode?: InputMode;
  onTranscript?: (text: string, role: 'user' | 'assistant') => void;
  onMessage?: (message: XAIRealtimeMessage) => void;
}

export function useXAIVoice({
  personalityType,
  companionName,
  systemPrompt,
  inputMode: initialInputMode = 'vad',
  onTranscript,
  onMessage,
}: UseXAIVoiceOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [agentTranscript, setAgentTranscript] = useState('');
  const [inputMode, setInputModeState] = useState<InputMode>(initialInputMode);
  const [isMuted, setIsMuted] = useState(false);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const chatRef = useRef<XAIVoiceChat | null>(null);
  const agentTranscriptBuffer = useRef('');
  const audioLevelIntervalRef = useRef<number | null>(null);

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
          setIsAudioPlaying(false);
          setIsPTTActive(false);
        },
        onSpeakingChange: (speaking) => {
          setIsSpeaking(speaking);
        },
        onAudioPlayingChange: (playing) => {
          setIsAudioPlaying(playing);
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

      await chat.connect(voice, fullSystemPrompt, inputMode);
      
      // Start audio level monitoring
      audioLevelIntervalRef.current = window.setInterval(() => {
        if (chatRef.current) {
          setAudioLevel(chatRef.current.audioLevel);
        }
      }, 50);
    } catch (error) {
      console.error('Failed to start voice conversation:', error);
      toast.error('Failed to start voice conversation');
      setIsConnecting(false);
    }
  }, [voice, companionName, systemPrompt, inputMode, onTranscript, onMessage, isConnecting]);

  const disconnect = useCallback(() => {
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setIsAudioPlaying(false);
    setUserTranscript('');
    setAgentTranscript('');
    setIsPTTActive(false);
    setAudioLevel(0);
    agentTranscriptBuffer.current = '';
  }, []);

  const sendText = useCallback((text: string) => {
    chatRef.current?.sendTextMessage(text);
  }, []);

  const setInputMode = useCallback((mode: InputMode) => {
    setInputModeState(mode);
    chatRef.current?.setInputMode(mode);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = chatRef.current?.toggleMute() ?? false;
    setIsMuted(newMuted);
  }, []);

  const startSpeaking = useCallback(() => {
    chatRef.current?.startSpeaking();
    setIsPTTActive(true);
  }, []);

  const stopSpeaking = useCallback(() => {
    chatRef.current?.stopSpeaking();
    setIsPTTActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      chatRef.current?.disconnect();
    };
  }, []);

  return {
    connect,
    disconnect,
    sendText,
    setInputMode,
    toggleMute,
    startSpeaking,
    stopSpeaking,
    isConnected,
    isConnecting,
    isSpeaking,
    isAudioPlaying,
    userTranscript,
    agentTranscript,
    inputMode,
    isMuted,
    isPTTActive,
    audioLevel,
  };
}