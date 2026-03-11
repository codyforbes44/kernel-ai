// SEO Configuration
export const SEO_CONFIG = {
  siteName: 'Kernel',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://kernel.cool',
  defaultTitle: 'Kernel - Your AI Development OS',
  defaultDescription: 'The operating system for AI-powered development. Kernel is the core that powers your vision — from idea to production in minutes.',
  defaultOgImage: '/og-images/default.png',
  twitterHandle: '@kernel_cool',
  locale: 'en_US',
  ogImageDimensions: {
    width: 1200,
    height: 630,
  },
};

// Per-page SEO configuration
export const PAGE_SEO = {
  landing: {
    title: 'Kernel - Your AI Development OS | The Core That Powers Everything',
    description: 'Kernel is the operating system for modern development. One platform that powers AI, databases, UI, APIs, auth, and deployment. From idea to production in minutes.',
    ogImage: '/og-image.png',
    keywords: ['AI development OS', 'AI operating system', 'development platform', 'app builder', 'AI-powered development', 'full-stack AI', 'kernel dev'] as string[],
  },
  home: {
    title: 'AI Assistant',
    description: 'Your AI-powered development companion. Get intelligent assistance for coding, debugging, and building apps faster than ever.',
    ogImage: '/og-images/chat.png',
    keywords: ['AI assistant', 'coding assistant', 'developer tools', 'AI programming'],
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
  // New page SEO configs
  pricing: {
    title: 'Pricing - Simple, Transparent Plans',
    description: 'Choose the perfect Kernel plan for your needs. Free tier available, with Pro and Enterprise options for teams and businesses.',
    ogImage: '/og-images/pricing.png',
    keywords: ['pricing', 'plans', 'subscription', 'free tier', 'pro plan', 'enterprise', 'AI development pricing'],
  },
  about: {
    title: 'About Us - Our Mission & Team',
    description: 'Learn about Kernel\'s mission to empower developers with AI. Meet the team building the future of web development.',
    ogImage: '/og-images/about.png',
    keywords: ['about kernel', 'team', 'mission', 'company', 'AI development company'],
  },
  documentation: {
    title: 'Documentation - Developer Guides',
    description: 'Comprehensive documentation for Kernel. Get started guides, API references, and tutorials to help you build faster.',
    ogImage: '/og-images/docs.png',
    keywords: ['documentation', 'docs', 'API reference', 'developer guide', 'tutorials'],
  },
  tutorials: {
    title: 'Tutorials - Learn & Build',
    description: 'Step-by-step tutorials to help you master Kernel. From beginner to advanced, learn to build with AI assistance.',
    ogImage: '/og-images/tutorials.png',
    keywords: ['tutorials', 'learning', 'how-to', 'guides', 'AI development tutorials'],
  },
  security: {
    title: 'Security - Enterprise Protection',
    description: 'Learn about Kernel\'s security practices, compliance certifications, and data protection measures. Your security is our priority.',
    ogImage: '/og-images/security.png',
    keywords: ['security', 'compliance', 'data protection', 'enterprise security', 'GDPR', 'SOC 2'],
  },
  contact: {
    title: 'Contact Us - Get Support',
    description: 'Get in touch with the Kernel team. We\'re here to help with questions, support, and partnership inquiries.',
    ogImage: '/og-images/contact.png',
    keywords: ['contact', 'support', 'help', 'customer service', 'get in touch'],
  },
  changelog: {
    title: 'Changelog - What\'s New',
    description: 'Stay up to date with the latest Kernel features, improvements, and bug fixes. See what\'s new in each release.',
    ogImage: '/og-images/changelog.png',
    keywords: ['changelog', 'updates', 'releases', 'new features', 'version history'],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Kernel\'s privacy policy. Learn how we collect, use, and protect your personal information.',
    ogImage: '/og-images/default.png',
    keywords: ['privacy policy', 'data privacy', 'personal data', 'GDPR'],
  },
  terms: {
    title: 'Terms of Service',
    description: 'Kernel\'s terms of service. Understand the terms and conditions for using our platform.',
    ogImage: '/og-images/default.png',
    keywords: ['terms of service', 'terms and conditions', 'legal', 'user agreement'],
  },
  compare: {
    title: 'Kernel vs Competition - AI Platform Comparison',
    description: 'Compare Kernel to Lovable, Bolt, v0, Replit, and Cursor. See why Kernel is the most complete AI-powered development platform with 23+ features.',
    ogImage: '/og-images/compare.png',
    keywords: ['platform comparison', 'AI development', 'Kernel vs Lovable', 'Kernel vs Bolt', 'Kernel vs v0', 'best AI IDE', 'AI code editor comparison'],
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
    "url": `${siteUrl}/contact`
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
    "priceValidUntil": "2026-12-31"
  }
  // Note: aggregateRating removed - will be added when real reviews are collected
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

// HowTo Schema for tutorials
export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface HowToSchemaInput {
  name: string;
  description: string;
  totalTime?: string;
  steps: HowToStep[];
  image?: string;
}

export const getHowToSchema = (tutorial: HowToSchemaInput, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": tutorial.name,
  "description": tutorial.description,
  ...(tutorial.totalTime && { "totalTime": tutorial.totalTime }),
  "image": tutorial.image || `${siteUrl}/og-images/tutorials.png`,
  "step": tutorial.steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    ...(step.image && { "image": step.image })
  }))
});

