import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { MessageSquare, Wand2, Rocket, Play } from "lucide-react";
import { useVideoTimeline } from "@/hooks/useVideoTimeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useVideoAudio } from "@/hooks/useVideoAudio";
import { useSceneNarration } from "@/hooks/useSceneNarration";
import { VideoControls } from "./video/VideoControls";
import { VideoScene } from "./video/VideoScene";
import { TypingAnimation } from "./video/TypingAnimation";
import { CodeStreamAnimation } from "./video/CodeStreamAnimation";
import { DeployAnimation } from "./video/DeployAnimation";
import { KernelLogoAnimated } from "@/components/ui/kernel-logo-animated";
import { GlassPanel } from "@/components/ui/glass-panel";

const TOTAL_DURATION = 24; // seconds

const scenes = [
  { id: "intro", start: 0, end: 4, label: "Intro" },
  { id: "describe", start: 4, end: 9, label: "Describe", icon: MessageSquare },
  { id: "generate", start: 9, end: 15, label: "Generate", icon: Wand2 },
  { id: "deploy", start: 15, end: 20, label: "Deploy", icon: Rocket },
  { id: "outro", start: 20, end: 24, label: "Complete" },
];

// Scene narration scripts
const sceneNarrations = [
  { 
    sceneId: "intro", 
    text: "Welcome to Kernel. Your AI Development OS.",
    startTime: 0 
  },
  { 
    sceneId: "describe", 
    text: "Simply describe what you want to build in plain English.",
    startTime: 4 
  },
  { 
    sceneId: "generate", 
    text: "Watch as AI writes production-ready code in real time.",
    startTime: 9 
  },
  { 
    sceneId: "deploy", 
    text: "Deploy instantly with a single click. No configuration needed.",
    startTime: 15 
  },
  { 
    sceneId: "outro", 
    text: "From idea to live app in minutes. That's Kernel.",
    startTime: 20 
  },
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
}

export function HowItWorksVideo({ className }: HowItWorksVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.5 });
  const { shouldReduceMotion } = useReducedMotion();
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

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

  // Audio hook for synchronized background music
  const {
    isLoaded: audioLoaded,
    isMuted: musicMuted,
    volume,
    toggleMute: toggleMusicMute,
    setVolume,
    syncWithTimeline,
    reset: resetAudio,
  } = useVideoAudio({
    audioUrl: audioUrl || undefined,
    duration: TOTAL_DURATION,
  });

  // Scene narration hook
  const {
    isLoading: narrationLoading,
    isReady: narrationReady,
    isMuted: narrationMuted,
    preloadNarrations,
    playNarrationForScene,
    stopNarration,
    toggleMute: toggleNarrationMute,
    reset: resetNarration,
  } = useSceneNarration({
    narrations: sceneNarrations,
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George - clear, professional voice
  });

  const hasStarted = currentTime > 0 || isPlaying;

  // Track previous scene to detect scene changes
  const prevSceneRef = useRef<string | null>(null);

  // Generate ambient audio on first play
  const generateAudio = useCallback(async () => {
    if (audioUrl || isGeneratingAudio) return;
    
    setIsGeneratingAudio(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: 'Ambient electronic tech music, building progression, modern futuristic sound, cinematic, soft intro building to confident peak then resolving, suitable for product demo video',
            duration: TOTAL_DURATION,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Audio generation failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      console.log('Audio generated successfully');
    } catch (error) {
      console.error('Failed to generate audio:', error);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [audioUrl, isGeneratingAudio]);

  // Sync audio with video timeline
  useEffect(() => {
    if (audioLoaded) {
      syncWithTimeline(currentTime, isPlaying);
    }
  }, [currentTime, isPlaying, audioLoaded, syncWithTimeline]);

  // Calculate current scene first (used by narration effect)
  const currentScene = useMemo(() => {
    return scenes.find(s => currentTime >= s.start && currentTime < s.end)?.id || "intro";
  }, [currentTime]);

  // Play narration when scene changes
  useEffect(() => {
    if (!isPlaying || !narrationReady) return;
    
    if (currentScene !== prevSceneRef.current) {
      prevSceneRef.current = currentScene;
      playNarrationForScene(currentScene);
    }
  }, [currentScene, isPlaying, narrationReady, playNarrationForScene]);

  // Handle play with audio generation and narration preload
  const handlePlay = useCallback(() => {
    generateAudio();
    preloadNarrations();
    play();
  }, [generateAudio, preloadNarrations, play]);

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
    <div ref={containerRef} className={className}>
      <GlassPanel variant="glow" className="overflow-hidden">
        {/* Video Stage */}
        <div className="relative aspect-video bg-gradient-to-br from-background via-card to-background overflow-hidden">
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
          {!hasStarted && <VideoPoster onPlay={handlePlay} />}

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
                className="text-muted-foreground text-lg"
              >
                Build apps with AI
              </motion.p>
            </motion.div>
          </VideoScene>

          {/* Scene: Describe */}
          <VideoScene isActive={currentScene === "describe"} className="absolute inset-0 flex items-center justify-center p-8">
            <div className="flex items-start gap-6 max-w-lg w-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30"
              >
                <MessageSquare className="h-6 w-6 text-primary" />
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
                    className="text-sm md:text-base"
                  />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-muted-foreground mt-2 ml-2"
                >
                  Just describe what you want
                </motion.p>
              </div>
            </div>
          </VideoScene>

          {/* Scene: Generate */}
          <VideoScene isActive={currentScene === "generate"} className="absolute inset-0 flex items-center justify-center p-8">
            <div className="flex items-start gap-6 max-w-xl w-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30"
              >
                <Wand2 className="h-6 w-6 text-gold" />
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
                  className="text-xs text-muted-foreground mt-2 ml-2"
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
                className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30"
              >
                <Rocket className="h-6 w-6 text-green-400" />
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
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                  </motion.div>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-semibold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent"
              >
                From idea to live app in minutes
              </motion.p>
            </motion.div>
          </VideoScene>

          {/* Progress Indicator Dots */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {scenes.filter(s => s.icon).map((scene) => (
              <motion.button
                key={scene.id}
                onClick={() => seek(scene.start)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentScene === scene.id 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to ${scene.label}`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <VideoControls
          isPlaying={isPlaying}
          progress={progress}
          currentTime={currentTime}
          duration={TOTAL_DURATION}
          onToggle={toggle}
          onSeek={seek}
          onReset={handleReset}
          hasAudio={!!audioUrl || narrationReady}
          isMuted={isMuted}
          volume={volume}
          onToggleMute={handleToggleMute}
          onVolumeChange={setVolume}
          className="rounded-none border-t border-border/50 rounded-b-xl"
        />
      </GlassPanel>
    </div>
  );
}
