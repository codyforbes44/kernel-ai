/**
 * Kernel Brand Voice Guide
 * ========================
 * 
 * Core Identity: "Your AI Development OS"
 * 
 * Kernel is positioned as the operating system for modern development —
 * the foundational layer that powers everything developers build.
 */

// =============================================================================
// BRAND POSITIONING
// =============================================================================

export const BRAND_POSITIONING = {
  // Primary tagline - use on hero sections, main marketing
  primaryTagline: "Your AI Development OS",
  
  // Secondary taglines - rotate for variety
  secondaryTaglines: [
    "The Core That Powers Your Vision",
    "One Core. Everything Powered.",
    "Boot Into the Future",
    "The Operating System for Modern Development",
  ],
  
  // Elevator pitch (30 seconds)
  elevatorPitch: `Kernel is the operating system for AI-powered development. 
    Like how macOS or Windows powers your computer, Kernel powers your entire 
    development workflow — AI, databases, UI, APIs, authentication, and deployment 
    unified under one intelligent core. From idea to production in minutes.`,
  
  // One-liner (10 seconds)
  oneLiner: "Kernel is the AI Development OS that powers everything you build.",
  
  // Value proposition
  valueProposition: {
    primary: "One platform that replaces your entire development stack",
    supporting: [
      "AI-native from the ground up",
      "Unified system, not fragmented tools",
      "From idea to production in minutes",
      "The core that powers everything",
    ],
  },
} as const;

// =============================================================================
// BRAND PERSONALITY
// =============================================================================

export const BRAND_PERSONALITY = {
  // Core traits (in order of importance)
  traits: [
    {
      trait: "Foundational",
      description: "We are the bedrock — essential, reliable, always running",
      doSay: ["powers", "runs on", "built on", "core", "foundation"],
      dontSay: ["helps with", "assists", "supports"],
    },
    {
      trait: "Intelligent",
      description: "Smart without being showy — capability over complexity",
      doSay: ["understands", "learns", "adapts", "knows"],
      dontSay: ["AI-powered (overused)", "smart", "magical"],
    },
    {
      trait: "Unified",
      description: "One system, not a collection of parts",
      doSay: ["unified", "integrated", "one core", "seamless"],
      dontSay: ["suite of tools", "collection", "bundle"],
    },
    {
      trait: "Empowering",
      description: "We amplify developers, we don't replace them",
      doSay: ["powers your", "enables", "unlocks", "amplifies"],
      dontSay: ["does it for you", "no coding needed", "replaces developers"],
    },
    {
      trait: "Future-Forward",
      description: "Building tomorrow's standard, today",
      doSay: ["next-generation", "modern", "future of", "2025+"],
      dontSay: ["revolutionary", "game-changing", "disruptive"],
    },
  ],
  
  // Brand archetype
  archetype: "The Architect",
  archetypeDescription: `Like an architect who designs the blueprint that everything 
    else is built upon, Kernel provides the foundational system that powers all development.`,
} as const;

// =============================================================================
// VOICE & TONE
// =============================================================================

export const VOICE_AND_TONE = {
  // Overall voice characteristics
  voice: {
    confident: "We know what we're building and why it matters",
    technical: "We speak developer-to-developer, not marketer-to-consumer",
    concise: "Every word earns its place — no fluff, no jargon bloat",
    warm: "Professional but approachable — we're builders too",
  },
  
  // Tone varies by context
  toneByContext: {
    marketing: {
      tone: "Bold & Aspirational",
      example: "Boot into the future. Kernel is the AI Development OS that powers everything you build.",
    },
    documentation: {
      tone: "Clear & Precise",
      example: "Kernel handles authentication, database operations, and API calls through a unified interface.",
    },
    errorMessages: {
      tone: "Helpful & Direct",
      example: "Database connection failed. Check your credentials in Settings → Cloud → Database.",
    },
    onboarding: {
      tone: "Encouraging & Guiding",
      example: "Welcome to Kernel. Let's set up your first project — it takes about 2 minutes.",
    },
    support: {
      tone: "Empathetic & Solution-Oriented",
      example: "I understand the frustration. Here's how we can fix this together.",
    },
  },
  
  // Writing principles
  principles: [
    {
      principle: "Lead with the outcome",
      bad: "Kernel uses advanced AI to help you build applications",
      good: "Build production apps in minutes with Kernel",
    },
    {
      principle: "Use active voice",
      bad: "Your code is deployed by Kernel automatically",
      good: "Kernel deploys your code automatically",
    },
    {
      principle: "Be specific, not vague",
      bad: "Kernel makes development easier",
      good: "Kernel cuts deployment time from hours to seconds",
    },
    {
      principle: "Embrace the OS metaphor",
      bad: "Kernel is a platform with many features",
      good: "Kernel powers AI, databases, UI, APIs, and deployment from one core",
    },
  ],
} as const;

