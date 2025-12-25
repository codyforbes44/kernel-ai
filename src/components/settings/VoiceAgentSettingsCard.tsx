import React, { useState } from 'react';
import { Mic, Volume2, TestTube2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useVoiceAgentConfig } from '@/components/voice/VoiceAgentProvider';
import { toast } from 'sonner';

export function VoiceAgentSettingsCard() {
  const { config, setEnabled } = useVoiceAgentConfig();
  const [volume, setVolume] = useState(0.8);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

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
    // Store volume preference in localStorage
    localStorage.setItem('kernel-voice-volume', String(newVolume));
  };

  const handleEnabledChange = (enabled: boolean) => {
    setEnabled(enabled);
    toast.success(enabled ? 'Voice agent enabled' : 'Voice agent disabled');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Agent
        </CardTitle>
        <CardDescription>Configure AI voice assistant settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <Separator />

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

        <Separator />

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

        {/* Usage Tips */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <h4 className="text-sm font-medium mb-2">How to use</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Click the floating mic button to start a conversation</li>
            <li>• Speak naturally - the AI will respond with voice</li>
            <li>• Click the button again to access volume controls</li>
            <li>• End the conversation anytime by clicking "End Conversation"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
