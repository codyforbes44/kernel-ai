/**
 * Sitemap Generator Script
 * 
 * This script generates a sitemap.xml file from the routes configuration.
 * Run with: npx tsx scripts/generate-sitemap.ts
 * 
 * It's also integrated into the Vite build process via a plugin.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Route configuration (duplicated for script independence)
interface RouteConfig {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  includeInSitemap: boolean;
  isDynamic?: boolean;
}

const routes: RouteConfig[] = [
  { path: '/', changefreq: 'daily', priority: 1.0, includeInSitemap: true },
  { path: '/pricing', changefreq: 'monthly', priority: 0.9, includeInSitemap: true },
  { path: '/contact', changefreq: 'monthly', priority: 0.8, includeInSitemap: true },
  { path: '/auth', changefreq: 'monthly', priority: 0.8, includeInSitemap: true },
  { path: '/builder', changefreq: 'weekly', priority: 0.9, includeInSitemap: true },
  { path: '/privacy', changefreq: 'monthly', priority: 0.5, includeInSitemap: true },
  { path: '/terms', changefreq: 'monthly', priority: 0.5, includeInSitemap: true },
  { path: '/dashboard', changefreq: 'daily', priority: 0.7, includeInSitemap: false },
  { path: '/admin', changefreq: 'weekly', priority: 0.3, includeInSitemap: false },
  { path: '/settings', changefreq: 'weekly', priority: 0.5, includeInSitemap: false },
  { path: '/builder/:projectId', changefreq: 'daily', priority: 0.6, includeInSitemap: false, isDynamic: true },
];

const SITE_URL = 'https://kernel.cool';

function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0];
  
  const sitemapRoutes = routes.filter(route => route.includeInSitemap && !route.isDynamic);
  
  const urls = sitemapRoutes.map(route => `  <url>
    <loc>${SITE_URL}${route.path === '/' ? '' : route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// Generate and write sitemap
const sitemap = generateSitemap();
const outputPath = resolve(process.cwd(), 'public/sitemap.xml');

writeFileSync(outputPath, sitemap, 'utf-8');
console.log(`✅ Sitemap generated at ${outputPath}`);
console.log(`   ${routes.filter(r => r.includeInSitemap && !r.isDynamic).length} URLs included`);