// =============================================================================
// MESSAGING FRAMEWORK
// =============================================================================

export const MESSAGING_FRAMEWORK = {
  // Key messages by audience
  byAudience: {
    developers: {
      headline: "Your AI Development OS",
      subhead: "One unified system for AI, data, UI, and deployment",
      proof: "Ship in minutes what used to take months",
      cta: "Start Building",
    },
    technicalLeaders: {
      headline: "The Operating System for Modern Development",
      subhead: "Reduce stack complexity while increasing velocity",
      proof: "One platform replaces 6+ tools in your workflow",
      cta: "See the Architecture",
    },
    founders: {
      headline: "From Idea to Production, Faster",
      subhead: "The AI-native stack that scales with you",
      proof: "Launch MVPs in days, not months",
      cta: "Get Early Access",
    },
  },
  
  // Feature naming convention
  featureNaming: {
    pattern: "Kernel [Capability]",
    examples: [
      "Kernel AI — Intelligent development assistance",
      "Kernel Data — Unified database layer",
      "Kernel UI — Visual component system",
      "Kernel Auth — Identity and access management",
      "Kernel Deploy — One-click production deployment",
      "Kernel Functions — Serverless edge computing",
    ],
  },
  
  // Competitive positioning
  vsCompetitors: {
    positioning: "The unified alternative to fragmented tools",
    differentiators: [
      "One core vs. multiple disconnected services",
      "AI-native vs. AI-bolted-on",
      "Full-stack vs. frontend-only or backend-only",
      "Operating system vs. single-purpose tool",
    ],
    framingStatement: `While other tools handle one piece of development, 
      Kernel powers everything — the complete operating system for AI-native development.`,
  },
} as const;

// =============================================================================
// OS METAPHOR LANGUAGE
// =============================================================================

export const OS_METAPHOR = {
  // Terms to use (embrace the OS concept)
  useTerms: {
    "boot": "Starting or initializing (e.g., 'Boot into Kernel')",
    "core": "The central system (e.g., 'Kernel Core')",
    "powers": "Enables or runs (e.g., 'Powers your development')",
    "runs on": "Built with (e.g., 'Runs on Kernel')",
    "system": "The unified platform (e.g., 'One system')",
    "layer": "A capability area (e.g., 'Data layer')",
    "kernel": "The essential foundation (literally what we are)",
  },
  
  // Terms to avoid
  avoidTerms: {
    "platform": "Too generic — use 'OS' or 'system'",
    "suite": "Implies disconnected parts — use 'unified'",
    "tool": "Too small — we're an OS, not a tool",
    "helps": "Too passive — we 'power', not 'help'",
    "solution": "Corporate jargon — be specific",
  },
  
  // Metaphor examples
  examples: [
    {
      concept: "Full-stack development",
      metaphor: "Like how an OS manages memory, storage, and display — Kernel manages AI, data, and UI",
    },
    {
      concept: "Getting started",
      metaphor: "Boot into Kernel and start building",
    },
    {
      concept: "Platform capabilities",
      metaphor: "Core services that power your entire development workflow",
    },
    {
      concept: "Integration",
      metaphor: "Everything runs on the same kernel — no middleware, no glue code",
    },
  ],
} as const;

