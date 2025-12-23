import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Sparkles, Zap, Rocket, ChevronDown, Brain, Cpu, Atom, FlaskConical } from "lucide-react";
import { AI_MODELS, type AIModel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ModelInfoCard } from "./ModelInfoCard";

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  disabled?: boolean;
  defaultModel?: AIModel;
}

const modelIcons: Record<AIModel, React.ReactNode> = {
  'google/gemini-2.5-flash': <Zap className="h-3.5 w-3.5" />,
  'google/gemini-2.5-pro': <Sparkles className="h-3.5 w-3.5" />,
  'google/gemini-3-pro-preview': <FlaskConical className="h-3.5 w-3.5" />,
  'google/gemini-2.5-flash-lite': <Rocket className="h-3.5 w-3.5" />,
  'openai/gpt-5': <Brain className="h-3.5 w-3.5" />,
  'openai/gpt-5-mini': <Cpu className="h-3.5 w-3.5" />,
  'openai/gpt-5-nano': <Atom className="h-3.5 w-3.5" />,
};

export function ModelSelector({ selectedModel, onModelChange, disabled, defaultModel }: ModelSelectorProps) {
  const currentModel = AI_MODELS[selectedModel];
  const isDifferentFromDefault = defaultModel && selectedModel !== defaultModel;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground",
            "border border-transparent hover:border-border/50",
            isDifferentFromDefault && "border-amber-500/50 text-amber-600 dark:text-amber-400"
          )}
        >
          {modelIcons[selectedModel]}
          <span className="hidden sm:inline">{currentModel.name}</span>
          {isDifferentFromDefault && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Different from your default model" />
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-popover">
        {(Object.keys(AI_MODELS) as AIModel[]).map((modelId) => {
          const model = AI_MODELS[modelId];
          const isSelected = modelId === selectedModel;
          
          return (
            <HoverCard key={modelId} openDelay={300} closeDelay={100}>
              <HoverCardTrigger asChild>
                <DropdownMenuItem
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
              </HoverCardTrigger>
              <HoverCardContent 
                side="right" 
                align="start" 
                className="p-0 w-auto bg-popover border-border"
                sideOffset={8}
              >
                <ModelInfoCard modelId={modelId} />
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
