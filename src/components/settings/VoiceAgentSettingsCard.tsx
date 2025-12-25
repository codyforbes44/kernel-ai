import React, { useState } from 'react';
import { 
  Mic, Volume2, TestTube2, Loader2, CheckCircle2, XCircle, 
  Volume1, Play, ChevronDown, ChevronUp, RotateCcw, Settings2,
  Sliders, Radio, AudioWaveform
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  useElevenLabsSettings, 
  TTS_VOICES, 
  VOICE_PRESETS,
  VoicePreset 
} from '@/contexts/ElevenLabsSettingsContext';
import { useTTS } from '@/hooks/useTTS';
import { toast } from 'sonner';

const PRESET_INFO: Record<VoicePreset, { name: string; description: string }> = {
  natural: { name: 'Natural', description: 'Balanced for everyday conversation' },
  narration: { name: 'Narration', description: 'Smooth, consistent for audiobooks' },
  expressive: { name: 'Expressive', description: 'Animated for character voices' },
  professional: { name: 'Professional', description: 'Clear and formal' },
  custom: { name: 'Custom', description: 'Your custom settings' },
};

export function VoiceAgentSettingsCard() {
  const { 
    settings, 
    updateVoiceAgent, 
    updateTTS, 
    updateVoiceSettings,
    updateMicrophoneSettings,
    updatePlayback,
    applyPreset,
    currentPreset,
    resetToDefaults,
  } = useElevenLabsSettings();

  const { speak, stop, isSpeaking, isLoading: ttsLoading } = useTTS();
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  
  // Collapsible sections state
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(true);
  const [ttsOpen, setTtsOpen] = useState(true);
  const [voiceTuningOpen, setVoiceTuningOpen] = useState(false);
  const [playbackOpen, setPlaybackOpen] = useState(false);

  const handleTestMicrophone = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: settings.voiceAgent.microphone.noiseSuppression,
          echoCancellation: settings.voiceAgent.microphone.echoCancellation,
          autoGainControl: settings.voiceAgent.microphone.autoGainControl,
        }
      });
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
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

  const handleTestTts = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(
        'Hello! This is a test of the text-to-speech system with your current settings. How does it sound?',
        settings.tts.voiceId,
        {
          model: settings.tts.model,
          outputFormat: settings.tts.outputFormat,
          voiceSettings: {
            stability: settings.tts.voiceSettings.stability,
            similarity_boost: settings.tts.voiceSettings.similarityBoost,
            style: settings.tts.voiceSettings.style,
            use_speaker_boost: settings.tts.voiceSettings.useSpeakerBoost,
            speed: settings.tts.voiceSettings.speed,
          },
        }
      );
    }
  };

  const handleReset = () => {
    resetToDefaults();
    toast.success('Settings reset to defaults');
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AudioWaveform className="h-5 w-5" />
                ElevenLabs Voice Settings
              </CardTitle>
              <CardDescription>Configure voice agent and text-to-speech</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Voice Agent Section */}
          <Collapsible open={voiceAgentOpen} onOpenChange={setVoiceAgentOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  Voice Agent
                </h3>
                {voiceAgentOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Enable Voice Agent */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Voice Agent</Label>
                  <p className="text-sm text-muted-foreground">Show floating voice button</p>
                </div>
                <Switch
                  checked={settings.voiceAgent.enabled}
                  onCheckedChange={(enabled) => {
                    updateVoiceAgent({ enabled });
                    toast.success(enabled ? 'Voice agent enabled' : 'Voice agent disabled');
                  }}
                />
              </div>

              {/* Widget Position */}
              <div className="space-y-2">
                <Label>Widget Position</Label>
                <Select 
                  value={settings.voiceAgent.widgetPosition} 
                  onValueChange={(value: 'bottom-right' | 'bottom-left' | 'bottom-center') => 
                    updateVoiceAgent({ widgetPosition: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Agent ID */}
              <div className="space-y-2">
                <Label>Agent ID (optional)</Label>
                <Input
                  placeholder="Enter ElevenLabs Agent ID"
                  value={settings.voiceAgent.agentId}
                  onChange={(e) => updateVoiceAgent({ agentId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Leave blank for default agent</p>
              </div>

              {/* Microphone Settings */}
              <div className="space-y-3 p-3 rounded-lg bg-muted/50 border">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Microphone Settings</Label>
                
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Noise Suppression</Label>
                  <Switch
                    checked={settings.voiceAgent.microphone.noiseSuppression}
                    onCheckedChange={(noiseSuppression) => updateMicrophoneSettings({ noiseSuppression })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Echo Cancellation</Label>
                  <Switch
                    checked={settings.voiceAgent.microphone.echoCancellation}
                    onCheckedChange={(echoCancellation) => updateMicrophoneSettings({ echoCancellation })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Auto Gain Control</Label>
                  <Switch
                    checked={settings.voiceAgent.microphone.autoGainControl}
                    onCheckedChange={(autoGainControl) => updateMicrophoneSettings({ autoGainControl })}
                  />
                </div>
              </div>

              {/* Test Microphone */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <TestTube2 className="h-4 w-4 text-primary" />
                    Test Microphone
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  {testResult === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {testResult === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
                  <Button variant="outline" size="sm" onClick={handleTestMicrophone} disabled={isTesting}>
                    {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                    <span className="ml-2">Test</span>
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Text-to-Speech Section */}
          <Collapsible open={ttsOpen} onOpenChange={setTtsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Volume1 className="h-4 w-4 text-primary" />
                  Text-to-Speech
                </h3>
                {ttsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Enable TTS */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Text-to-Speech</Label>
                  <p className="text-sm text-muted-foreground">Show "Read aloud" on AI messages</p>
                </div>
                <Switch
                  checked={settings.tts.enabled}
                  onCheckedChange={(enabled) => {
                    updateTTS({ enabled });
                    toast.success(enabled ? 'TTS enabled' : 'TTS disabled');
                  }}
                />
              </div>

              {/* Auto-play */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-play AI Responses</Label>
                  <p className="text-sm text-muted-foreground">Automatically read new AI messages</p>
                </div>
                <Switch
                  checked={settings.tts.autoPlay}
                  onCheckedChange={(autoPlay) => updateTTS({ autoPlay })}
                />
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={settings.tts.voiceId} onValueChange={(voiceId) => updateTTS({ voiceId })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {TTS_VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <span className="font-medium">{voice.name}</span>
                        <span className="text-muted-foreground ml-2">- {voice.description}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>Model</Label>
                <Select 
                  value={settings.tts.model} 
                  onValueChange={(model: 'eleven_turbo_v2_5' | 'eleven_multilingual_v2') => 
                    updateTTS({ model })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eleven_turbo_v2_5">
                      <span className="font-medium">Turbo v2.5</span>
                      <span className="text-muted-foreground ml-2">- Fast, low latency</span>
                    </SelectItem>
                    <SelectItem value="eleven_multilingual_v2">
                      <span className="font-medium">Multilingual v2</span>
                      <span className="text-muted-foreground ml-2">- Highest quality, 29 languages</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Output Quality */}
              <div className="space-y-2">
                <Label>Output Quality</Label>
                <Select 
                  value={settings.tts.outputFormat} 
                  onValueChange={(outputFormat: 'mp3_44100_128' | 'mp3_22050_32') => 
                    updateTTS({ outputFormat })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3_44100_128">High Quality (44.1kHz, 128kbps)</SelectItem>
                    <SelectItem value="mp3_22050_32">Standard (22.05kHz, 32kbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Test TTS */}
              <Button variant="outline" className="w-full gap-2" onClick={handleTestTts} disabled={ttsLoading}>
                {ttsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isSpeaking ? 'Stop' : 'Test Voice'}
              </Button>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Voice Tuning Section */}
          <Collapsible open={voiceTuningOpen} onOpenChange={setVoiceTuningOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Voice Tuning
                </h3>
                {voiceTuningOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Presets */}
              <div className="space-y-2">
                <Label>Voice Preset</Label>
                <Select value={currentPreset} onValueChange={(preset: VoicePreset) => applyPreset(preset)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRESET_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <span className="font-medium">{info.name}</span>
                        <span className="text-muted-foreground ml-2">- {info.description}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stability */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="cursor-help">Stability</Label>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>Lower = more expressive/variable. Higher = more consistent.</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.tts.voiceSettings.stability * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.tts.voiceSettings.stability]}
                  onValueChange={([stability]) => updateVoiceSettings({ stability })}
                  max={1}
                  step={0.05}
                />
              </div>

              {/* Similarity Boost */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="cursor-help">Similarity Boost</Label>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>How closely to match the original voice characteristics.</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.tts.voiceSettings.similarityBoost * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.tts.voiceSettings.similarityBoost]}
                  onValueChange={([similarityBoost]) => updateVoiceSettings({ similarityBoost })}
                  max={1}
                  step={0.05}
                />
              </div>

              {/* Style */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="cursor-help">Style Exaggeration</Label>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>Higher = more stylized/dramatic delivery.</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.tts.voiceSettings.style * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.tts.voiceSettings.style]}
                  onValueChange={([style]) => updateVoiceSettings({ style })}
                  max={1}
                  step={0.05}
                />
              </div>

              {/* Speaker Boost */}
              <div className="flex items-center justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-help">Speaker Boost</Label>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>Enhances clarity and voice similarity.</p>
                  </TooltipContent>
                </Tooltip>
                <Switch
                  checked={settings.tts.voiceSettings.useSpeakerBoost}
                  onCheckedChange={(useSpeakerBoost) => updateVoiceSettings({ useSpeakerBoost })}
                />
              </div>

              {/* Speech Speed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Speech Speed</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.tts.voiceSettings.speed.toFixed(2)}x
                  </span>
                </div>
                <Slider
                  value={[settings.tts.voiceSettings.speed]}
                  onValueChange={([speed]) => updateVoiceSettings({ speed })}
                  min={0.7}
                  max={1.2}
                  step={0.05}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Playback Settings Section */}
          <Collapsible open={playbackOpen} onOpenChange={setPlaybackOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  Playback Settings
                </h3>
                {playbackOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Default Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Default Volume
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.playback.volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.playback.volume]}
                  onValueChange={([volume]) => updatePlayback({ volume })}
                  max={1}
                  step={0.1}
                />
              </div>

              {/* Playback Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Radio className="h-4 w-4" />
                    Playback Speed
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.playback.playbackRate.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[settings.playback.playbackRate]}
                  onValueChange={([playbackRate]) => updatePlayback({ playbackRate })}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Usage Tips */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <h4 className="text-sm font-medium mb-2">Quick Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use <strong>Turbo v2.5</strong> for fast, real-time responses</li>
              <li>• Use <strong>Multilingual v2</strong> for highest quality</li>
              <li>• Lower <strong>Stability</strong> for more expressive voices</li>
              <li>• Presets provide optimized settings for common use cases</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
