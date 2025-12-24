import { Check, X } from "lucide-react";
import { KernelLogo } from "@/components/ui/kernel-logo";
import { platforms } from "@/lib/pricing-data";
import { COMPARE_SOCIAL_FEATURES } from "@/lib/compare-data";
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
        "relative w-full max-w-[1200px] aspect-[1200/675] bg-gradient-to-br from-background via-background to-primary/10 rounded-2xl overflow-hidden border border-border/50",
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

      <div className="relative h-full flex flex-col p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <KernelLogo size="lg" glow />
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Kernel vs The Competition
              </h1>
              <p className="text-sm text-muted-foreground">
                The complete AI-powered development platform
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">kernel.dev</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 flex flex-col">
          {/* Platform Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            <div className="col-span-1" />
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className={cn(
                  "text-center py-2 px-1 rounded-lg",
                  platform.name === "Kernel"
                    ? "bg-primary/20 border border-primary/40" 
                    : "bg-muted/30"
                )}
              >
                <span className={cn(
                  "text-sm font-semibold",
                  platform.name === "Kernel" ? "text-primary" : "text-muted-foreground"
                )}>
                  {platform.name}
                </span>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex-1 flex flex-col gap-1.5">
            {COMPARE_SOCIAL_FEATURES.map((feature, index) => (
              <div
                key={feature.name}
                className={cn(
                  "grid grid-cols-7 gap-2 items-center py-2.5 px-3 rounded-lg transition-colors",
                  index % 2 === 0 ? "bg-muted/20" : "bg-transparent"
                )}
              >
                <div className="col-span-1">
                  <span className="text-sm font-medium text-foreground">
                    {feature.name}
                  </span>
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
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </div>
              <span className="text-xs text-muted-foreground">Supported</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-2.5 h-2.5 text-red-400" />
              </div>
              <span className="text-xs text-muted-foreground">Not Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                Limited
              </span>
              <span className="text-xs text-muted-foreground">Partial</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Start building with Kernel today →
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialComparisonCard;
