import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoControlsProps {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onToggle: () => void;
  onSeek: (time: number) => void;
  onReset: () => void;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoControls({
  isPlaying,
  progress,
  currentTime,
  duration,
  onToggle,
  onSeek,
  onReset,
  className,
}: VideoControlsProps) {
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(percentage * duration);
  };

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50", className)}>
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggle}
        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      {/* Progress Bar */}
      <div 
        className="flex-1 h-1.5 bg-muted rounded-full cursor-pointer group relative"
        onClick={handleProgressClick}
      >
        {/* Background track */}
        <div className="absolute inset-0 rounded-full bg-muted" />
        
        {/* Progress fill */}
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
        
        {/* Thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress * 100}% - 6px)` }}
        />
      </div>

      {/* Time Display */}
      <span className="text-xs text-muted-foreground font-mono min-w-[70px] text-right">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Reset Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onReset}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
