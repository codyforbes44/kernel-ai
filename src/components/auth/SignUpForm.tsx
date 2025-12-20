import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/useHaptic";
import { useIsMobile } from "@/hooks/use-mobile";
import { signUpSchema, type SignUpFormData } from "@/lib/validations";
import { SocialAuthButtons, type OAuthProvider } from "./SocialAuthButtons";
import { PasswordInput } from "./PasswordInput";

interface SignUpFormProps {
  onSignUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  onOAuthSignIn: (provider: OAuthProvider) => Promise<void>;
  oauthLoading: OAuthProvider | null;
  onSwitchToSignIn: () => void;
  onSuccess: () => void;
}

export function SignUpForm({
  onSignUp,
  onOAuthSignIn,
  oauthLoading,
  onSwitchToSignIn,
  onSuccess,
}: SignUpFormProps) {
  const isMobile = useIsMobile();
  const { success, error: hapticError } = useHaptic();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', displayName: '' },
  });

  const handleSubmit = async (data: SignUpFormData) => {
    const { error } = await onSignUp(data.email, data.password, data.displayName);
    if (error) {
      if (isMobile) hapticError();
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      if (isMobile) success();
      toast.success("Account created! You can now sign in.");
      form.reset();
      onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <SocialAuthButtons
        onProviderClick={onOAuthSignIn}
        loadingProvider={oauthLoading}
        disabled={form.formState.isSubmitting}
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
          <Label htmlFor="signup-name">Display Name</Label>
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="bg-background min-h-[44px] md:min-h-[40px]"
            {...form.register('displayName')}
          />
          {form.formState.errors.displayName && (
            <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="bg-background min-h-[44px] md:min-h-[40px]"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <PasswordInput
          id="signup-password"
          register={form.register('password')}
          error={form.formState.errors.password?.message}
        />

        <PasswordStrengthIndicator
          password={form.watch('password') || ''}
          showRequirements={true}
        />

        <Button
          type="submit"
          className="w-full min-h-[44px] md:min-h-[40px] touch-manipulation"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-primary hover:underline touch-manipulation"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}
