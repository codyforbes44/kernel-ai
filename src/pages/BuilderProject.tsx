import { useParams, Navigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/builder/BuilderLayout';
import { useAuth } from '@/hooks/useAuth';

export default function BuilderProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!projectId) {
    return <Navigate to="/builder" replace />;
  }

  return <BuilderLayout projectId={projectId} />;
}
