import { motion } from 'framer-motion';
import { Volume2, Phone, Radio, Hand } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { VoiceMode, VoiceInputMode } from '@/constants/companion';

interface VoiceModeSelectorProps {
  voiceMode: VoiceMode;
  inputMode: VoiceInputMode;
  onVoiceModeChange: (mode: VoiceMode) => void;
  onInputModeChange: (mode: VoiceInputMode) => void;
  className?: string;
}

export function VoiceModeSelector({
  voiceMode,
  inputMode,
  onVoiceModeChange,
  onInputModeChange,
  className,
}: VoiceModeSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Voice Mode Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Voice Mode</Label>
        <RadioGroup
          value={voiceMode}
          onValueChange={(value) => onVoiceModeChange(value as VoiceMode)}
          className="grid grid-cols-2 gap-3"
        >
          <Label
            htmlFor="read-aloud"
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
              voiceMode === 'read-aloud'
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <RadioGroupItem value="read-aloud" id="read-aloud" className="sr-only" />
            <motion.div
              animate={{ scale: voiceMode === 'read-aloud' ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Volume2 className={cn(
                "h-6 w-6",
                voiceMode === 'read-aloud' ? "text-primary" : "text-muted-foreground"
              )} />
            </motion.div>
            <div className="text-center">
              <p className="font-medium text-sm">Read Aloud</p>
              <p className="text-xs text-muted-foreground">ElevenLabs TTS</p>
            </div>
          </Label>
          
          <Label
            htmlFor="conversation"
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
              voiceMode === 'conversation'
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <RadioGroupItem value="conversation" id="conversation" className="sr-only" />
            <motion.div
              animate={{ scale: voiceMode === 'conversation' ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Phone className={cn(
                "h-6 w-6",
                voiceMode === 'conversation' ? "text-primary" : "text-muted-foreground"
              )} />
            </motion.div>
            <div className="text-center">
              <p className="font-medium text-sm">Voice Chat</p>
              <p className="text-xs text-muted-foreground">xAI Real-time</p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Input Mode Selection (only shown for conversation mode) */}
      {voiceMode === 'conversation' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <Label className="text-sm font-medium">Input Mode</Label>
          <RadioGroup
            value={inputMode}
            onValueChange={(value) => onInputModeChange(value as VoiceInputMode)}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="vad"
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                inputMode === 'vad'
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground/30"
              )}
            >
              <RadioGroupItem value="vad" id="vad" className="sr-only" />
              <Radio className={cn(
                "h-5 w-5",
                inputMode === 'vad' ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-center">
                <p className="font-medium text-xs">Hands-free</p>
                <p className="text-xs text-muted-foreground">Auto-detect speech</p>
              </div>
            </Label>
            
            <Label
              htmlFor="push-to-talk"
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                inputMode === 'push-to-talk'
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground/30"
              )}
            >
              <RadioGroupItem value="push-to-talk" id="push-to-talk" className="sr-only" />
              <Hand className={cn(
                "h-5 w-5",
                inputMode === 'push-to-talk' ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-center">
                <p className="font-medium text-xs">Push to Talk</p>
                <p className="text-xs text-muted-foreground">Hold to speak</p>
              </div>
            </Label>
          </RadioGroup>
        </motion.div>
      )}
    </div>
  );
}