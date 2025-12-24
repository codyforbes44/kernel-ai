import { Check, X } from "lucide-react";

interface FeatureValueProps {
  value: boolean | string;
  size?: "sm" | "md";
}

export const FeatureValue = ({ value, size = "md" }: FeatureValueProps) => {
  const iconSize = size === "sm" ? "w-2.5 h-2.5" : "w-4 h-4";
  const containerSize = size === "sm" ? "w-4 h-4" : "w-7 h-7";
  const badgeSize = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <div className={`${containerSize} rounded-full bg-emerald-500/20 flex items-center justify-center`}>
          <Check className={`${iconSize} text-emerald-400`} />
        </div>
      </div>
    );
  }
  
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <div className={`${containerSize} rounded-full bg-red-500/20 flex items-center justify-center`}>
          <X className={`${iconSize} text-red-400`} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center">
      <span className={`${badgeSize} font-medium text-amber-400 bg-amber-500/20 rounded`}>
        {value}
      </span>
    </div>
  );
};
