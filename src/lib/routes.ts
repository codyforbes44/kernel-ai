// Route configuration for sitemap generation and navigation
export interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  /** Whether to include in sitemap (public routes only) */
  includeInSitemap: boolean;
  /** Whether route requires authentication */
  requiresAuth: boolean;
  /** Whether route is dynamic (has params) */
  isDynamic?: boolean;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    title: 'Home',
    description: 'AI-powered development platform for building web applications',
    changefreq: 'daily',
    priority: 1.0,
    includeInSitemap: true,
    requiresAuth: false,
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'View pricing plans and features',
    changefreq: 'monthly',
    priority: 0.9,
    includeInSitemap: true,
    requiresAuth: false,
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Get in touch with our team',
    changefreq: 'monthly',
    priority: 0.8,
    includeInSitemap: true,
    requiresAuth: false,
  },
  {
    path: '/auth',
    title: 'Sign In',
    description: 'Sign in or create an account',
    changefreq: 'monthly',
    priority: 0.8,
    includeInSitemap: true,
    requiresAuth: false,
  },
  {
    path: '/builder',
    title: 'Builder',
    description: 'Visual application builder',
    changefreq: 'weekly',
    priority: 0.9,
    includeInSitemap: true,
    requiresAuth: false,
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description: 'Our privacy policy and data handling practices',
    changefreq: 'monthly',
    priority: 0.5,
    includeInSitemap: true,
    requiresAuth: false,
  },
  {
    path: '/terms',
    title: 'Terms of Service',
    description: 'Terms and conditions for using our service',
    changefreq: 'monthly',
    priority: 0.5,
    includeInSitemap: true,
    requiresAuth: false,
  },
  // Protected routes - not included in sitemap
  {
    path: '/dashboard',
    title: 'Dashboard',
    changefreq: 'daily',
    priority: 0.7,
    includeInSitemap: false,
    requiresAuth: true,
  },
  {
    path: '/admin',
    title: 'Admin',
    changefreq: 'weekly',
    priority: 0.3,
    includeInSitemap: false,
    requiresAuth: true,
  },
  {
    path: '/settings',
    title: 'Settings',
    changefreq: 'weekly',
    priority: 0.5,
    includeInSitemap: false,
    requiresAuth: true,
  },
  {
    path: '/builder/:projectId',
    title: 'Project Builder',
    changefreq: 'daily',
    priority: 0.6,
    includeInSitemap: false,
    requiresAuth: true,
    isDynamic: true,
  },
];

// Get routes for sitemap generation
export const getSitemapRoutes = () => 
  routes.filter(route => route.includeInSitemap && !route.isDynamic);

// Get public routes
export const getPublicRoutes = () => 
  routes.filter(route => !route.requiresAuth);

// Get protected routes
export const getProtectedRoutes = () => 
  routes.filter(route => route.requiresAuth);
