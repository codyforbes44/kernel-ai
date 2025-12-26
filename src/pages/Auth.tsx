import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTeamAccess } from "@/hooks/useTeamAccess";
import { usePreAuthSession } from "@/hooks/usePreAuthSession";
import { usePostSignupProjectCreation } from "@/hooks/usePostSignupProjectCreation";
import { toast } from "sonner";
import { SEO } from "@/components/seo/SEO";
import { PAGE_SEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import {
  AuthCard,
  SignInForm,
  SignUpForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  PasscodeEntry,
  type OAuthProvider,
} from "@/components/auth";

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset' | 'team';

const Auth = () => {
  const { user, profile, loading, signIn, signUp, signInWithOAuth, resetPassword } = useAuth();
  const { isTeamMember } = useTeamAccess();
  const { pendingProject, claimSession, clearSession } = usePreAuthSession();
  const { createProjectFromPending, isCreating } = usePostSignupProjectCreation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [projectCreationTriggered, setProjectCreationTriggered] = useState(false);

  // Get dynamic SEO based on mode
  const getSEOTitle = () => {
    switch (mode) {
      case 'signin': return PAGE_SEO.auth.signIn.title;
      case 'signup': return 'Create Account';
      case 'forgot': return PAGE_SEO.auth.forgotPassword.title;
      case 'reset': return 'Set New Password';
      case 'team': return 'Team Access';
      default: return PAGE_SEO.auth.signIn.title;
    }
  };

  const getSEODescription = () => {
    switch (mode) {
      case 'signin': return PAGE_SEO.auth.signIn.description;
      case 'signup': return 'Create your Kernel account to start building.';
      case 'forgot': return PAGE_SEO.auth.forgotPassword.description;
      case 'reset': return 'Set a new secure password for your Kernel account.';
      case 'team': return 'Enter the team passcode to access Kernel.';
      default: return PAGE_SEO.auth.signIn.description;
    }
  };

  const getCardTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome';
      case 'signup': return pendingProject ? 'Create Your Account' : 'Sign Up';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'Set New Password';
      case 'team': return 'Team Access';
    }
  };

  const getCardDescription = () => {
    switch (mode) {
      case 'signin': return 'Sign in to continue';
      case 'signup': return pendingProject 
        ? `We'll start building "${pendingProject.projectName}" right away` 
        : 'Create your account to get started';
      case 'forgot': return "We'll send you a reset link";
      case 'reset': return 'Choose a new secure password';
      case 'team': return 'Enter the team passcode';
    }
  };

  // Check for signup mode from URL params (voice agent flow)
  useEffect(() => {
    const type = searchParams.get('type');
    const flowMode = searchParams.get('mode');
    
    if (type === 'recovery') {
      setMode('reset');
    } else if (flowMode === 'signup' || pendingProject) {
      setMode('signup');
    }
  }, [searchParams, pendingProject]);

  // Handle post-authentication project creation
  useEffect(() => {
    const handlePostAuthProjectCreation = async () => {
      if (user && pendingProject && !projectCreationTriggered && !isCreating) {
        setProjectCreationTriggered(true);
        
        try {
          // Claim the pending session
          const claimed = await claimSession(user.id);
          
          if (claimed) {
            toast.info("Creating your project...", { duration: 2000 });
            
            // Create the actual project
            const createdProject = await createProjectFromPending(user.id, pendingProject);
            
            if (createdProject) {
              clearSession();
              toast.success(`"${pendingProject.projectName}" is being built!`);
              navigate(`/builder?project=${createdProject.id}`);
              return;
            }
          }
        } catch (error) {
          console.error('Failed to create project from pending session:', error);
          toast.error('Failed to create project. You can start fresh in the builder.');
        }
        
        // Fallback: navigate to builder anyway
        clearSession();
        navigate('/builder');
      }
    };

    handlePostAuthProjectCreation();
  }, [user, pendingProject, projectCreationTriggered, isCreating, claimSession, createProjectFromPending, clearSession, navigate]);

  // Standard redirect logic
  useEffect(() => {
    if (!loading && (user || isTeamMember) && mode !== 'reset' && !pendingProject) {
      if (isTeamMember) {
        navigate("/");
      } else if (profile && !profile.onboarding_completed) {
        navigate("/onboarding");
      } else if (profile) {
        navigate("/assistant");
      }
    }
  }, [user, profile, loading, navigate, mode, isTeamMember, pendingProject]);

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

  const handleSignUpSuccess = () => {
    // If there's a pending project, stay on the page to wait for auth completion
    // The useEffect will handle project creation
    if (!pendingProject) {
      setMode('signin');
    }
  };

  if (loading || (user && pendingProject && !projectCreationTriggered)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {pendingProject && (
          <p className="text-muted-foreground text-sm">
            Preparing your project...
          </p>
        )}
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
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setMode('signup')}
              >
                Don't have an account? Sign up
              </Button>
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

        {mode === 'signup' && (
          <SignUpForm
            onSignUp={signUp}
            onOAuthSignIn={handleOAuthSignIn}
            oauthLoading={oauthLoading}
            onSwitchToSignIn={() => setMode('signin')}
            onSuccess={handleSignUpSuccess}
          />
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