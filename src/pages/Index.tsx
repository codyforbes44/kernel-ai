import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { IDELayout } from '@/components/layout/IDELayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { SEO } from '@/components/seo/SEO';
import { TopNavBar } from '@/components/layout/TopNavBar';
import { PAGE_SEO, getWebsiteSchema, SEO_CONFIG, BREADCRUMBS } from '@/lib/seo';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  // Auth is handled by ProtectedRoute wrapper - user is guaranteed to exist here
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!loading && user && profile && !profile.onboarding_completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  // Show loading while checking onboarding status
  if (loading || (profile && !profile.onboarding_completed)) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <SEO
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        ogImage={PAGE_SEO.home.ogImage}
        structuredData={[
          getWebsiteSchema(SEO_CONFIG.siteUrl),
          BREADCRUMBS.home(SEO_CONFIG.siteUrl)
        ]}
      />
      <div id="main-content" className="h-screen flex flex-col" tabIndex={-1}>
        {!isMobile && <TopNavBar />}
        <main className="flex-1 overflow-hidden">
          <IDELayout />
        </main>
      </div>
      <WelcomeTour />
    </>
  );
};

export default Index;
