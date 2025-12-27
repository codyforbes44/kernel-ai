import { Volume2, Phone, Radio, Hand, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { VoiceMode, VoiceInputMode } from '@/constants/companion';

interface VoiceQuickSettingsProps {
  voiceMode: VoiceMode;
  inputMode: VoiceInputMode;
  isMuted: boolean;
  onVoiceModeChange: (mode: VoiceMode) => void;
  onInputModeChange: (mode: VoiceInputMode) => void;
  onMuteToggle: () => void;
  onOpenFullSettings?: () => void;
  className?: string;
}

export function VoiceQuickSettings({
  voiceMode,
  inputMode,
  isMuted,
  onVoiceModeChange,
  onInputModeChange,
  onMuteToggle,
  onOpenFullSettings,
  className,
}: VoiceQuickSettingsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-8 w-8", className)}
          title="Voice Settings"
        >
          {voiceMode === 'conversation' ? (
            <Phone className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-4">
          <div className="font-medium text-sm">Voice Settings</div>
          
          {/* Voice Mode Toggle */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={voiceMode === 'read-aloud' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => onVoiceModeChange('read-aloud')}
              >
                <Volume2 className="h-3 w-3" />
                Read Aloud
              </Button>
              <Button
                variant={voiceMode === 'conversation' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => onVoiceModeChange('conversation')}
              >
                <Phone className="h-3 w-3" />
                Voice Chat
              </Button>
            </div>
          </div>
          
          {/* Input Mode (only for conversation) */}
          {voiceMode === 'conversation' && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Input</Label>
              <div className="flex gap-2">
                <Button
                  variant={inputMode === 'vad' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => onInputModeChange('vad')}
                >
                  <Radio className="h-3 w-3" />
                  Auto
                </Button>
                <Button
                  variant={inputMode === 'push-to-talk' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => onInputModeChange('push-to-talk')}
                >
                  <Hand className="h-3 w-3" />
                  PTT
                </Button>
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="mute-toggle" className="text-sm">Mute Microphone</Label>
            <Switch
              id="mute-toggle"
              checked={isMuted}
              onCheckedChange={onMuteToggle}
            />
          </div>
          
          {onOpenFullSettings && (
            <>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2"
                onClick={onOpenFullSettings}
              >
                <Settings className="h-4 w-4" />
                All Voice Settings
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}