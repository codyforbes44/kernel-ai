import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface UseProtectedPageOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useProtectedPage(options: UseProtectedPageOptions = {}) {
  const { redirectTo = '/auth', requireAuth = true } = options;
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo, requireAuth]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
