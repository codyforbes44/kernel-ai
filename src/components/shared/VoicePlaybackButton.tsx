import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VoicePlaybackButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  onClick: () => void;
  size?: 'sm' | 'default';
  showWaveform?: boolean;
  className?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}

export function VoicePlaybackButton({
  isPlaying,
  isLoading,
  onClick,
  size = 'default',
  showWaveform = true,
  className,
  tooltipSide = 'top',
}: VoicePlaybackButtonProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              buttonSize,
              'relative overflow-hidden transition-all',
              isPlaying && 'bg-primary/10 hover:bg-primary/20',
              className
            )}
            onClick={onClick}
            disabled={isLoading && !isPlaying}
          >
            <AnimatePresence mode="wait">
              {isLoading && !isPlaying ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className={cn(iconSize, 'animate-spin')} />
                </motion.div>
              ) : isPlaying ? (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center justify-center"
                >
                  {showWaveform ? (
                    <div className="flex items-center gap-[2px]">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-[2px] bg-primary rounded-full"
                          animate={{
                            height: [4, 12, 4],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <VolumeX className={iconSize} />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Volume2 className={iconSize} />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          {isPlaying ? 'Stop' : isLoading ? 'Loading...' : 'Play voice'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
