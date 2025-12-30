import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface VideoControlsProps {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onToggle: () => void;
  onSeek: (time: number) => void;
  onReset: () => void;
  className?: string;
  // Audio controls
  isMuted?: boolean;
  volume?: number;
  onToggleMute?: () => void;
  onVolumeChange?: (volume: number) => void;
  hasAudio?: boolean;
  // Fullscreen controls
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  showFullscreenButton?: boolean;
  // Share controls
  onShare?: () => void;
  showShareButton?: boolean;
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
  isMuted = false,
  volume = 0.7,
  onToggleMute,
  onVolumeChange,
  hasAudio = false,
  isFullscreen = false,
  onToggleFullscreen,
  showFullscreenButton = true,
  onShare,
  showShareButton = true,
}: VideoControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(percentage * duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onVolumeChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, x / rect.width));
    onVolumeChange(newVolume);
  };

  return (
    <div className={cn(
      "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50",
      isFullscreen && "bg-background/95 rounded-none border-0 py-4 px-6",
      className
    )}>
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggle}
        className={cn(
          "h-8 w-8 text-primary hover:text-primary hover:bg-primary/10",
          isFullscreen && "h-10 w-10"
        )}
      >
        {isPlaying ? (
          <Pause className={cn("h-4 w-4", isFullscreen && "h-5 w-5")} />
        ) : (
          <Play className={cn("h-4 w-4 ml-0.5", isFullscreen && "h-5 w-5")} />
        )}
      </Button>

      {/* Progress Bar */}
      <div 
        className={cn(
          "flex-1 h-1.5 bg-muted rounded-full cursor-pointer group relative",
          isFullscreen && "h-2"
        )}
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
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity",
            isFullscreen && "w-4 h-4"
          )}
          style={{ left: `calc(${progress * 100}% - ${isFullscreen ? 8 : 6}px)` }}
        />
      </div>

      {/* Time Display */}
      <span className={cn(
        "text-xs text-muted-foreground font-mono min-w-[60px] sm:min-w-[70px] text-right",
        isFullscreen && "text-sm min-w-[90px]"
      )}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Volume Control */}
      {hasAudio && onToggleMute && (
        <div 
          className="relative flex items-center"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleMute}
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-foreground",
              isFullscreen && "h-10 w-10"
            )}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className={cn("h-3.5 w-3.5", isFullscreen && "h-5 w-5")} />
            ) : (
              <Volume2 className={cn("h-3.5 w-3.5", isFullscreen && "h-5 w-5")} />
            )}
          </Button>

          {/* Volume Slider (on hover) */}
          {showVolumeSlider && onVolumeChange && (
            <div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-background/95 backdrop-blur-sm rounded-lg border border-border/50 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="w-20 h-1.5 bg-muted rounded-full cursor-pointer relative"
                onClick={handleVolumeClick}
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-primary rounded-full"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-sm"
                  style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 5px)` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Button */}
      {showFullscreenButton && onToggleFullscreen && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleFullscreen}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex",
            isFullscreen && "h-10 w-10"
          )}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className={cn("h-3.5 w-3.5", isFullscreen && "h-5 w-5")} />
          ) : (
            <Maximize className="h-3.5 w-3.5" />
          )}
        </Button>
      )}

      {/* Share Button */}
      {showShareButton && onShare && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onShare}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground",
            isFullscreen && "h-10 w-10"
          )}
          aria-label="Share video"
        >
          <Share2 className={cn("h-3.5 w-3.5", isFullscreen && "h-5 w-5")} />
        </Button>
      )}

      {/* Reset Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onReset}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          isFullscreen && "h-10 w-10"
        )}
      >
        <RotateCcw className={cn("h-3.5 w-3.5", isFullscreen && "h-5 w-5")} />
      </Button>
    </div>
  );
}
