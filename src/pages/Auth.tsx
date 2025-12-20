import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SEO } from "@/components/seo/SEO";
import { PAGE_SEO } from "@/lib/seo";
import {
  AuthCard,
  SignInForm,
  SignUpForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  type OAuthProvider,
} from "@/components/auth";

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

const Auth = () => {
  const { user, loading, signIn, signUp, signInWithOAuth, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

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

  const getCardTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'Set New Password';
    }
  };

  const getCardDescription = () => {
    switch (mode) {
      case 'signin': return 'Sign in to continue';
      case 'signup': return 'Sign up to get started';
      case 'forgot': return "We'll send you a reset link";
      case 'reset': return 'Choose a new secure password';
    }
  };

  // Check for password reset token or signup tab in URL
  useEffect(() => {
    const type = searchParams.get('type');
    const tab = searchParams.get('tab');
    if (type === 'recovery') {
      setMode('reset');
    } else if (tab === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user && mode !== 'reset') {
      navigate("/dashboard");
    }
  }, [user, loading, navigate, mode]);

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    setOauthLoading(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      const displayNames: Record<string, string> = {
        linkedin_oidc: 'LinkedIn',
        azure: 'Microsoft',
      };
      const displayName = displayNames[provider] || provider;
      toast.error(`Failed to sign in with ${displayName}: ${error.message}`);
      setOauthLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={getSEOTitle()}
        description={getSEODescription()}
        ogImage={PAGE_SEO.auth.ogImage}
      />
      <AuthCard title={getCardTitle()} description={getCardDescription()}>
        {mode === 'signin' && (
          <SignInForm
            onSignIn={signIn}
            onOAuthSignIn={handleOAuthSignIn}
            oauthLoading={oauthLoading}
            onForgotPassword={() => setMode('forgot')}
            onSwitchToSignUp={() => setMode('signup')}
          />
        )}

        {mode === 'signup' && (
          <SignUpForm
            onSignUp={signUp}
            onOAuthSignIn={handleOAuthSignIn}
            oauthLoading={oauthLoading}
            onSwitchToSignIn={() => setMode('signin')}
            onSuccess={() => setMode('signin')}
          />
        )}

        {mode === 'forgot' && (
          <ForgotPasswordForm
            onResetPassword={resetPassword}
            onBack={() => setMode('signin')}
          />
        )}

        {mode === 'reset' && (
          <ResetPasswordForm onComplete={() => setMode('signin')} />
        )}
      </AuthCard>
    </>
  );
};

export default Auth;
