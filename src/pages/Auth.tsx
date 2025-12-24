import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTeamAccess } from "@/hooks/useTeamAccess";
import { toast } from "sonner";
import { SEO } from "@/components/seo/SEO";
import { PAGE_SEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import {
  AuthCard,
  SignInForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  PasscodeEntry,
  type OAuthProvider,
} from "@/components/auth";

type AuthMode = 'signin' | 'forgot' | 'reset' | 'team';

const Auth = () => {
  const { user, profile, loading, signIn, signInWithOAuth, resetPassword } = useAuth();
  const { isTeamMember } = useTeamAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  // Get dynamic SEO based on mode
  const getSEOTitle = () => {
    switch (mode) {
      case 'signin': return PAGE_SEO.auth.signIn.title;
      case 'forgot': return PAGE_SEO.auth.forgotPassword.title;
      case 'reset': return 'Set New Password';
      case 'team': return 'Team Access';
      default: return PAGE_SEO.auth.signIn.title;
    }
  };

  const getSEODescription = () => {
    switch (mode) {
      case 'signin': return PAGE_SEO.auth.signIn.description;
      case 'forgot': return PAGE_SEO.auth.forgotPassword.description;
      case 'reset': return 'Set a new secure password for your Kernel account.';
      case 'team': return 'Enter the team passcode to access Kernel.';
      default: return PAGE_SEO.auth.signIn.description;
    }
  };

  const getCardTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'Set New Password';
      case 'team': return 'Team Access';
    }
  };

  const getCardDescription = () => {
    switch (mode) {
      case 'signin': return 'Sign in to continue';
      case 'forgot': return "We'll send you a reset link";
      case 'reset': return 'Choose a new secure password';
      case 'team': return 'Enter the team passcode';
    }
  };

  // Check for password reset token in URL (signup disabled)
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setMode('reset');
    }
    // Note: signup is temporarily disabled
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already authenticated (either user or team member)
    if (!loading && (user || isTeamMember) && mode !== 'reset') {
      if (isTeamMember) {
        navigate("/");
      } else if (profile && !profile.onboarding_completed) {
        navigate("/onboarding");
      } else if (profile) {
        navigate("/assistant");
      }
    }
  }, [user, profile, loading, navigate, mode, isTeamMember]);

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
          <>
            <SignInForm
              onSignIn={signIn}
              onOAuthSignIn={handleOAuthSignIn}
              oauthLoading={oauthLoading}
              onForgotPassword={() => setMode('forgot')}
            />
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMode('team')}
              >
                <Users className="mr-2 h-4 w-4" />
                Team Access
              </Button>
            </div>
          </>
        )}

        {mode === 'team' && (
          <PasscodeEntry onBack={() => setMode('signin')} />
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
