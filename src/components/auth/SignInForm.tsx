import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/useHaptic";
import { useIsMobile } from "@/hooks/use-mobile";
import { signInSchema, type SignInFormData } from "@/lib/validations";
import { SocialAuthButtons, type OAuthProvider } from "./SocialAuthButtons";
import { PasswordInput } from "./PasswordInput";

interface SignInFormProps {
  onSignIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
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

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const handleSubmit = async (data: SignInFormData) => {
    const { error } = await onSignIn(data.email, data.password, data.rememberMe);
    if (error) {
      if (isMobile) hapticError();
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message);
      }
    } else {
      if (isMobile) success();
      toast.success("Welcome back!");
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
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
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
          id="signin-password"
          register={form.register('password')}
          error={form.formState.errors.password?.message}
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={form.watch('rememberMe')}
            onCheckedChange={(checked) => form.setValue('rememberMe', checked === true)}
          />
          <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
            Remember me
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full min-h-[44px] md:min-h-[40px] touch-manipulation"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
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
