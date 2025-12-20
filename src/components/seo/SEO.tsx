import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG } from '@/lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: object | object[];
}

export function SEO({
  title,
  description = SEO_CONFIG.defaultDescription,
  ogImage = SEO_CONFIG.defaultOgImage,
  ogType = 'website',
  canonical,
  noIndex = false,
  noFollow = false,
  structuredData,
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}` 
    : SEO_CONFIG.defaultTitle;
  
  const siteUrl = SEO_CONFIG.siteUrl;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(structuredData) ? structuredData : [structuredData])}
        </script>
      )}
    </Helmet>
  );
}
