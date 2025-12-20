import { useProtectedPage } from '@/hooks/useProtectedPage';
import { IDELayout } from '@/components/layout/IDELayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { SEO } from '@/components/seo/SEO';
import { TopNavBar } from '@/components/layout/TopNavBar';
import { PAGE_SEO, getWebsiteSchema, SEO_CONFIG, BREADCRUMBS } from '@/lib/seo';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { user, loading } = useProtectedPage();
  const isMobile = useIsMobile();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
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
      <div className="h-screen flex flex-col">
        {!isMobile && <TopNavBar />}
        <div className="flex-1 overflow-hidden">
          <IDELayout />
        </div>
      </div>
      <WelcomeTour />
    </>
  );
};

export default Index;
