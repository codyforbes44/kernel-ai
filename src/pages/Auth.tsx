import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength";
import { Separator } from "@/components/ui/separator";
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

// Social auth icons
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const Auth = () => {
  const { user, loading, signIn, signUp, signInWithOAuth, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
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

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      toast.error(`Failed to sign in with ${provider}: ${error.message}`);
      setOauthLoading(null);
    }
    // Note: OAuth redirects away, so we don't need to reset loading on success
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
              <div className="space-y-4">
                {/* Social Auth Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={oauthLoading !== null}
                  >
                    {oauthLoading === 'google' ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span className="ml-2">Google</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('github')}
                    disabled={oauthLoading !== null}
                  >
                    {oauthLoading === 'github' ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <GitHubIcon />
                    )}
                    <span className="ml-2">GitHub</span>
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

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
              </div>
            )}

            {/* Sign Up Form */}
            {mode === 'signup' && (
              <div className="space-y-4">
                {/* Social Auth Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={oauthLoading !== null}
                  >
                    {oauthLoading === 'google' ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span className="ml-2">Google</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('github')}
                    disabled={oauthLoading !== null}
                  >
                    {oauthLoading === 'github' ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <GitHubIcon />
                    )}
                    <span className="ml-2">GitHub</span>
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

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
                  <PasswordStrengthIndicator 
                    password={signUpForm.watch('password') || ''} 
                    showRequirements={true}
                  />
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
              </div>
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
                <PasswordStrengthIndicator 
                  password={newPasswordForm.watch('password') || ''} 
                  showRequirements={true}
                />
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
