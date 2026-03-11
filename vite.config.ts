import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// SEO files generation plugin (sitemap.xml + robots.txt)
function seoFilesPlugin(): Plugin {
  const SITE_URL = 'https://kernel.cool';
  
  // Routes configuration - sync with src/lib/routes.ts
  const routes = [
    { path: '/', changefreq: 'daily', priority: 1.0, includeInSitemap: true, robots: 'allow' },
    { path: '/pricing', changefreq: 'monthly', priority: 0.9, includeInSitemap: true, robots: 'allow' },
    { path: '/contact', changefreq: 'monthly', priority: 0.8, includeInSitemap: true, robots: 'allow' },
    { path: '/about', changefreq: 'monthly', priority: 0.8, includeInSitemap: true, robots: 'allow' },
    { path: '/how-it-works', changefreq: 'monthly', priority: 0.9, includeInSitemap: true, robots: 'allow' },
    { path: '/auth', changefreq: 'monthly', priority: 0.8, includeInSitemap: true, robots: 'allow' },
    { path: '/builder', changefreq: 'weekly', priority: 0.9, includeInSitemap: true, robots: 'allow' },
    { path: '/privacy', changefreq: 'monthly', priority: 0.5, includeInSitemap: true, robots: 'allow' },
    { path: '/terms', changefreq: 'monthly', priority: 0.5, includeInSitemap: true, robots: 'allow' },
    { path: '/docs', changefreq: 'weekly', priority: 0.8, includeInSitemap: true, robots: 'allow' },
    { path: '/tutorials', changefreq: 'weekly', priority: 0.7, includeInSitemap: true, robots: 'allow' },
    { path: '/changelog', changefreq: 'weekly', priority: 0.7, includeInSitemap: true, robots: 'allow' },
    { path: '/security', changefreq: 'monthly', priority: 0.6, includeInSitemap: true, robots: 'allow' },
    { path: '/compare', changefreq: 'monthly', priority: 0.8, includeInSitemap: true, robots: 'allow' },
    { path: '/migrate', changefreq: 'monthly', priority: 0.8, includeInSitemap: true, robots: 'allow' },
    { path: '/install', changefreq: 'monthly', priority: 0.6, includeInSitemap: true, robots: 'allow' },
    { path: '/request-invite', changefreq: 'monthly', priority: 0.7, includeInSitemap: true, robots: 'allow' },
    { path: '/redeem-invite', changefreq: 'monthly', priority: 0.7, includeInSitemap: true, robots: 'allow' },
    // Protected routes
    { path: '/assistant', includeInSitemap: false, robots: 'disallow' },
    { path: '/dashboard', includeInSitemap: false, robots: 'disallow' }, // Legacy redirect
    { path: '/admin', includeInSitemap: false, robots: 'disallow' },
    { path: '/settings', includeInSitemap: false, robots: 'disallow' },
    { path: '/builder/', includeInSitemap: false, robots: 'disallow' }, // Dynamic project routes
  ];

  function generateSitemap(): string {
    const today = new Date().toISOString().split('T')[0];
    const sitemapRoutes = routes.filter(r => r.includeInSitemap);
    
    const urls = sitemapRoutes.map(route => {
      const loc = route.path === '/' ? SITE_URL : `${SITE_URL}${route.path}`;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority?.toFixed(1)}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  }

  function generateRobotsTxt(): string {
    const disallowedRoutes = routes.filter(r => r.robots === 'disallow');
    const disallowLines = disallowedRoutes.map(r => `Disallow: ${r.path}`).join('\n');
    
    return `# Robots.txt for ${SITE_URL}
# Auto-generated from routes configuration

User-agent: *
Allow: /

# Protected/authenticated routes
${disallowLines}

# API and internal paths
Disallow: /api/
Disallow: /_/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
`;
  }

  return {
    name: 'seo-files-generator',
    buildStart() {
      // Generate sitemap.xml
      const sitemap = generateSitemap();
      const sitemapPath = path.resolve(__dirname, 'public/sitemap.xml');
      fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
      
      // Generate robots.txt
      const robotsTxt = generateRobotsTxt();
      const robotsPath = path.resolve(__dirname, 'public/robots.txt');
      fs.writeFileSync(robotsPath, robotsTxt, 'utf-8');
      
      const sitemapCount = routes.filter(r => r.includeInSitemap).length;
      const disallowCount = routes.filter(r => r.robots === 'disallow').length;
      console.log(`✅ SEO files generated: sitemap.xml (${sitemapCount} URLs), robots.txt (${disallowCount} disallowed)`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && seoFilesPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon.ico", "robots.txt", "apple-touch-icon.svg", "offline.html"],
      manifest: {
        name: "Kernel",
        short_name: "Kernel",
        description: "AI-powered development platform",
        theme_color: "#0a0a0f",
        background_color: "#0a0a0f",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/pwa-512x512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "/pwa-512x512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/auth/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "app-shell",
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
