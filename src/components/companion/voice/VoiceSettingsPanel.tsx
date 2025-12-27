import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Square, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTTS } from '@/hooks/useTTS';
import { PERSONALITY_VOICE_MAP, DEFAULT_VOICE_SETTINGS } from '@/constants/companion';
import { cn } from '@/lib/utils';
import type { CompanionProfile } from '@/types/companion';

interface VoiceSettings {
  enabled: boolean;
  autoPlay: boolean;
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
}

interface VoiceSettingsPanelProps {
  companion: CompanionProfile;
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
}

const VOICE_DESCRIPTIONS: Record<string, string> = {
  mentor: 'Sarah - Calm, wise, and reassuring',
  creative: 'Lily - Energetic and expressive',
  analytical: 'Brian - Clear and precise',
  supportive: 'Alice - Warm and gentle',
};

export function VoiceSettingsPanel({
  companion,
  settings,
  onSettingsChange,
}: VoiceSettingsPanelProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const voiceId = PERSONALITY_VOICE_MAP[companion.personality_type] || PERSONALITY_VOICE_MAP.mentor;
  const voiceDescription = VOICE_DESCRIPTIONS[companion.personality_type] || VOICE_DESCRIPTIONS.mentor;

  const { speak, stop, isSpeaking, isLoading } = useTTS();

  const handleTestVoice = () => {
    if (isSpeaking) {
      stop();
    } else {
      const testMessage = `Hello! I'm ${companion.name}. This is how I'll sound when we chat together.`;
      speak(testMessage, voiceId, {
        voiceSettings: {
          stability: settings.stability,
          similarity_boost: settings.similarity_boost,
          style: settings.style,
          speed: settings.speed,
        },
      });
    }
  };

  const updateSetting = <K extends keyof VoiceSettings>(key: K, value: VoiceSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          Voice Settings
        </CardTitle>
        <CardDescription>
          Customize how {companion.name} speaks to you
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        {/* Enable Voice */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="voice-enabled">Enable Voice</Label>
            <p className="text-xs text-muted-foreground">
              Allow {companion.name} to speak responses
            </p>
          </div>
          <Switch
            id="voice-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSetting('enabled', checked)}
          />
        </div>

        <AnimatePresence>
          {settings.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Auto-Play Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-play">Auto-Play Responses</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically speak new messages
                  </p>
                </div>
                <Switch
                  id="auto-play"
                  checked={settings.autoPlay}
                  onCheckedChange={(checked) => updateSetting('autoPlay', checked)}
                />
              </div>

              {/* Voice Preview */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium">{companion.name}'s Voice</p>
                    <p className="text-xs text-muted-foreground">{voiceDescription}</p>
                  </div>
                  <Button
                    variant={isSpeaking ? 'destructive' : 'secondary'}
                    size="sm"
                    onClick={handleTestVoice}
                    disabled={isLoading && !isSpeaking}
                    className="gap-2"
                  >
                    {isLoading && !isSpeaking ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                        />
                        Loading...
                      </>
                    ) : isSpeaking ? (
                      <>
                        <Square className="h-3 w-3" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>

                {/* Voice Waveform Animation */}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-center gap-1 h-8"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-primary rounded-full"
                          animate={{
                            height: [8, 20 + Math.random() * 12, 8],
                          }}
                          transition={{
                            duration: 0.4 + Math.random() * 0.3,
                            repeat: Infinity,
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Speed Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Speech Speed</Label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {settings.speed.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[settings.speed]}
                  onValueChange={([value]) => updateSetting('speed', value)}
                  min={0.7}
                  max={1.3}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slower</span>
                  <span>Faster</span>
                </div>
              </div>

              {/* Advanced Settings Collapsible */}
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      Advanced Voice Tuning
                    </span>
                    <motion.span
                      animate={{ rotate: isAdvancedOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.span>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4 mt-4">
                  {/* Stability */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Stability</Label>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {Math.round(settings.stability * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.stability]}
                      onValueChange={([value]) => updateSetting('stability', value)}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher = more consistent, Lower = more expressive
                    </p>
                  </div>

                  {/* Similarity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Voice Clarity</Label>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {Math.round(settings.similarity_boost * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.similarity_boost]}
                      onValueChange={([value]) => updateSetting('similarity_boost', value)}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  {/* Style */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Style Intensity</Label>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {Math.round(settings.style * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.style]}
                      onValueChange={([value]) => updateSetting('style', value)}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher = more stylized delivery
                    </p>
                  </div>

                  {/* Reset Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onSettingsChange({
                        ...settings,
                        stability: DEFAULT_VOICE_SETTINGS.stability,
                        similarity_boost: DEFAULT_VOICE_SETTINGS.similarity_boost,
                        style: DEFAULT_VOICE_SETTINGS.style,
                        speed: 1.0,
                      });
                    }}
                  >
                    Reset to Defaults
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
