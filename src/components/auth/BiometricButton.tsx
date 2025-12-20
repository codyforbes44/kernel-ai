import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface BiometricButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  email?: string;
  className?: string;
}

export function BiometricButton({
  onClick,
  isLoading,
  disabled,
  email,
  className,
}: BiometricButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "w-full min-h-[48px] sm:min-h-[44px] touch-manipulation",
        "border-primary/30 hover:border-primary hover:bg-primary/5",
        "transition-all duration-200",
        className
      )}
    >
      {isLoading ? (
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <Fingerprint className="h-5 w-5 mr-2 text-primary" />
          <span className="flex flex-col items-start">
            <span className="font-medium">Sign in with biometrics</span>
            {email && (
              <span className="text-xs text-muted-foreground font-normal">
                {email}
              </span>
            )}
          </span>
        </>
      )}
    </Button>
  );
}
