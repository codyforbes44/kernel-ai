import { AI_MODELS, type AIModel } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Zap, DollarSign, Brain, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelInfoCardProps {
  modelId: AIModel;
}

const speedColors: Record<string, string> = {
  fastest: "text-emerald-500",
  fast: "text-blue-500",
  slow: "text-amber-500",
};

const costColors: Record<string, string> = {
  lowest: "text-emerald-500",
  low: "text-emerald-400",
  medium: "text-amber-500",
  high: "text-orange-500",
  highest: "text-rose-500",
};

export function ModelInfoCard({ modelId }: ModelInfoCardProps) {
  const model = AI_MODELS[modelId];

  return (
    <div className="w-64 p-3 space-y-3">
      <div>
        <h4 className="font-semibold text-sm">{model.name}</h4>
        <p className="text-xs text-muted-foreground">{model.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Zap className={cn("h-3.5 w-3.5", speedColors[model.speed])} />
          <span className="capitalize">{model.speed}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className={cn("h-3.5 w-3.5", costColors[model.costTier])} />
          <span className="capitalize">{model.costTier} cost</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{model.contextWindow} context</span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Brain className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Capabilities</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {model.capabilities.map((cap) => (
            <Badge 
              key={cap} 
              variant="secondary" 
              className="text-[10px] px-1.5 py-0 h-5"
            >
              {cap}
            </Badge>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground">
          <span className="font-medium">Best for:</span> {model.bestFor}
        </p>
      </div>
    </div>
  );
}
