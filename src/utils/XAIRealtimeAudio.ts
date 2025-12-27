// xAI Realtime Audio utilities for voice conversations

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPaused = false;
  private _isMuted = false;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      // Create analyser for audio level monitoring
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      this.processor.onaudioprocess = (e) => {
        if (!this.isPaused && !this._isMuted) {
          const inputData = e.inputBuffer.getChannelData(0);
          this.onAudioData(new Float32Array(inputData));
        }
      };
      
      this.source.connect(this.analyser);
      this.analyser.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  mute() {
    this._isMuted = true;
  }

  unmute() {
    this._isMuted = false;
  }

  get isMuted() {
    return this._isMuted;
  }

  get paused() {
    return this.isPaused;
  }

  getAudioLevel(): number {
    if (!this.analyser) return 0;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / (dataArray.length * 255);
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

// Audio playback queue for sequential playback
class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;
  private currentSource: AudioBufferSourceNode | null = null;
  private onPlayStateChange?: (isPlaying: boolean) => void;

  constructor(audioContext: AudioContext, onPlayStateChange?: (isPlaying: boolean) => void) {
    this.audioContext = audioContext;
    this.onPlayStateChange = onPlayStateChange;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.onPlayStateChange?.(false);
      return;
    }

    this.isPlaying = true;
    this.onPlayStateChange?.(true);
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer as ArrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      this.currentSource = source;
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        this.currentSource = null;
        this.playNext();
      };
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }

  clear() {
    this.queue = [];
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.isPlaying = false;
    this.onPlayStateChange?.(false);
  }

  get playing() {
    return this.isPlaying;
  }
}

export interface XAIRealtimeMessage {
  type: string;
  [key: string]: unknown;
}

export type InputMode = 'vad' | 'push-to-talk';

export interface XAIVoiceChatCallbacks {
  onMessage?: (message: XAIRealtimeMessage) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onAgentTranscript?: (text: string, isFinal: boolean) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onAudioPlayingChange?: (isPlaying: boolean) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class XAIVoiceChat {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private audioQueue: AudioQueue | null = null;
  private callbacks: XAIVoiceChatCallbacks;
  private isConnected = false;
  private _inputMode: InputMode = 'vad';
  private _isMuted = false;
  private _isPTTActive = false;
  private audioLevelInterval: number | null = null;
  private _currentAudioLevel = 0;

  constructor(callbacks: XAIVoiceChatCallbacks = {}) {
    this.callbacks = callbacks;
  }

  async connect(voice: string, systemPrompt: string, inputMode: InputMode = 'vad') {
    if (this.isConnected) {
      console.warn('Already connected');
      return;
    }

    this._inputMode = inputMode;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize audio context
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.audioQueue = new AudioQueue(this.audioContext, (isPlaying) => {
        this.callbacks.onAudioPlayingChange?.(isPlaying);
      });

      // Connect to our relay edge function
      const wsUrl = new URL('wss://ggistvtwgeokhvfagocs.functions.supabase.co/functions/v1/xai-voice-relay');
      wsUrl.searchParams.set('voice', voice);
      wsUrl.searchParams.set('systemPrompt', systemPrompt);
      wsUrl.searchParams.set('inputMode', inputMode);

      console.log('Connecting to xAI voice relay...');
      this.ws = new WebSocket(wsUrl.toString());

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.callbacks.onConnect?.();
        this.startRecording();
        this.startAudioLevelMonitoring();
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data) as XAIRealtimeMessage;
          console.log('Received:', data.type);
          
          this.callbacks.onMessage?.(data);

          switch (data.type) {
            case 'response.audio.delta':
              this.callbacks.onSpeakingChange?.(true);
              const audioBase64 = (data as { delta?: string }).delta;
              if (audioBase64 && this.audioQueue) {
                const binaryString = atob(audioBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                await this.audioQueue.addToQueue(bytes);
              }
              break;

            case 'response.audio.done':
              this.callbacks.onSpeakingChange?.(false);
              break;

            case 'conversation.item.input_audio_transcription.completed':
              const userTranscript = (data as { transcript?: string }).transcript;
              if (userTranscript) {
                this.callbacks.onTranscript?.(userTranscript, true);
              }
              break;

            case 'response.audio_transcript.delta':
              const agentDelta = (data as { delta?: string }).delta;
              if (agentDelta) {
                this.callbacks.onAgentTranscript?.(agentDelta, false);
              }
              break;

            case 'response.audio_transcript.done':
              const agentTranscript = (data as { transcript?: string }).transcript;
              if (agentTranscript) {
                this.callbacks.onAgentTranscript?.(agentTranscript, true);
              }
              break;

            case 'error':
              const errorMessage = (data as { error?: { message?: string } }).error?.message || 'Unknown error';
              this.callbacks.onError?.(new Error(errorMessage));
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.callbacks.onError?.(new Error('WebSocket connection error'));
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.callbacks.onDisconnect?.();
        this.cleanup();
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('Failed to connect'));
      throw error;
    }
  }

  private startRecording() {
    this.recorder = new AudioRecorder((audioData) => {
      // In PTT mode, only send audio when PTT is active
      if (this._inputMode === 'push-to-talk' && !this._isPTTActive) {
        return;
      }
      
      if (this.ws?.readyState === WebSocket.OPEN && !this._isMuted) {
        const encoded = encodeAudioForAPI(audioData);
        this.ws.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: encoded
        }));
      }
    });
    
    this.recorder.start().catch((error) => {
      console.error('Failed to start recording:', error);
      this.callbacks.onError?.(error);
    });
  }

  private startAudioLevelMonitoring() {
    this.audioLevelInterval = window.setInterval(() => {
      if (this.recorder) {
        this._currentAudioLevel = this.recorder.getAudioLevel();
      }
    }, 50);
  }

  // Push-to-talk methods
  startSpeaking() {
    if (this._inputMode !== 'push-to-talk') return;
    this._isPTTActive = true;
    console.log('PTT: Started speaking');
  }

  stopSpeaking() {
    if (this._inputMode !== 'push-to-talk') return;
    this._isPTTActive = false;
    console.log('PTT: Stopped speaking');
    
    // Commit the audio buffer and request response
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
      this.ws.send(JSON.stringify({ type: 'response.create' }));
    }
  }

  setInputMode(mode: InputMode) {
    this._inputMode = mode;
    if (mode === 'vad') {
      this._isPTTActive = false;
    }
  }

  mute() {
    this._isMuted = true;
    this.recorder?.mute();
  }

  unmute() {
    this._isMuted = false;
    this.recorder?.unmute();
  }

  toggleMute() {
    if (this._isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this._isMuted;
  }

  get inputMode() {
    return this._inputMode;
  }

  get isMuted() {
    return this._isMuted;
  }

  get isPTTActive() {
    return this._isPTTActive;
  }

  get audioLevel() {
    return this._currentAudioLevel;
  }

  sendTextMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    this.ws.send(JSON.stringify({ type: 'response.create' }));
  }

  disconnect() {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  private cleanup() {
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
      this.audioLevelInterval = null;
    }
    this.recorder?.stop();
    this.recorder = null;
    this.audioQueue?.clear();
    if (this.audioContext?.state !== 'closed') {
      this.audioContext?.close();
    }
    this.audioContext = null;
    this.audioQueue = null;
    this._isPTTActive = false;
    this._currentAudioLevel = 0;
  }

  get connected() {
    return this.isConnected;
  }
}