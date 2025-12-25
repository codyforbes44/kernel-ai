import { Check, X, Crown, AlertTriangle } from "lucide-react";
import { KernelLogo } from "@/components/ui/kernel-logo";
import { platforms } from "@/lib/pricing-data";
import { COMPARE_SOCIAL_FEATURES, COMPETITOR_COVERAGE, EXCLUSIVE_FEATURES } from "@/lib/compare-data";
import { FeatureValue } from "@/components/compare/FeatureValue";
import { cn } from "@/lib/utils";

type PlatformKey = "kernel" | "lovable" | "bolt" | "v0" | "replit" | "cursor";

interface SocialComparisonCardProps {
  className?: string;
}

export const SocialComparisonCard = ({ className }: SocialComparisonCardProps) => {
  return (
    <div 
      className={cn(
        "relative w-full max-w-[1200px] bg-gradient-to-br from-background via-background to-primary/10 rounded-xl md:rounded-2xl overflow-hidden border border-border/50",
        className
      )}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative flex flex-col p-4 md:p-6 lg:p-8">
        {/* Header with 100% Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <KernelLogo size="md" glow className="md:hidden" />
            <KernelLogo size="lg" glow className="hidden md:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                  Kernel vs The Competition
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] md:text-xs font-bold">
                  <Crown className="w-3 h-3" />
                  100%
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                The <span className="text-primary font-semibold">only</span> platform with complete feature coverage
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] md:text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>Others miss 27-83%</span>
            </div>
            <p className="text-xs text-muted-foreground">kernel.dev</p>
          </div>
        </div>

        {/* Comparison Table - Hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex flex-col flex-1">
          {/* Platform Headers */}
          <div className="grid grid-cols-7 gap-1.5 lg:gap-2 mb-2 lg:mb-3">
            <div className="col-span-1" />
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className={cn(
                  "text-center py-1.5 lg:py-2 px-1 rounded-lg",
                  platform.name === "Kernel"
                    ? "bg-primary/20 border border-primary/40" 
                    : "bg-muted/30"
                )}
              >
                <span className={cn(
                  "text-xs lg:text-sm font-semibold",
                  platform.name === "Kernel" ? "text-primary" : "text-muted-foreground"
                )}>
                  {platform.name}
                </span>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex-1 flex flex-col gap-1 lg:gap-1.5">
            {COMPARE_SOCIAL_FEATURES.map((feature, index) => {
              const isExclusive = EXCLUSIVE_FEATURES.includes(feature.name as typeof EXCLUSIVE_FEATURES[number]);
              return (
                <div
                  key={feature.name}
                  className={cn(
                    "grid grid-cols-7 gap-1.5 lg:gap-2 items-center py-2 lg:py-2.5 px-2 lg:px-3 rounded-lg transition-colors",
                    index % 2 === 0 ? "bg-muted/20" : "bg-transparent",
                    isExclusive && "ring-1 ring-primary/30 bg-primary/5"
                  )}
                >
                  <div className="col-span-1 flex items-center gap-1.5">
                    <span className={cn(
                      "text-xs lg:text-sm font-medium",
                      isExclusive ? "text-primary" : "text-foreground"
                    )}>
                      {feature.name}
                    </span>
                    {isExclusive && (
                      <span className="text-[8px] lg:text-[9px] font-bold text-primary bg-primary/20 px-1 py-0.5 rounded uppercase">
                        Exclusive
                      </span>
                    )}
                  </div>
                  {platforms.map((platform) => {
                    const key = platform.name.toLowerCase() as PlatformKey;
                    return (
                      <FeatureValue 
                        key={platform.name} 
                        value={feature[key]} 
                        size="sm"
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Coverage Summary Bar */}
          <div className="mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center justify-between gap-2 text-[10px] lg:text-xs">
              <span className="text-muted-foreground font-medium">Feature Coverage:</span>
              <div className="flex items-center gap-3 lg:gap-4">
                {platforms.map((platform) => {
                  const key = platform.name.toLowerCase() as keyof typeof COMPETITOR_COVERAGE;
                  const coverage = COMPETITOR_COVERAGE[key];
                  return (
                    <div key={platform.name} className="flex items-center gap-1">
                      <span className={cn(
                        "font-semibold",
                        platform.name === "Kernel" ? "text-emerald-400" : "text-muted-foreground"
                      )}>
                        {platform.name}:
                      </span>
                      <span className={cn(
                        "font-bold",
                        coverage.score === 100 ? "text-emerald-400" : 
                        coverage.score >= 60 ? "text-amber-400" : "text-red-400"
                      )}>
                        {coverage.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Enhanced coverage summary */}
        <div className="md:hidden">
          {/* 100% Badge for mobile */}
          <div className="flex items-center justify-center gap-2 mb-4 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <Crown className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">Kernel: 100% Feature Coverage</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {platforms.slice(0, 4).map((platform) => {
              const key = platform.name.toLowerCase() as keyof typeof COMPETITOR_COVERAGE;
              const coverage = COMPETITOR_COVERAGE[key];
              
              return (
                <div
                  key={platform.name}
                  className={cn(
                    "p-3 rounded-lg text-center",
                    platform.name === "Kernel"
                      ? "bg-primary/20 border border-primary/40"
                      : "bg-muted/30"
                  )}
                >
                  <span className={cn(
                    "text-sm font-semibold block",
                    platform.name === "Kernel" ? "text-primary" : "text-muted-foreground"
                  )}>
                    {platform.name}
                  </span>
                  <span className={cn(
                    "text-lg font-bold block",
                    coverage.score === 100 ? "text-emerald-400" : 
                    coverage.score >= 60 ? "text-amber-400" : "text-red-400"
                  )}>
                    {coverage.score}%
                  </span>
                  {platform.name !== "Kernel" && coverage.missing > 0 && (
                    <span className="text-[10px] text-red-400/80">
                      Missing {coverage.missing} features
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Exclusive features callout */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4">
            <p className="text-xs text-primary font-semibold mb-1.5 flex items-center gap-1">
              <Crown className="w-3 h-3" /> Kernel Exclusives:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXCLUSIVE_FEATURES.map((feature) => (
                <span key={feature} className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-emerald-400" />
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground">Supported</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-2 h-2 md:w-2.5 md:h-2.5 text-red-400" />
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground">Not Available</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[9px] md:text-[10px] font-medium text-amber-400 bg-amber-500/20 px-1 md:px-1.5 py-0.5 rounded">
                Limited
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground">Partial</span>
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Start building with Kernel today →
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialComparisonCard;