// Service/Pricing Schema
export interface PricingPlan {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'month' | 'year';
  features: string[];
}

export const getServiceSchema = (plans: PricingPlan[], siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Kernel AI Development Platform",
  "description": PAGE_SEO.pricing.description,
  "provider": {
    "@type": "Organization",
    "name": SEO_CONFIG.siteName,
    "url": siteUrl
  },
  "offers": plans.map(plan => ({
    "@type": "Offer",
    "name": plan.name,
    "description": plan.description,
    "price": plan.price,
    "priceCurrency": plan.currency,
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": plan.price,
      "priceCurrency": plan.currency,
      "billingDuration": plan.billingPeriod === 'month' ? 'P1M' : 'P1Y'
    }
  }))
});

// ContactPoint Schema
export const getContactPointSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Kernel",
  "description": PAGE_SEO.contact.description,
  "url": `${siteUrl}/contact`,
  "mainEntity": {
    "@type": "Organization",
    "name": SEO_CONFIG.siteName,
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@kernel.cool",
        "availableLanguage": "English"
      },
      {
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "sales@kernel.cool",
        "availableLanguage": "English"
      }
    ]
  }
});

// FAQ Schema Helper
export interface FAQItem {
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
  ],
  pricing: [
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes AI chat assistance, visual builder, basic templates, and deployment to a kernel.cool subdomain."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all paid plans. Contact support if you're not satisfied."
    }
  ],
  security: [
    {
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard encryption (TLS 1.3) for all data in transit and AES-256 for data at rest. We're SOC 2 Type II compliant."
    },
    {
      question: "Do you store my code?",
      answer: "Your code is stored securely in our cloud infrastructure with full encryption. You can export or delete your data at any time."
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
  pricing: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Pricing', url: `${siteUrl}/pricing` }
  ]),
  about: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'About', url: `${siteUrl}/about` }
  ]),
  docs: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Documentation', url: `${siteUrl}/docs` }
  ]),
  tutorials: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Tutorials', url: `${siteUrl}/tutorials` }
  ]),
  security: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Security', url: `${siteUrl}/security` }
  ]),
  contact: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Contact', url: `${siteUrl}/contact` }
  ]),
  changelog: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Changelog', url: `${siteUrl}/changelog` }
  ]),
  privacy: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Privacy Policy', url: `${siteUrl}/privacy` }
  ]),
  terms: (siteUrl: string) => getBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Terms of Service', url: `${siteUrl}/terms` }
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

// Helper to convert date strings to ISO format
export const toISODate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString();
};

// Documentation article SEO helper
export interface DocArticleSEO {
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  slug: string;
  readTime: string;
  lastUpdated: string;
}

export const getDocumentationSEO = (doc: DocArticleSEO) => ({
  title: `${doc.title} | Kernel Documentation`,
  description: doc.description,
  ogImage: '/og-images/docs.png',
  keywords: [doc.category.toLowerCase(), 'documentation', 'guide', 'kernel', doc.title.toLowerCase()],
  canonical: `/docs/${doc.categorySlug}/${doc.slug}`,
});

export const getDocCategorySEO = (category: { title: string; slug: string; description: string }) => ({
  title: `${category.title} Documentation | Kernel`,
  description: category.description,
  ogImage: '/og-images/docs.png',
  keywords: [category.title.toLowerCase(), 'documentation', 'guide', 'kernel'],
  canonical: `/docs/${category.slug}`,
});

// Tutorial SEO helper
export interface TutorialSEO {
  title: string;
  description: string;
  slug: string;
  difficulty: string;
  duration: string;
}

export const getTutorialSEO = (tutorial: TutorialSEO) => ({
  title: `${tutorial.title} | Kernel Tutorials`,
  description: tutorial.description,
  ogImage: '/og-images/tutorials.png',
  keywords: ['tutorial', tutorial.difficulty.toLowerCase(), 'guide', 'kernel', tutorial.title.toLowerCase()],
  canonical: `/tutorials/${tutorial.slug}`,
});
