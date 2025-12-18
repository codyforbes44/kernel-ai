import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/hooks/useHaptic";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function FloatingActionButton({
  onClick,
  className,
  disabled,
  isLoading,
}: FloatingActionButtonProps) {
  const handleClick = () => {
    hapticFeedback("medium");
    onClick();
  };

  return (
    <Button
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        "safe-area-bottom z-50",
        disabled && "opacity-50",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Plus className="h-6 w-6" />
      )}
    </Button>
  );
}