// =============================================================================
// COPY TEMPLATES
// =============================================================================

export const COPY_TEMPLATES = {
  // Headlines
  headlines: {
    hero: [
      "Your AI Development OS",
      "The Core That Powers Your Vision",
      "One Core. Everything Powered.",
      "Boot Into the Future",
    ],
    features: [
      "Everything Powered by One Core",
      "The Complete Development System",
      "All Core Services, Unified",
    ],
    comparison: [
      "The Only OS You Need",
      "One System vs. Many Tools",
      "Replace Your Stack, Not Your Skills",
    ],
    cta: [
      "Start Building on Kernel",
      "Boot Into Kernel",
      "Power Your Next Project",
    ],
  },
  
  // Descriptions
  descriptions: {
    short: "The AI Development OS that powers everything you build.",
    medium: "Kernel is the operating system for modern development — AI, databases, UI, APIs, auth, and deployment unified under one intelligent core.",
    long: "Like how macOS powers your Mac or Linux powers servers, Kernel powers your entire development workflow. One unified system for AI assistance, database management, UI components, API creation, authentication, and deployment. From idea to production in minutes.",
  },
  
  // CTAs
  ctas: {
    primary: [
      "Get Early Access",
      "Start Building",
      "Boot Into Kernel",
    ],
    secondary: [
      "See How It Works",
      "Explore the Core",
      "View Documentation",
    ],
    tertiary: [
      "Learn More",
      "Read the Guide",
      "Compare Platforms",
    ],
  },
  
  // Social proof
  socialProof: {
    patterns: [
      "[Number] developers running on Kernel",
      "[Number] apps powered by Kernel",
      "Trusted by teams at [Companies]",
    ],
  },
} as const;

// =============================================================================
// VISUAL LANGUAGE ALIGNMENT
// =============================================================================

export const VISUAL_LANGUAGE = {
  // Core visual element
  coreAnimation: {
    description: "The Kernel Core animation — a pulsing central core with energy flowing outward to service nodes",
    symbolism: "Represents Kernel as the central system powering all development services",
    usage: "Hero sections, loading states, brand moments",
  },
  
  // Color meaning
  colorMeaning: {
    cyan: "Primary — represents the core, technology, intelligence",
    gold: "Accent — represents premium, success, calls-to-action",
    dark: "Foundation — represents depth, professionalism, stability",
  },
  
  // Typography voice
  typographyVoice: {
    headlines: "Bold, confident, minimal — let the words breathe",
    body: "Clear, readable, technical but not cold",
    code: "JetBrains Mono — developer-native authenticity",
  },
} as const;

// =============================================================================
// QUICK REFERENCE
// =============================================================================

export const QUICK_REFERENCE = {
  // One-liners for different contexts
  contextualOneLiner: {
    twitter: "Kernel — Your AI Development OS. One core. Everything powered. 🚀",
    linkedin: "Kernel is the operating system for AI-powered development. From idea to production in minutes.",
    email: "Kernel: The AI Development OS that powers everything you build.",
    slack: "Building on Kernel — the AI Dev OS that powers everything 🔥",
  },
  
  // Hashtags
  hashtags: ["#KernelDev", "#AIDevOS", "#BuildWithKernel", "#PoweredByKernel"],
  
  // Boilerplate
  boilerplate: `Kernel is the AI Development OS — a unified system that powers AI, databases, 
    UI, APIs, authentication, and deployment from one intelligent core. Founded in 2024, 
    Kernel is building the operating system for the next generation of developers.`,
} as const;

// Type exports for usage
export type BrandTrait = typeof BRAND_PERSONALITY.traits[number];
export type ToneContext = keyof typeof VOICE_AND_TONE.toneByContext;
export type Audience = keyof typeof MESSAGING_FRAMEWORK.byAudience;
