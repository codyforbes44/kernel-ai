import { useProtectedPage } from '@/hooks/useProtectedPage';
import { IDELayout } from '@/components/layout/IDELayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';

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
      <IDELayout />
      <WelcomeTour />
    </>
  );
};

export default Index;
