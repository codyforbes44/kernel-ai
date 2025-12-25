import React, { useState, useEffect } from 'react';
import { Mic, Volume2, TestTube2, Loader2, CheckCircle2, XCircle, Volume1, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoiceAgentConfig } from '@/components/voice/VoiceAgentProvider';
import { useTTS } from '@/hooks/useTTS';
import { toast } from 'sonner';

const TTS_VOICES = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Professional male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Clear female' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', description: 'Friendly female' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Warm male' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'British female' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Natural male' },
];

export function VoiceAgentSettingsCard() {
  const { config, setEnabled } = useVoiceAgentConfig();
  const { speak, stop, isSpeaking, isLoading: ttsLoading } = useTTS();
  
  const [volume, setVolume] = useState(0.8);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  
  // TTS settings stored in localStorage
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    const stored = localStorage.getItem('kernel-tts-enabled');
    return stored !== null ? stored === 'true' : true;
  });
  const [ttsVoice, setTtsVoice] = useState(() => {
    return localStorage.getItem('kernel-tts-voice') || 'JBFqnCBsd6RMkjVDRZzb';
  });

  useEffect(() => {
    localStorage.setItem('kernel-tts-enabled', String(ttsEnabled));
  }, [ttsEnabled]);

  useEffect(() => {
    localStorage.setItem('kernel-tts-voice', ttsVoice);
  }, [ttsVoice]);

  const handleTestMicrophone = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context to check if we're getting audio
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Check for audio input
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      // Clean up
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();
      
      setTestResult('success');
      toast.success('Microphone is working correctly');
    } catch (error) {
      console.error('Microphone test failed:', error);
      setTestResult('error');
      toast.error('Microphone access denied or not available');
    } finally {
      setIsTesting(false);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    localStorage.setItem('kernel-voice-volume', String(newVolume));
  };

  const handleEnabledChange = (enabled: boolean) => {
    setEnabled(enabled);
    toast.success(enabled ? 'Voice agent enabled' : 'Voice agent disabled');
  };

  const handleTtsEnabledChange = (enabled: boolean) => {
    setTtsEnabled(enabled);
    toast.success(enabled ? 'Text-to-speech enabled' : 'Text-to-speech disabled');
  };

  const handleTestTts = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak('Hello! This is a test of the text-to-speech system. How does it sound?', ttsVoice);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice & Audio
        </CardTitle>
        <CardDescription>Configure voice agent and text-to-speech settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Agent Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Voice Agent</h3>
          
          {/* Enable/Disable Voice Agent */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                Enable Voice Agent
              </Label>
              <p className="text-sm text-muted-foreground">
                Show the floating voice button for AI conversations
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={handleEnabledChange}
            />
          </div>

          {/* Default Volume */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                Default Volume
              </Label>
              <p className="text-sm text-muted-foreground">
                Set the default playback volume for AI responses
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Test Microphone */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <TestTube2 className="h-4 w-4 text-primary" />
                Test Microphone
              </Label>
              <p className="text-sm text-muted-foreground">
                Check if your microphone is working correctly
              </p>
            </div>
            <div className="flex items-center gap-2">
              {testResult === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {testResult === 'error' && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestMicrophone}
                disabled={isTesting}
                className="gap-2"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Text-to-Speech Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Text-to-Speech</h3>
          
          {/* Enable TTS */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Volume1 className="h-4 w-4 text-primary" />
                Enable Text-to-Speech
              </Label>
              <p className="text-sm text-muted-foreground">
                Show "Read aloud" button on AI messages
              </p>
            </div>
            <Switch
              checked={ttsEnabled}
              onCheckedChange={handleTtsEnabledChange}
            />
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              TTS Voice
            </Label>
            <div className="flex items-center gap-2">
              <Select value={ttsVoice} onValueChange={setTtsVoice}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {TTS_VOICES.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{voice.name}</span>
                        <span className="text-muted-foreground">- {voice.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestTts}
                disabled={ttsLoading}
                className="gap-2 shrink-0"
              >
                {ttsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isSpeaking ? 'Stop' : 'Test'}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Usage Tips */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <h4 className="text-sm font-medium mb-2">How to use</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Click the floating mic button to start a voice conversation</li>
            <li>• Hover over AI messages and click the speaker icon to read aloud</li>
            <li>• Choose your preferred voice from the dropdown above</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
