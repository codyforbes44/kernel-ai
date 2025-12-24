import { platforms } from "@/lib/pricing-data";
import { FeatureValue } from "./FeatureValue";
import { cn } from "@/lib/utils";

type PlatformKey = "kernel" | "lovable" | "bolt" | "v0" | "replit" | "cursor";

interface Feature {
  name: string;
  kernel: boolean | string;
  lovable: boolean | string;
  bolt: boolean | string;
  v0: boolean | string;
  replit: boolean | string;
  cursor: boolean | string;
}

interface MobileFeatureCardProps {
  feature: Feature;
  index: number;
}

export const MobileFeatureCard = ({ feature, index }: MobileFeatureCardProps) => {
  return (
    <div
      className={cn(
        "p-4 rounded-xl transition-colors",
        index % 2 === 0 ? "bg-muted/20" : "bg-muted/10"
      )}
    >
      {/* Feature Name */}
      <h4 className="text-sm font-semibold text-foreground mb-3 text-center">
        {feature.name}
      </h4>

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
    </div>
  );
};
