import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';
import { ProtectedRoute } from './ProtectedRoute';

// Core pages - keep static for fast initial load
import Landing from '@/pages/Landing';
import NotFound from '@/pages/NotFound';

// Route component mapping with lazy loading
const pageComponents = {
  Index: lazy(() => import('@/pages/Index')),
  Auth: lazy(() => import('@/pages/Auth')),
  Pricing: lazy(() => import('@/pages/Pricing')),
  Contact: lazy(() => import('@/pages/Contact')),
  About: lazy(() => import('@/pages/About')),
  Privacy: lazy(() => import('@/pages/Privacy')),
  Terms: lazy(() => import('@/pages/Terms')),
  Changelog: lazy(() => import('@/pages/Changelog')),
  Documentation: lazy(() => import('@/pages/Documentation')),
  Tutorials: lazy(() => import('@/pages/Tutorials')),
  TutorialDetail: lazy(() => import('@/pages/TutorialDetail')),
  DocCategory: lazy(() => import('@/pages/DocCategory')),
  DocDetail: lazy(() => import('@/pages/DocDetail')),
  Security: lazy(() => import('@/pages/Security')),
  Compare: lazy(() => import('@/pages/Compare')),
  Install: lazy(() => import('@/pages/Install')),
  Migrate: lazy(() => import('@/pages/Migrate')),
  RequestInvite: lazy(() => import('@/pages/RequestInvite')),
  RedeemInvite: lazy(() => import('@/pages/RedeemInvite')),
  Admin: lazy(() => import('@/pages/Admin')),
  Settings: lazy(() => import('@/pages/Settings')),
  Builder: lazy(() => import('@/pages/Builder')),
  BuilderProject: lazy(() => import('@/pages/BuilderProject')),
  SEODashboard: lazy(() => import('@/pages/SEODashboard')),
  Onboarding: lazy(() => import('@/pages/Onboarding')),
  Performance: lazy(() => import('@/pages/Performance')),
  OGPreview: lazy(() => import('@/pages/OGPreview')),
  HowItWorks: lazy(() => import('@/pages/HowItWorks')),
} as const;

type PageComponentKey = keyof typeof pageComponents;

export interface AppRouteConfig {
  path: string;
  component: PageComponentKey | 'Landing' | 'NotFound';
  /** Wrap in ErrorBoundary for extra protection */
  withErrorBoundary?: boolean;
  /** Skip lazy loading (for core pages) */
  eager?: boolean;
  /** Whether route requires authentication */
  requiresAuth?: boolean;
}

// Route configuration with component mappings
const routeConfig: AppRouteConfig[] = [
  // Core routes (eager)
  { path: '/', component: 'Landing', eager: true },
  
  // Public routes
  { path: '/how-it-works', component: 'HowItWorks' },
  { path: '/pricing', component: 'Pricing' },
  { path: '/contact', component: 'Contact' },
  { path: '/about', component: 'About' },
  { path: '/privacy', component: 'Privacy' },
  { path: '/terms', component: 'Terms' },
  { path: '/changelog', component: 'Changelog' },
  { path: '/docs', component: 'Documentation' },
  { path: '/docs/:categorySlug', component: 'DocCategory' },
  { path: '/docs/:categorySlug/:slug', component: 'DocDetail' },
  { path: '/tutorials', component: 'Tutorials' },
  { path: '/tutorials/:slug', component: 'TutorialDetail' },
  { path: '/security', component: 'Security' },
  { path: '/compare', component: 'Compare' },
  { path: '/install', component: 'Install' },
  { path: '/migrate', component: 'Migrate' },
  { path: '/request-invite', component: 'RequestInvite' },
  { path: '/redeem-invite', component: 'RedeemInvite' },
  { path: '/auth', component: 'Auth' },
  
  // Protected routes (with extra error boundary protection)
  { path: '/assistant', component: 'Index', requiresAuth: true },
  { path: '/dashboard', component: 'Index', requiresAuth: true }, // Legacy redirect
  { path: '/onboarding', component: 'Onboarding', withErrorBoundary: true, requiresAuth: true },
  { path: '/admin', component: 'Admin', withErrorBoundary: true, requiresAuth: true },
  { path: '/settings', component: 'Settings', withErrorBoundary: true, requiresAuth: true },
  { path: '/builder', component: 'Builder', withErrorBoundary: true, requiresAuth: true },
  { path: '/builder/:projectId', component: 'BuilderProject', withErrorBoundary: true, requiresAuth: true },
  { path: '/seo', component: 'SEODashboard', withErrorBoundary: true },
  { path: '/performance', component: 'Performance', withErrorBoundary: true },
  { path: '/og-preview', component: 'OGPreview' },
];

function renderRoute(config: AppRouteConfig) {
  const { path, component, withErrorBoundary, eager, requiresAuth } = config;
  
  // Handle eager/static components
  if (eager || component === 'Landing') {
    return <Route key={path} path={path} element={<Landing />} />;
  }
  
  // Get the lazy component
  const LazyComponent = pageComponents[component as PageComponentKey];
  
  if (!LazyComponent) {
    console.warn(`Component not found for route: ${path}`);
    return null;
  }
  
  // Build the element with Suspense
  let element = (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent />
    </Suspense>
  );
  
  // Wrap with ProtectedRoute if authentication is required
  if (requiresAuth) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }
  
  // Wrap with ErrorBoundary if needed
  if (withErrorBoundary) {
    element = <ErrorBoundary>{element}</ErrorBoundary>;
  }
  
  return <Route key={path} path={path} element={element} />;
}

/**
 * Data-driven route renderer that generates Route elements from configuration.
 * Centralizes route definitions and applies consistent patterns (Suspense, ErrorBoundary, ProtectedRoute).
 */
export function RouteRenderer() {
  return (
    <Routes>
      {routeConfig.map(renderRoute)}
      {/* Catch-all 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export { routeConfig, pageComponents };
