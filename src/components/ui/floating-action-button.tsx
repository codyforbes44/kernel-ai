import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export function FloatingActionButton({
  onClick,
  className,
  disabled,
}: FloatingActionButtonProps) {
  return (
    <Button
      size="icon"
      onClick={onClick}
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
      <Plus className="h-6 w-6" />
    </Button>
  );
}
