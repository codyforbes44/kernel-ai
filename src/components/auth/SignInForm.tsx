import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { GlowInput } from "@/components/ui/glow-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/useHaptic";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAccountLockout } from "@/hooks/useAccountLockout";
import { useLoginGeolocation } from "@/hooks/useLoginGeolocation";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { signInSchema, type SignInFormData } from "@/lib/validations";
import { SocialAuthButtons, type OAuthProvider } from "./SocialAuthButtons";
import { PasswordInput } from "./PasswordInput";
import { BiometricButton } from "./BiometricButton";
import { BiometricSetupPrompt } from "./BiometricSetupPrompt";
import { ShieldAlert, Clock, MapPin } from "lucide-react";
import { getTimeOfDayGreeting } from "@/lib/utils";

interface SignInFormProps {
  onSignIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null; userId?: string }>;
  onOAuthSignIn: (provider: OAuthProvider) => Promise<void>;
  oauthLoading: OAuthProvider | null;
  onForgotPassword: () => void;
}

export function SignInForm({
  onSignIn,
  onOAuthSignIn,
  oauthLoading,
  onForgotPassword,
}: SignInFormProps) {
  const isMobile = useIsMobile();
  const { success, error: hapticError } = useHaptic();
  const { lockoutStatus, checkLockout, recordAttempt, formatLockoutTime, clearLockoutStatus } = useAccountLockout();
  const { checkLoginLocation } = useLoginGeolocation();
  const { isAvailable: biometricAvailable, savedCredential, authenticate, isLoading: biometricLoading } = useBiometricAuth();
  const [countdown, setCountdown] = useState<number>(0);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [lastSignedInUser, setLastSignedInUser] = useState<{ email: string; userId: string } | null>(null);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutStatus?.locked && lockoutStatus.remainingSeconds && lockoutStatus.remainingSeconds > 0) {
      setCountdown(lockoutStatus.remainingSeconds);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            clearLockoutStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutStatus, clearLockoutStatus]);

  const handleBiometricSignIn = async () => {
    const result = await authenticate();
    
    if (result.success && result.email) {
      // For biometric, we need stored credentials - prompt user to enter password once
      // In a full implementation, you'd have a server-side token exchange
      // For now, we prefill the email and let the user know
      form.setValue('email', result.email);
      if (isMobile) success();
      toast.success("Identity verified!", {
        description: "Please enter your password to complete sign in.",
      });
    } else {
      if (isMobile) hapticError();
      toast.error(result.error || "Biometric authentication failed");
    }
  };

  const handleSubmit = async (data: SignInFormData) => {
    // Check lockout status before attempting login
    const status = await checkLockout(data.email);
    if (status.locked) {
      if (isMobile) hapticError();
      toast.error(`Account temporarily locked. Try again in ${formatLockoutTime(status.remainingSeconds || 0)}`);
      return;
    }

    const { error, userId } = await onSignIn(data.email, data.password, data.rememberMe);
    
    if (error) {
      // Record failed attempt
      await recordAttempt(data.email, false);
      
      if (isMobile) hapticError();
      if (error.message.includes('Invalid login credentials')) {
        const remaining = (status.remainingAttempts || 5) - 1;
        if (remaining > 0) {
          toast.error(`Invalid email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
        } else {
          toast.error('Account locked due to too many failed attempts.');
        }
      } else {
        toast.error(error.message);
      }
    } else {
      // Record successful attempt
      await recordAttempt(data.email, true);
      
      // Check for new login location
      if (userId) {
        const { isNewLocation, location } = await checkLoginLocation(userId);
        if (isNewLocation && location) {
          const locationText = [location.city, location.country].filter(Boolean).join(', ');
          toast.warning(
            `New login location detected: ${locationText || location.ip}`,
            {
              duration: 8000,
              icon: <MapPin className="h-4 w-4" />,
              description: "If this wasn't you, please change your password.",
            }
          );
        }

        // Offer biometric setup if available and not already set up
        if (biometricAvailable && !savedCredential) {
          setLastSignedInUser({ email: data.email, userId });
          // Delay the prompt slightly so the success toast shows first
          setTimeout(() => setShowBiometricSetup(true), 500);
        }
      }
      
      if (isMobile) success();
      toast.success(`${getTimeOfDayGreeting()}! Welcome back`);
    }
  };

  const isLocked = lockoutStatus?.locked && countdown > 0;
  const showBiometricButton = biometricAvailable && savedCredential;

  return (
    <div className="space-y-4">
      {isLocked && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Account locked. Try again in {formatLockoutTime(countdown)}.
          </AlertDescription>
        </Alert>
      )}

      {lockoutStatus && !isLocked && lockoutStatus.attempts > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <ShieldAlert className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            {lockoutStatus.remainingAttempts} login attempt{lockoutStatus.remainingAttempts === 1 ? '' : 's'} remaining before lockout.
          </AlertDescription>
        </Alert>
      )}

      {/* Biometric sign-in button for returning users */}
      {showBiometricButton && (
        <>
          <BiometricButton
            onClick={handleBiometricSignIn}
            isLoading={biometricLoading}
            disabled={form.formState.isSubmitting || !!isLocked}
            email={savedCredential.email}
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or use another method</span>
            </div>
          </div>
        </>
      )}

      <SocialAuthButtons
        onProviderClick={onOAuthSignIn}
        loadingProvider={oauthLoading}
        disabled={form.formState.isSubmitting || !!isLocked || biometricLoading}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <GlowInput
            id="signin-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            variant="glow"
            className="min-h-[44px] md:min-h-[40px]"
            disabled={!!isLocked}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <PasswordInput
          id="signin-password"
          register={form.register('password')}
          error={form.formState.errors.password?.message}
          disabled={!!isLocked}
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={form.watch('rememberMe')}
            onCheckedChange={(checked) => form.setValue('rememberMe', checked === true)}
            disabled={!!isLocked}
          />
          <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
            Remember me
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full min-h-[44px] md:min-h-[40px] touch-manipulation"
          disabled={form.formState.isSubmitting || !!isLocked || biometricLoading}
        >
          {form.formState.isSubmitting ? "Signing in..." : isLocked ? "Account Locked" : "Sign In"}
        </Button>

        <div className="text-sm pt-1">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-muted-foreground hover:text-primary touch-manipulation py-2 -my-2 px-1 -mx-1"
          >
            Forgot password?
          </button>
        </div>
      </form>

      {/* Biometric setup prompt after successful login */}
      {lastSignedInUser && (
        <BiometricSetupPrompt
          open={showBiometricSetup}
          onOpenChange={setShowBiometricSetup}
          email={lastSignedInUser.email}
          userId={lastSignedInUser.userId}
        />
      )}
    </div>
  );
}
