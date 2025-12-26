import { useThreePerformance } from '@/hooks/useThreePerformance';

interface PerformanceTierIndicatorProps {
  visible?: boolean;
}

export function PerformanceTierIndicator({ visible = true }: PerformanceTierIndicatorProps) {
  const { tier, fps, reducedMotion, isMobile } = useThreePerformance();

  if (!visible) return null;

  const tierColors = {
    ULTRA: 'bg-purple-500/80',
    HIGH: 'bg-green-500/80',
    MEDIUM: 'bg-yellow-500/80',
    LOW: 'bg-red-500/80',
  };

  return (
    <div className="absolute bottom-4 left-4 z-50 pointer-events-none">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-mono text-white/90 space-y-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${tierColors[tier]}`} />
          <span className="font-semibold">{tier}</span>
          <span className="text-white/60">|</span>
          <span className="text-white/70">{fps} FPS</span>
        </div>
        <div className="text-white/50 text-[10px]">
          {isMobile ? '📱 Mobile' : '🖥️ Desktop'}
          {reducedMotion && ' • Reduced Motion'}
        </div>
      </div>
    </div>
  );
}
