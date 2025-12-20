/**
 * Sitemap Generator Utility
 * 
 * Generates sitemap XML from the routes configuration.
 * Used by the Vite build plugin to auto-generate sitemap.xml
 */

import { getSitemapRoutes } from './routes';

const SITE_URL = 'https://kernel.cool';

export function generateSitemapXml(): string {
  const today = new Date().toISOString().split('T')[0];
  const sitemapRoutes = getSitemapRoutes();
  
  const urls = sitemapRoutes.map(route => {
    const loc = route.path === '/' ? SITE_URL : `${SITE_URL}${route.path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/**
 * Get the sitemap URL for robots.txt
 */
export function getSitemapUrl(): string {
  return `${SITE_URL}/sitemap.xml`;
}
