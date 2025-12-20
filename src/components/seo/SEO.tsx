import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, getOgImageUrl } from '@/lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
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
}

export function SEO({
  title,
  description = SEO_CONFIG.defaultDescription,
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
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}` 
    : SEO_CONFIG.defaultTitle;
  
  const siteUrl = SEO_CONFIG.siteUrl;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : siteUrl);
  
  const ogImageData = getOgImageUrl(ogImage, siteUrl);
  const imageAlt = ogImageAlt || ogImageData.alt || fullTitle;
  
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1',
  ].join(', ');

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
      <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />
      <meta name="twitter:creator" content={SEO_CONFIG.twitterHandle} />
      
      {/* Additional SEO enhancements */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="hsl(240 10% 3.9%)" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(structuredData) ? structuredData : [structuredData])}
        </script>
      )}
    </Helmet>
  );
}
