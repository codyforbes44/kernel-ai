// SEO Configuration
export const SEO_CONFIG = {
  siteName: 'Kernel',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://kernel.app',
  defaultTitle: 'Kernel',
  defaultDescription: 'AI-powered development platform. Build beautiful web applications with intelligent chat, visual builder, design systems, and instant deployment.',
  defaultOgImage: '/og-images/default.png',
  twitterHandle: '@KernelDev',
};

// Per-page SEO configuration
export const PAGE_SEO = {
  home: {
    title: 'AI Chat Assistant',
    description: 'Chat with your AI development companion. Get intelligent assistance for development, debugging, and building apps.',
    ogImage: '/og-images/chat.png',
  },
  auth: {
    signIn: {
      title: 'Sign In',
      description: 'Sign in to Kernel - Your AI-powered development companion.',
    },
    signUp: {
      title: 'Create Account',
      description: 'Join Kernel and unlock the power of AI-assisted development.',
    },
    forgotPassword: {
      title: 'Reset Password',
      description: 'Reset your Kernel password and regain access to your account.',
    },
    ogImage: '/og-images/auth.png',
  },
  builder: {
    title: 'App Builder',
    description: 'Build web applications with a visual editor, live preview, and AI-powered code generation. No coding experience required.',
    ogImage: '/og-images/builder.png',
  },
  builderProject: {
    titleTemplate: (projectName: string) => `Editing ${projectName} | App Builder`,
    descriptionTemplate: (projectName: string, template?: string) => 
      `Building ${projectName}${template ? ` using ${template} template` : ''} with AI-powered code generation and live preview.`,
    ogImage: '/og-images/builder.png',
  },
  settings: {
    title: 'Settings',
    description: 'Manage your Kernel preferences, appearance, and account settings.',
    noIndex: true,
  },
  admin: {
    title: 'Admin Panel',
    description: 'Administrative dashboard for Kernel.',
    noIndex: true,
    noFollow: true,
  },
  notFound: {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist or has been moved.',
    ogImage: '/og-images/default.png',
    noIndex: true,
  },
} as const;

// Structured Data Schemas
export const getWebsiteSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SEO_CONFIG.siteName,
  "url": siteUrl,
  "description": SEO_CONFIG.defaultDescription,
  "publisher": {
    "@type": "Organization",
    "name": "Kernel",
    "url": siteUrl
  }
});

export const getSoftwareApplicationSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Kernel App Builder",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "url": `${siteUrl}/builder`,
  "description": PAGE_SEO.builder.description,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Kernel"
  }
});

export const getWebPageSchema = (title: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": url,
  "isPartOf": {
    "@type": "WebSite",
    "name": SEO_CONFIG.siteName
  }
});

// Breadcrumb Schema Types
interface BreadcrumbItem {
  name: string;
  url: string;
}

// Breadcrumb Structured Data
export const getBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Pre-built breadcrumb configurations
export const BREADCRUMBS = {
  home: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl }
  ]),
  auth: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Sign In', url: `${siteUrl}/auth` }
  ]),
  builder: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'App Builder', url: `${siteUrl}/builder` }
  ]),
  builderProject: (siteUrl: string, projectName: string, projectId: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'App Builder', url: `${siteUrl}/builder` },
    { name: projectName, url: `${siteUrl}/builder/${projectId}` }
  ]),
  settings: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Settings', url: `${siteUrl}/settings` }
  ]),
  admin: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Admin Panel', url: `${siteUrl}/admin` }
  ]),
};
