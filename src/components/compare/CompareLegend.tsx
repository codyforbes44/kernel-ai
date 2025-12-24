import { Check, X } from "lucide-react";

interface CompareLegendProps {
  size?: "sm" | "md";
}

export const CompareLegend = ({ size = "md" }: CompareLegendProps) => {
  const containerSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  const iconSize = size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const badgeSize = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border/30">
      <div className="flex items-center gap-2">
        <div className={`${containerSize} rounded-full bg-emerald-500/20 flex items-center justify-center`}>
          <Check className={`${iconSize} text-emerald-400`} />
        </div>
        <span className={`${textSize} text-muted-foreground`}>Fully Supported</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`${containerSize} rounded-full bg-red-500/20 flex items-center justify-center`}>
          <X className={`${iconSize} text-red-400`} />
        </div>
        <span className={`${textSize} text-muted-foreground`}>Not Available</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`${badgeSize} font-medium text-amber-400 bg-amber-500/20 rounded`}>
          Limited
        </span>
        <span className={`${textSize} text-muted-foreground`}>Partial Support</span>
      </div>
    </div>
  );
};
