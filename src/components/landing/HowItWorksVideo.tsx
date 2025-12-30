import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { MessageSquare, Wand2, Rocket, Play } from "lucide-react";
import { useVideoTimeline } from "@/hooks/useVideoTimeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useVideoAudio } from "@/hooks/useVideoAudio";
import { useSceneNarration } from "@/hooks/useSceneNarration";
import { useFullscreen } from "@/hooks/useFullscreen";
import { VideoControls } from "./video/VideoControls";
import { VideoScene } from "./video/VideoScene";
import { TypingAnimation } from "./video/TypingAnimation";
import { CodeStreamAnimation } from "./video/CodeStreamAnimation";
import { DeployAnimation } from "./video/DeployAnimation";
import { VideoShareDialog } from "./video/VideoShareDialog";
import { KernelLogoAnimated } from "@/components/ui/kernel-logo-animated";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

const TOTAL_DURATION = 24; // seconds

const scenes = [
  { id: "intro", start: 0, end: 4, label: "Intro" },
  { id: "describe", start: 4, end: 9, label: "Describe", icon: MessageSquare },
  { id: "generate", start: 9, end: 15, label: "Generate", icon: Wand2 },
  { id: "deploy", start: 15, end: 20, label: "Deploy", icon: Rocket },
  { id: "outro", start: 20, end: 24, label: "Complete" },
];

// Static audio file paths
const BACKGROUND_MUSIC_URL = "/audio/background-music.mp3";

const sceneNarrations = [
  { sceneId: "intro", audioUrl: "/audio/narration-intro.mp3" },
  { sceneId: "describe", audioUrl: "/audio/narration-describe.mp3" },
  { sceneId: "generate", audioUrl: "/audio/narration-generate.mp3" },
  { sceneId: "deploy", audioUrl: "/audio/narration-deploy.mp3" },
  { sceneId: "outro", audioUrl: "/audio/narration-complete.mp3" },
];

// Poster/Thumbnail component
function VideoPoster({ onPlay }: { onPlay: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 cursor-pointer group"
      onClick={onPlay}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        {/* Icon row */}
        <div className="flex items-center gap-3">
          {[MessageSquare, Wand2, Rocket].map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20"
            >
              <Icon className="h-5 w-5 text-primary/70" />
            </motion.div>
          ))}
        </div>

        {/* Play button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <div 
            className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 group-hover:bg-primary/30 group-hover:border-primary/60 transition-all duration-300"
            style={{
              boxShadow: '0 0 40px hsl(var(--primary) / 0.3)',
            }}
          >
            <Play className="h-8 w-8 text-primary ml-1 group-hover:scale-110 transition-transform" />
          </div>
          
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ 
              scale: [1, 1.3, 1.3],
              opacity: [0.6, 0, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </motion.div>

        {/* Title */}
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">See how it works</p>
          <p className="text-sm text-muted-foreground mt-1">Watch the 24-second demo</p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />
    </motion.div>
  );
}

interface HowItWorksVideoProps {
  className?: string;
  shareUrl?: string;
}

