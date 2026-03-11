import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, getOgImageUrl, getBreadcrumbSchema } from '@/lib/seo';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SpeakableConfig {
  cssSelectors: string[];
}

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'article' | 'product';
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: object | object[];
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  speakable?: SpeakableConfig;
}

/**
 * Enhanced SEO component with breadcrumbs, hreflang, speakable schema,
 * and comprehensive meta tags following Google E-E-A-T best practices.
 */
export function SEOHead({
  title,
  description,
  ogImage = SEO_CONFIG.defaultOgImage,
  ogImageAlt,
  ogType = 'website',
  canonical,
  noIndex = false,
  noFollow = false,
  structuredData,
  keywords,
  author = 'Kernel',
  publishedTime,
  modifiedTime,
  breadcrumbs,
  speakable,
}: SEOHeadProps) {
  const fullTitle = title.includes('Kernel') ? title : `${title} | Kernel`;
  const siteUrl = SEO_CONFIG.siteUrl;
  const canonicalUrl = canonical
    ? (canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`)
    : (typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : siteUrl);

  const ogImageData = getOgImageUrl(ogImage, siteUrl);
  const imageAlt = ogImageAlt || fullTitle;

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1',
  ].join(', ');

  // Build all structured data
  const allStructuredData: object[] = [];

  if (structuredData) {
    if (Array.isArray(structuredData)) {
      allStructuredData.push(...structuredData);
    } else {
      allStructuredData.push(structuredData);
    }
  }

  // Add breadcrumb schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    allStructuredData.push(getBreadcrumbSchema(breadcrumbs));
  }

  // Add speakable schema
  if (speakable) {
    allStructuredData.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": fullTitle,
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": speakable.cssSelectors,
      },
      "url": canonicalUrl,
    });
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <meta name="author" content={author} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* Language */}
      <html lang="en" />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageData.url} />
      <meta property="og:image:width" content={String(ogImageData.width)} />
      <meta property="og:image:height" content={String(ogImageData.height)} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={SEO_CONFIG.locale} />

      {/* Article specific */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageData.url} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:site" content="@kernel_cool" />
      <meta name="twitter:creator" content="@kernel_cool" />

      {/* Additional SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="hsl(240 10% 3.9%)" />

      {/* Structured Data */}
      {allStructuredData.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(allStructuredData.length === 1 ? allStructuredData[0] : allStructuredData)}
        </script>
      )}
    </Helmet>
  );
}
