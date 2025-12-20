import { useParams, Navigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/builder/BuilderLayout';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function BuilderProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!projectId) {
    return <Navigate to="/builder" replace />;
  }

  return <BuilderLayout projectId={projectId} />;
}
