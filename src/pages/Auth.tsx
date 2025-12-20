import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Terminal, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  signInSchema, 
  signUpSchema, 
  resetPasswordSchema, 
  newPasswordSchema,
  type SignInFormData, 
  type SignUpFormData,
  type ResetPasswordFormData,
  type NewPasswordFormData,
} from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo/SEO";
import { PAGE_SEO } from "@/lib/seo";

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

const Auth = () => {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [passwordResetComplete, setPasswordResetComplete] = useState(false);

  // Get dynamic SEO based on mode
  const getSEOTitle = () => {
    switch (mode) {
      case 'signin': return PAGE_SEO.auth.signIn.title;
      case 'signup': return PAGE_SEO.auth.signUp.title;
      case 'forgot': return PAGE_SEO.auth.forgotPassword.title;
      case 'reset': return 'Set New Password';
      default: return PAGE_SEO.auth.signIn.title;
    }
  };

  const getSEODescription = () => {
    switch (mode) {
      case 'signin': return PAGE_SEO.auth.signIn.description;
      case 'signup': return PAGE_SEO.auth.signUp.description;
      case 'forgot': return PAGE_SEO.auth.forgotPassword.description;
      case 'reset': return 'Set a new secure password for your AI Mate Companion account.';
      default: return PAGE_SEO.auth.signIn.description;
    }
  };

  // Check for password reset token in URL
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setMode('reset');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user && mode !== 'reset') {
      navigate("/");
    }
  }, [user, loading, navigate, mode]);

  // Sign In Form
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  // Sign Up Form
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', displayName: '' },
  });

  // Forgot Password Form
  const forgotForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  });

  // New Password Form (after clicking reset link)
  const newPasswordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleSignIn = async (data: SignInFormData) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Welcome back!");
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    const { error } = await signUp(data.email, data.password, data.displayName);
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created! You can now sign in.");
      setMode('signin');
      signUpForm.reset();
    }
  };

  const handleForgotPassword = async (data: ResetPasswordFormData) => {
    const { error } = await resetPassword(data.email);
    if (error) {
      toast.error(error.message);
    } else {
      setResetEmailSent(true);
    }
  };

  const handleNewPassword = async (data: NewPasswordFormData) => {
    // This still needs direct supabase call since it's updating the current session
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setPasswordResetComplete(true);
      toast.success("Password updated successfully!");
      // Sign out and redirect to sign in
      await supabase.auth.signOut();
      setTimeout(() => {
        setMode('signin');
        setPasswordResetComplete(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderPasswordInput = (
    id: string,
    name: string,
    register: UseFormRegisterReturn,
    error?: string,
    placeholder = "••••••••"
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{name === 'confirmPassword' ? 'Confirm Password' : 'Password'}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="bg-background pr-10"
          {...register}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <SEO
        title={getSEOTitle()}
        description={getSEODescription()}
        ogImage={PAGE_SEO.auth.ogImage}
      />
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Lovable Expert Assistant</h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            Your personal AI companion for Lovable
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">
              {mode === 'signin' && "Welcome"}
              {mode === 'signup' && "Create Account"}
              {mode === 'forgot' && "Reset Password"}
              {mode === 'reset' && "Set New Password"}
            </CardTitle>
            <CardDescription>
              {mode === 'signin' && "Sign in to continue"}
              {mode === 'signup' && "Sign up to get started"}
              {mode === 'forgot' && "We'll send you a reset link"}
              {mode === 'reset' && "Choose a new secure password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Sign In Form */}
            {mode === 'signin' && (
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-background"
                    {...signInForm.register('email')}
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>
                {renderPasswordInput(
                  'signin-password',
                  'password',
                  signInForm.register('password'),
                  signInForm.formState.errors.password?.message
                )}
                <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>
                  {signInForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            )}

            {/* Sign Up Form */}
            {mode === 'signup' && (
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your name"
                    className="bg-background"
                    {...signUpForm.register('displayName')}
                  />
                  {signUpForm.formState.errors.displayName && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.displayName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-background"
                    {...signUpForm.register('email')}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>
                {renderPasswordInput(
                  'signup-password',
                  'password',
                  signUpForm.register('password'),
                  signUpForm.formState.errors.password?.message
                )}
                <div className="text-xs text-muted-foreground">
                  Password must be 8+ characters with uppercase, lowercase, and a number
                </div>
                <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
                  {signUpForm.formState.isSubmitting ? "Creating account..." : "Sign Up"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && !resetEmailSent && (
              <form onSubmit={forgotForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-background"
                    {...forgotForm.register('email')}
                  />
                  {forgotForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{forgotForm.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={forgotForm.formState.isSubmitting}>
                  {forgotForm.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-full justify-center"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </button>
              </form>
            )}

            {/* Email Sent Confirmation */}
            {mode === 'forgot' && resetEmailSent && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Check your email</p>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to your email address.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMode('signin');
                    setResetEmailSent(false);
                    forgotForm.reset();
                  }}
                >
                  Back to sign in
                </Button>
              </div>
            )}

            {/* New Password Form (after clicking reset link) */}
            {mode === 'reset' && !passwordResetComplete && (
              <form onSubmit={newPasswordForm.handleSubmit(handleNewPassword)} className="space-y-4">
                {renderPasswordInput(
                  'new-password',
                  'password',
                  newPasswordForm.register('password'),
                  newPasswordForm.formState.errors.password?.message
                )}
                {renderPasswordInput(
                  'confirm-password',
                  'confirmPassword',
                  newPasswordForm.register('confirmPassword'),
                  newPasswordForm.formState.errors.confirmPassword?.message
                )}
                <div className="text-xs text-muted-foreground">
                  Password must be 8+ characters with uppercase, lowercase, and a number
                </div>
                <Button type="submit" className="w-full" disabled={newPasswordForm.formState.isSubmitting}>
                  {newPasswordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}

            {/* Password Reset Complete */}
            {mode === 'reset' && passwordResetComplete && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Password updated!</p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting you to sign in...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Built for Lovable power users who ship fast
        </p>
      </div>
    </div>
  );
};

export default Auth;
