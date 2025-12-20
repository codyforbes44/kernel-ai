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
import { useRateLimiting } from "@/hooks/useRateLimiting";
import { useLoginGeolocation } from "@/hooks/useLoginGeolocation";
import { signInSchema, type SignInFormData } from "@/lib/validations";
import { SocialAuthButtons, type OAuthProvider } from "./SocialAuthButtons";
import { PasswordInput } from "./PasswordInput";
import { ShieldAlert, Clock, MapPin } from "lucide-react";

interface SignInFormProps {
  onSignIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null; userId?: string }>;
  onOAuthSignIn: (provider: OAuthProvider) => Promise<void>;
  oauthLoading: OAuthProvider | null;
  onForgotPassword: () => void;
  onSwitchToSignUp: () => void;
}

export function SignInForm({
  onSignIn,
  onOAuthSignIn,
  oauthLoading,
  onForgotPassword,
  onSwitchToSignUp,
}: SignInFormProps) {
  const isMobile = useIsMobile();
  const { success, error: hapticError } = useHaptic();
  const { lockoutStatus, checkLockout, recordAttempt, formatLockoutTime, clearLockoutStatus } = useRateLimiting();
  const { checkLoginLocation, currentLocation } = useLoginGeolocation();
  const [countdown, setCountdown] = useState<number>(0);

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
      }
      
      if (isMobile) success();
      toast.success("Welcome back!");
    }
  };

  const isLocked = lockoutStatus?.locked && countdown > 0;

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

      <SocialAuthButtons
        onProviderClick={onOAuthSignIn}
        loadingProvider={oauthLoading}
        disabled={form.formState.isSubmitting || !!isLocked}
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
          disabled={form.formState.isSubmitting || !!isLocked}
        >
          {form.formState.isSubmitting ? "Signing in..." : isLocked ? "Account Locked" : "Sign In"}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-muted-foreground hover:text-primary touch-manipulation"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-primary hover:underline touch-manipulation"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