export function HowItWorksVideo({ className, shareUrl }: HowItWorksVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.5 });
  const { shouldReduceMotion } = useReducedMotion();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Fullscreen hook
  const { isFullscreen, toggleFullscreen, isSupported: fullscreenSupported } = useFullscreen(playerRef);

  const {
    currentTime,
    isPlaying,
    progress,
    play,
    pause,
    seek,
    reset,
    toggle,
  } = useVideoTimeline({
    duration: TOTAL_DURATION,
    autoPlay: false,
    loop: false,
  });

  // Audio hook for synchronized background music (static file)
  const {
    isLoaded: audioLoaded,
    isMuted: musicMuted,
    volume,
    toggleMute: toggleMusicMute,
    setVolume,
    syncWithTimeline,
    reset: resetAudio,
  } = useVideoAudio({
    audioUrl: BACKGROUND_MUSIC_URL,
    duration: TOTAL_DURATION,
  });

  // Scene narration hook (static files)
  const {
    isLoaded: narrationLoaded,
    isMuted: narrationMuted,
    playForScene,
    stopAll: stopNarration,
    toggleMute: toggleNarrationMute,
    reset: resetNarration,
  } = useSceneNarration({
    narrations: sceneNarrations,
    volume,
  });

  const hasAudio = audioLoaded || narrationLoaded;
  const hasStarted = currentTime > 0 || isPlaying;

  // Track previous scene to detect scene changes
  const prevSceneRef = useRef<string | null>(null);

  // Sync audio with video timeline
  useEffect(() => {
    if (audioLoaded) {
      syncWithTimeline(currentTime, isPlaying);
    }
  }, [currentTime, isPlaying, audioLoaded, syncWithTimeline]);

  // Calculate current scene
  const currentScene = useMemo(() => {
    return scenes.find(s => currentTime >= s.start && currentTime < s.end)?.id || "intro";
  }, [currentTime]);

  // Play narration when scene changes
  useEffect(() => {
    if (!isPlaying) return;
    
    if (currentScene !== prevSceneRef.current) {
      prevSceneRef.current = currentScene;
      playForScene(currentScene);
    }
  }, [currentScene, isPlaying, playForScene]);

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
    resetAudio();
    resetNarration();
    prevSceneRef.current = null;
  }, [reset, resetAudio, resetNarration]);

  // Combined mute toggle (mutes both music and narration)
  const handleToggleMute = useCallback(() => {
    toggleMusicMute();
    toggleNarrationMute();
  }, [toggleMusicMute, toggleNarrationMute]);

  const isMuted = musicMuted && narrationMuted;

  // Pause when out of view
  useEffect(() => {
    if (!isInView && isPlaying) {
      pause();
    }
  }, [isInView, isPlaying, pause]);

  // Stop narration when paused
  useEffect(() => {
    if (!isPlaying) {
      stopNarration();
    }
  }, [isPlaying, stopNarration]);

  // Generate share URL
  const actualShareUrl = shareUrl || (typeof window !== 'undefined' 
    ? `${window.location.origin}/#demo-video` 
    : '');

  // Handle share
  const handleShare = useCallback(() => {
    setShareDialogOpen(true);
  }, []);

  // Reduced motion fallback
  if (shouldReduceMotion) {
    return (
      <div className={className}>
        <GlassPanel variant="glow" className="p-6">
          <div className="flex items-center justify-center gap-6">
            {scenes.filter(s => s.icon).map((scene) => (
              <div key={scene.id} className="flex flex-col items-center gap-2">
                {scene.icon && <scene.icon className="h-8 w-8 text-primary" />}
                <span className="text-sm text-muted-foreground">{scene.label}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} id="demo-video" className={className}>
        <div 
          ref={playerRef}
          className={cn(
            "transition-all duration-300",
            isFullscreen && "fixed inset-0 z-50 bg-background flex flex-col"
          )}
        >
          <GlassPanel 
            variant="glow" 
            className={cn(
              "overflow-hidden",
              isFullscreen && "rounded-none border-0 flex-1 flex flex-col"
            )}
          >
            {/* Video Stage */}
            <div className={cn(
              "relative aspect-video bg-gradient-to-br from-background via-card to-background overflow-hidden",
              isFullscreen && "flex-1 aspect-auto"
            )}>
              {/* Background Grid */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Poster - show before video starts */}
              {!hasStarted && <VideoPoster onPlay={play} />}

              {/* Scene: Intro */}
              <VideoScene isActive={currentScene === "intro" && hasStarted} className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-center gap-4"
                >
                  <KernelLogoAnimated size="xl" variant="animated" isActive={true} />
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className={cn(
                      "text-muted-foreground text-lg",
                      isFullscreen && "text-2xl"
                    )}
                  >
                    Build apps with AI
                  </motion.p>
                </motion.div>
              </VideoScene>

              {/* Scene: Describe */}
              <VideoScene isActive={currentScene === "describe"} className="absolute inset-0 flex items-center justify-center p-8">
                <div className={cn(
                  "flex items-start gap-6 max-w-lg w-full",
                  isFullscreen && "max-w-2xl"
                )}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30",
                      isFullscreen && "w-16 h-16"
                    )}
                  >
                    <MessageSquare className={cn("h-6 w-6 text-primary", isFullscreen && "h-8 w-8")} />
                  </motion.div>
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-card/80 backdrop-blur-sm rounded-lg rounded-tl-none p-4 border border-border/50"
                    >
                      <TypingAnimation
                        text="Build me a dashboard with charts and a sidebar navigation..."
                        isActive={currentScene === "describe"}
                        typingSpeed={40}
                        className={cn("text-sm md:text-base", isFullscreen && "text-lg md:text-xl")}
                      />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className={cn(
                        "text-xs text-muted-foreground mt-2 ml-2",
                        isFullscreen && "text-sm"
                      )}
                    >
                      Just describe what you want
                    </motion.p>
                  </div>
                </div>
              </VideoScene>

              {/* Scene: Generate */}
              <VideoScene isActive={currentScene === "generate"} className="absolute inset-0 flex items-center justify-center p-8">
                <div className={cn(
                  "flex items-start gap-6 max-w-xl w-full",
                  isFullscreen && "max-w-3xl"
                )}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30",
                      isFullscreen && "w-16 h-16"
                    )}
                  >
                    <Wand2 className={cn("h-6 w-6 text-gold", isFullscreen && "h-8 w-8")} />
                  </motion.div>
                  <div className="flex-1">
                    <CodeStreamAnimation 
                      isActive={currentScene === "generate"} 
                      className="w-full"
                    />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className={cn(
                        "text-xs text-muted-foreground mt-2 ml-2",
                        isFullscreen && "text-sm"
                      )}
                    >
                      AI writes production-ready code
                    </motion.p>
                  </div>
                </div>
              </VideoScene>

              {/* Scene: Deploy */}
              <VideoScene isActive={currentScene === "deploy"} className="absolute inset-0 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30",
                      isFullscreen && "w-16 h-16"
                    )}
                  >
                    <Rocket className={cn("h-6 w-6 text-green-400", isFullscreen && "h-8 w-8")} />
                  </motion.div>
                  <DeployAnimation 
                    isActive={currentScene === "deploy"} 
                  />
                </div>
              </VideoScene>

              {/* Scene: Outro */}
              <VideoScene isActive={currentScene === "outro"} className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="flex items-center gap-4">
                    {[MessageSquare, Wand2, Rocket].map((Icon, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.15, type: "spring", stiffness: 300 }}
                        className={cn(
                          "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20",
                          isFullscreen && "w-14 h-14"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 text-primary", isFullscreen && "h-7 w-7")} />
                      </motion.div>
                    ))}
                  </div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={cn(
                      "text-xl font-semibold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent",
                      isFullscreen && "text-3xl"
                    )}
                  >
                    From idea to live app in minutes
                  </motion.p>
                </motion.div>
              </VideoScene>

              {/* Progress Indicator Dots */}
              <div className={cn(
                "absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2",
                isFullscreen && "bottom-20 gap-3"
              )}>
                {scenes.filter(s => s.icon).map((scene) => (
                  <motion.button
                    key={scene.id}
                    onClick={() => seek(scene.start)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentScene === scene.id 
                        ? 'bg-primary scale-125' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                      isFullscreen && "w-3 h-3"
                    )}
                    whileHover={{ scale: 1.5 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Go to ${scene.label}`}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <VideoControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={TOTAL_DURATION}
              progress={progress}
              isMuted={isMuted}
              volume={volume}
              hasAudio={hasAudio}
              onToggle={toggle}
              onSeek={seek}
              onReset={handleReset}
              onToggleMute={handleToggleMute}
              onVolumeChange={setVolume}
              isFullscreen={isFullscreen}
              onToggleFullscreen={fullscreenSupported ? toggleFullscreen : undefined}
              showFullscreenButton={fullscreenSupported}
              onShare={handleShare}
              showShareButton={true}
            />
          </GlassPanel>
        </div>
      </div>

      {/* Share Dialog */}
      <VideoShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareUrl={actualShareUrl}
      />
    </>
  );
}
