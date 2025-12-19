import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, Zap, Rocket, ChevronDown } from "lucide-react";
import { AI_MODELS, type AIModel } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  disabled?: boolean;
}

const modelIcons: Record<AIModel, React.ReactNode> = {
  'google/gemini-2.5-flash': <Zap className="h-3.5 w-3.5" />,
  'google/gemini-2.5-pro': <Sparkles className="h-3.5 w-3.5" />,
  'google/gemini-2.5-flash-lite': <Rocket className="h-3.5 w-3.5" />,
};

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const currentModel = AI_MODELS[selectedModel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground",
            "border border-transparent hover:border-border/50"
          )}
        >
          {modelIcons[selectedModel]}
          <span className="hidden sm:inline">{currentModel.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {(Object.keys(AI_MODELS) as AIModel[]).map((modelId) => {
          const model = AI_MODELS[modelId];
          const isSelected = modelId === selectedModel;
          
          return (
            <DropdownMenuItem
              key={modelId}
              onClick={() => onModelChange(modelId)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                isSelected && "bg-primary/10"
              )}
            >
              {modelIcons[modelId]}
              <div className="flex flex-col">
                <span className={cn("text-sm", isSelected && "font-medium")}>
                  {model.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {model.description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
