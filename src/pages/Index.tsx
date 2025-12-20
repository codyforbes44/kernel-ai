import { useProtectedPage } from '@/hooks/useProtectedPage';
import { IDELayout } from '@/components/layout/IDELayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { SEO } from '@/components/seo/SEO';
import { PAGE_SEO, getWebsiteSchema, SEO_CONFIG } from '@/lib/seo';

const Index = () => {
  const { user, loading } = useProtectedPage();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <SEO
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        ogImage={PAGE_SEO.home.ogImage}
        structuredData={getWebsiteSchema(SEO_CONFIG.siteUrl)}
      />
      <IDELayout />
      <WelcomeTour />
    </>
  );
};

export default Index;
