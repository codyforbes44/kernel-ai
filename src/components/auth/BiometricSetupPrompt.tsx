import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fingerprint, Smartphone, ShieldCheck } from "lucide-react";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/useHaptic";
import { useIsMobile } from "@/hooks/use-mobile";

interface BiometricSetupPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  userId: string;
}

export function BiometricSetupPrompt({
  open,
  onOpenChange,
  email,
  userId,
}: BiometricSetupPromptProps) {
  const { register, isLoading } = useBiometricAuth();
  const { success, error: hapticError } = useHaptic();
  const isMobile = useIsMobile();
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetup = async () => {
    setIsSettingUp(true);
    const result = await register(email, userId);
    setIsSettingUp(false);

    if (result.success) {
      if (isMobile) success();
      toast.success("Biometric login enabled!", {
        description: "You can now sign in with Face ID or Touch ID",
      });
      onOpenChange(false);
    } else {
      if (isMobile) hapticError();
      toast.error(result.error || "Failed to set up biometric login");
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Fingerprint className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Enable Biometric Login</DialogTitle>
          <DialogDescription>
            Sign in faster next time using Face ID, Touch ID, or your device's biometric authentication.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Quick Access</p>
              <p className="text-xs text-muted-foreground">
                Skip typing your password every time
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Secure</p>
              <p className="text-xs text-muted-foreground">
                Your biometric data never leaves your device
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading || isSettingUp}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleSetup}
            disabled={isLoading || isSettingUp}
            className="w-full sm:w-auto"
          >
            {isSettingUp ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Setting up...
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4 mr-2" />
                Enable Biometrics
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
