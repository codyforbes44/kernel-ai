import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { SEO } from '@/components/seo/SEO';

export default function Onboarding() {
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Redirect to auth if not logged in
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Redirect to home if already completed onboarding
    if (profile?.onboarding_completed) {
      navigate('/', { replace: true });
      return;
    }

    setChecking(false);
  }, [user, profile, authLoading, navigate]);

  const handleComplete = async (data: { displayName: string; theme: 'dark' | 'light' }) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update profile with display name, theme, and mark onboarding as complete
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.displayName,
          preferences: {
            theme: data.theme,
            keyboard_sounds: false,
            reduced_motion: false,
          },
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Apply theme immediately
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(data.theme);
      localStorage.setItem('theme', data.theme);

      // Refresh the profile in auth context
      await updateProfile({ 
        display_name: data.displayName,
        preferences: {
          theme: data.theme,
          keyboard_sounds: false,
          reduced_motion: false,
        },
        onboarding_completed: true,
      });

      toast.success('Welcome aboard! 🎉');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Welcome | Kernel"
        description="Set up your Kernel profile and get started building with AI"
      />
      <OnboardingWizard
        initialDisplayName={profile?.display_name || user?.email?.split('@')[0] || ''}
        onComplete={handleComplete}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
