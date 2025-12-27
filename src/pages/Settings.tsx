import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/seo/SEO';
import { AppLayout } from '@/components/layout/AppLayout';
import { PAGE_SEO } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

// Settings tab components
import { SettingsTabs, SettingsTabContent } from '@/components/settings/SettingsTabs';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { AISettings } from '@/components/settings/AISettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { AdvancedSettings } from '@/components/settings/AdvancedSettings';

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { checkSubscription } = useSubscription();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Handle checkout success state
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Welcome to Pro! Your subscription is now active.');
      checkSubscription();
    }
    const creditsPurchased = searchParams.get('credits_purchased');
    if (creditsPurchased) {
      toast.success(`Successfully purchased ${parseInt(creditsPurchased).toLocaleString()} credits!`);
      window.history.replaceState({}, '', '/settings');
    }
    if (searchParams.get('credits_cancelled') === 'true') {
      toast.info('Credit purchase was cancelled.');
      window.history.replaceState({}, '', '/settings');
    }
  }, [searchParams, checkSubscription]);

  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <AppLayout>
      <SEO
        title={PAGE_SEO.settings.title}
        description={PAGE_SEO.settings.description}
        noIndex={PAGE_SEO.settings.noIndex}
      />
      <PageHeader
        title="Settings"
        backLabel="Chat"
        actions={
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        }
      />

      <main className="container max-w-full md:max-w-4xl mx-auto py-6 md:py-8 px-3 md:px-4">
        <SettingsTabs defaultTab="account">
          <SettingsTabContent value="account">
            <AccountSettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="subscription">
            <SubscriptionSettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="security">
            <SecuritySettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="ai">
            <AISettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="appearance">
            <AppearanceSettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="advanced">
            <AdvancedSettings />
          </SettingsTabContent>
        </SettingsTabs>
      </main>
    </AppLayout>
  );
}
