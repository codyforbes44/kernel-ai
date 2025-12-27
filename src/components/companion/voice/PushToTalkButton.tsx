import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PushToTalkButtonProps {
  isActive: boolean;
  audioLevel: number;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
}

export function PushToTalkButton({
  isActive,
  audioLevel,
  onStart,
  onStop,
  disabled = false,
  className,
}: PushToTalkButtonProps) {
  const isHoldingRef = useRef(false);

  const handlePointerDown = useCallback(() => {
    if (disabled) return;
    isHoldingRef.current = true;
    onStart();
  }, [disabled, onStart]);

  const handlePointerUp = useCallback(() => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    onStop();
  }, [onStop]);

  const handlePointerLeave = useCallback(() => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    onStop();
  }, [onStop]);

  // Handle spacebar for push-to-talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !disabled) {
        e.preventDefault();
        isHoldingRef.current = true;
        onStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isHoldingRef.current) {
        e.preventDefault();
        isHoldingRef.current = false;
        onStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, onStart, onStop]);

  return (
    <div className={cn("relative", className)}>
      {/* Pulse rings when active */}
      {isActive && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{
              scale: [1, 1.5 + audioLevel * 0.5],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30"
            animate={{
              scale: [1, 1.3 + audioLevel * 0.3],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.2,
            }}
          />
        </>
      )}
      
      {/* Main button */}
      <motion.button
        className={cn(
          "relative w-20 h-20 rounded-full flex items-center justify-center",
          "transition-colors touch-none select-none",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground hover:bg-muted/80",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
        disabled={disabled}
        animate={{
          scale: isActive ? 1.1 : 1,
        }}
        transition={{ duration: 0.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        <Mic className={cn(
          "h-8 w-8 transition-transform",
          isActive && "scale-110"
        )} />
      </motion.button>
      
      {/* Helper text */}
      <motion.p
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap"
        animate={{
          opacity: isActive ? 0 : 1,
        }}
      >
        Hold to speak (or Space)
      </motion.p>
    </div>
  );
}