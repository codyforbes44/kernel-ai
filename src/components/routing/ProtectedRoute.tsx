import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingFallback } from './LoadingFallback';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  /** Show loading spinner while checking auth */
  showLoading?: boolean;
}

/**
 * A wrapper component that protects routes requiring authentication.
 * Redirects to the specified path (default: /auth) if not authenticated.
 * 
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <AdminPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = '/auth',
  showLoading = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while auth is being checked
  if (loading) {
    return showLoading ? <LoadingFallback /> : null;
  }

  // Redirect to auth if not authenticated
  if (!user) {
    // Preserve the intended destination for redirect after login
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
