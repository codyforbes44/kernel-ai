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
  /** Robots directive: 'allow' | 'disallow' | 'noindex' */
  robots?: 'allow' | 'disallow' | 'noindex';
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
    robots: 'allow',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'View pricing plans and features',
    changefreq: 'monthly',
    priority: 0.9,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Get in touch with our team',
    changefreq: 'monthly',
    priority: 0.8,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/about',
    title: 'About',
    description: 'Learn about our mission, team, and company story',
    changefreq: 'monthly',
    priority: 0.8,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/auth',
    title: 'Sign In',
    description: 'Sign in or create an account',
    changefreq: 'monthly',
    priority: 0.8,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/builder',
    title: 'Builder',
    description: 'Visual application builder',
    changefreq: 'weekly',
    priority: 0.9,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description: 'Our privacy policy and data handling practices',
    changefreq: 'monthly',
    priority: 0.5,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/terms',
    title: 'Terms of Service',
    description: 'Terms and conditions for using our service',
    changefreq: 'monthly',
    priority: 0.5,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/changelog',
    title: 'Changelog',
    description: 'Track our latest features, improvements, and bug fixes',
    changefreq: 'weekly',
    priority: 0.7,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/docs',
    title: 'Documentation',
    description: 'Learn how to build with Kernel',
    changefreq: 'weekly',
    priority: 0.8,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/blog',
    title: 'Blog',
    description: 'Insights, tutorials, and updates from our team',
    changefreq: 'weekly',
    priority: 0.7,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/blog/:slug',
    title: 'Blog Post',
    description: 'Read our latest articles and insights',
    changefreq: 'weekly',
    priority: 0.6,
    includeInSitemap: false,
    requiresAuth: false,
    isDynamic: true,
    robots: 'allow',
  },
  {
    path: '/tutorials',
    title: 'Tutorials',
    description: 'Step-by-step guides to build with Kernel',
    changefreq: 'weekly',
    priority: 0.7,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/careers',
    title: 'Careers',
    description: 'Join the Kernel team',
    changefreq: 'monthly',
    priority: 0.6,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  {
    path: '/security',
    title: 'Security',
    description: 'Our security practices and compliance',
    changefreq: 'monthly',
    priority: 0.6,
    includeInSitemap: true,
    requiresAuth: false,
    robots: 'allow',
  },
  // Protected routes - not included in sitemap, blocked from crawlers
  {
    path: '/dashboard',
    title: 'Dashboard',
    changefreq: 'daily',
    priority: 0.7,
    includeInSitemap: false,
    requiresAuth: true,
    robots: 'disallow',
  },
  {
    path: '/admin',
    title: 'Admin',
    changefreq: 'weekly',
    priority: 0.3,
    includeInSitemap: false,
    requiresAuth: true,
    robots: 'disallow',
  },
  {
    path: '/settings',
    title: 'Settings',
    changefreq: 'weekly',
    priority: 0.5,
    includeInSitemap: false,
    requiresAuth: true,
    robots: 'disallow',
  },
  {
    path: '/builder/',
    title: 'Project Builder',
    changefreq: 'daily',
    priority: 0.6,
    includeInSitemap: false,
    requiresAuth: true,
    isDynamic: true,
    robots: 'disallow',
  },
  {
    path: '/seo',
    title: 'SEO Dashboard',
    description: 'Monitor sitemap coverage and robots.txt rules',
    changefreq: 'weekly',
    priority: 0.3,
    includeInSitemap: false,
    requiresAuth: false,
    robots: 'disallow', // Internal tool, don't index
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

// Get disallowed routes for robots.txt
export const getDisallowedRoutes = () => 
  routes.filter(route => route.robots === 'disallow');
