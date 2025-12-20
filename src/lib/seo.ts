// SEO Configuration
export const SEO_CONFIG = {
  siteName: 'Kernel',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://kernel.cool',
  defaultTitle: 'Kernel - AI Development Platform',
  defaultDescription: 'Build beautiful web applications with AI-powered assistance. Features intelligent chat, visual builder, design systems, and instant deployment.',
  defaultOgImage: '/og-images/default.png',
  twitterHandle: '@KernelDev',
  locale: 'en_US',
  ogImageDimensions: {
    width: 1200,
    height: 630,
  },
};

// Per-page SEO configuration
export const PAGE_SEO = {
  landing: {
    title: 'Build Apps with AI',
    description: 'Create beautiful web applications with AI-powered assistance. From idea to deployment in minutes with intelligent chat, visual builder, and instant deploy.',
    ogImage: '/og-images/landing.png',
    keywords: ['AI development', 'web builder', 'no-code', 'app builder', 'AI assistant', 'visual editor'] as string[],
  },
  home: {
    title: 'AI Chat Assistant',
    description: 'Chat with your AI development companion. Get intelligent assistance for coding, debugging, and building apps faster than ever.',
    ogImage: '/og-images/chat.png',
    keywords: ['AI chat', 'coding assistant', 'developer tools', 'AI programming'],
  },
  auth: {
    signIn: {
      title: 'Sign In',
      description: 'Sign in to Kernel - Your AI-powered development platform. Access your projects and continue building.',
    },
    signUp: {
      title: 'Create Account',
      description: 'Join Kernel and unlock the power of AI-assisted development. Start building beautiful apps for free.',
    },
    forgotPassword: {
      title: 'Reset Password',
      description: 'Reset your Kernel password and regain access to your projects and AI assistant.',
    },
    resetPassword: {
      title: 'Set New Password',
      description: 'Set a new secure password for your Kernel account.',
    },
    ogImage: '/og-images/auth.png',
  },
  builder: {
    title: 'App Builder',
    description: 'Build web applications with a visual editor, live preview, and AI-powered code generation. Create production-ready apps without the complexity.',
    ogImage: '/og-images/builder.png',
    keywords: ['visual builder', 'code editor', 'live preview', 'AI code generation'],
  },
  builderProject: {
    titleTemplate: (projectName: string) => `${projectName} | App Builder`,
    descriptionTemplate: (projectName: string, template?: string) => 
      `Building ${projectName}${template ? ` with ${template} template` : ''} using AI-powered code generation and live preview.`,
    ogImage: '/og-images/builder.png',
  },
  settings: {
    title: 'Settings',
    description: 'Manage your Kernel account, preferences, and workspace settings.',
    noIndex: true,
  },
  admin: {
    title: 'Admin Panel',
    description: 'Administrative dashboard for Kernel platform management.',
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

// Organization Schema
export const getOrganizationSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Kernel",
  "url": siteUrl,
  "logo": `${siteUrl}/pwa-512x512.png`,
  "description": SEO_CONFIG.defaultDescription,
  "sameAs": [
    "https://twitter.com/KernelDev",
    "https://github.com/kernel-dev"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": `${siteUrl}/support`
  }
});

// Website Schema
export const getWebsiteSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SEO_CONFIG.siteName,
  "url": siteUrl,
  "description": SEO_CONFIG.defaultDescription,
  "publisher": getOrganizationSchema(siteUrl),
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteUrl}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

// Software Application Schema
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
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Kernel",
    "url": siteUrl
  },
  "featureList": [
    "AI-powered code generation",
    "Visual drag-and-drop builder",
    "Real-time preview",
    "One-click deployment",
    "Design system management",
    "GitHub integration"
  ],
  "screenshot": `${siteUrl}/og-images/builder.png`
});

// Product Schema for landing page
export const getProductSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Kernel",
  "description": SEO_CONFIG.defaultDescription,
  "brand": {
    "@type": "Brand",
    "name": "Kernel"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2025-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  }
});

// Web Page Schema
export const getWebPageSchema = (title: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": url,
  "isPartOf": {
    "@type": "WebSite",
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.siteUrl
  },
  "inLanguage": "en-US"
});

// FAQ Schema Helper
interface FAQItem {
  question: string;
  answer: string;
}

export const getFAQSchema = (faqs: FAQItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Common FAQs
export const COMMON_FAQS = {
  general: [
    {
      question: "What is Kernel?",
      answer: "Kernel is an AI-powered development platform that helps you build beautiful web applications with intelligent chat assistance, visual building tools, and instant deployment."
    },
    {
      question: "Is Kernel free to use?",
      answer: "Yes! Kernel offers a free tier that includes AI chat, visual builder, and basic deployment features. Premium features are available for teams and advanced use cases."
    },
    {
      question: "Do I need coding experience?",
      answer: "No coding experience is required. Kernel's AI assistant and visual builder make it easy to create applications, while developers can access and customize the code directly."
    }
  ],
  auth: [
    {
      question: "How do I create an account?",
      answer: "Click 'Get Started' and sign up with your email or use Google/GitHub OAuth for instant access."
    },
    {
      question: "Can I reset my password?",
      answer: "Yes, click 'Forgot Password' on the sign-in page and we'll send you a reset link."
    }
  ]
};

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

// OG Image URL helper with dimensions
export const getOgImageUrl = (imagePath: string, siteUrl: string = SEO_CONFIG.siteUrl) => {
  const fullUrl = imagePath.startsWith('http') ? imagePath : `${siteUrl}${imagePath}`;
  return {
    url: fullUrl,
    width: SEO_CONFIG.ogImageDimensions.width,
    height: SEO_CONFIG.ogImageDimensions.height,
    alt: `${SEO_CONFIG.siteName} - ${imagePath.split('/').pop()?.replace('.png', '').replace('-', ' ')}`,
  };
};
