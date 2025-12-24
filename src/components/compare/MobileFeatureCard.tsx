import { platforms, PlatformFeature } from "@/lib/pricing-data";
import { FeatureValue } from "./FeatureValue";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type PlatformKey = "kernel" | "lovable" | "bolt" | "v0" | "replit" | "cursor";

interface MobileFeatureCardProps {
  feature: PlatformFeature;
  index: number;
  onTap?: (feature: PlatformFeature) => void;
}

export const MobileFeatureCard = ({ feature, index, onTap }: MobileFeatureCardProps) => {
  return (
    <button
      onClick={() => onTap?.(feature)}
      className={cn(
        "w-full p-4 rounded-xl transition-all active:scale-[0.98] text-left",
        index % 2 === 0 ? "bg-muted/20" : "bg-muted/10",
        "hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
    >
      {/* Feature Name with tap indicator */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">
          {feature.name}
        </h4>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Platform Grid - 3x2 layout */}
      <div className="grid grid-cols-3 gap-2">
        {platforms.map((platform) => {
          const key = platform.name.toLowerCase() as PlatformKey;
          const isKernel = platform.name === "Kernel";
          return (
            <div
              key={platform.name}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-lg",
                isKernel && "bg-primary/10 border border-primary/30"
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium truncate max-w-full",
                  isKernel ? "text-primary" : "text-muted-foreground"
                )}
              >
                {platform.name}
              </span>
              <FeatureValue value={feature[key]} size="sm" />
            </div>
          );
        })}
      </div>
    </button>
  );
};
