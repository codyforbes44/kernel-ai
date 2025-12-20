// SEO Configuration
export const SEO_CONFIG = {
  siteName: 'AI Mate Companion',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://ai-mate.lovable.app',
  defaultTitle: 'AI Mate Companion',
  defaultDescription: 'Personal AI assistant for power users who have shipped 250+ products on Lovable. Chat with intelligent AI, build apps, and supercharge your workflow.',
  defaultOgImage: '/og-images/default.png',
  twitterHandle: '@Lovable',
};

// Per-page SEO configuration
export const PAGE_SEO = {
  home: {
    title: 'AI Chat Assistant',
    description: 'Chat with your personal AI companion. Get intelligent assistance for development, debugging, and building on Lovable.',
    ogImage: '/og-images/chat.png',
  },
  auth: {
    signIn: {
      title: 'Sign In',
      description: 'Sign in to AI Mate Companion - Your personal AI assistant for Lovable power users.',
    },
    signUp: {
      title: 'Create Account',
      description: 'Join AI Mate Companion and unlock the power of AI-assisted development.',
    },
    forgotPassword: {
      title: 'Reset Password',
      description: 'Reset your AI Mate Companion password and regain access to your account.',
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
    description: 'Manage your AI Mate Companion preferences, appearance, and account settings.',
    noIndex: true,
  },
  admin: {
    title: 'Admin Panel',
    description: 'Administrative dashboard for AI Mate Companion.',
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
    "name": "Lovable",
    "url": "https://lovable.dev"
  }
});

export const getSoftwareApplicationSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Mate App Builder",
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
    "name": "Lovable"
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
