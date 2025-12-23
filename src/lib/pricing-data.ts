import { Zap, Crown, Building2 } from "lucide-react";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
  icon: typeof Zap;
}

export interface ComparisonFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

export const plans: Plan[] = [
  {
    name: "Free",
    description: "Perfect for trying out Kernel",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    features: [
      { text: "5 AI conversations/day", included: true },
      { text: "Basic code generation", included: true },
      { text: "Community support", included: true },
      { text: "3 projects", included: true },
      { text: "Priority support", included: false },
      { text: "Custom domains", included: false },
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    description: "For professionals and power users",
    monthlyPrice: 19,
    yearlyPrice: 190,
    icon: Crown,
    popular: true,
    features: [
      { text: "Unlimited AI conversations", included: true },
      { text: "Advanced code generation", included: true },
      { text: "Priority support", included: true },
      { text: "Unlimited projects", included: true },
      { text: "Custom templates", included: true },
      { text: "API access", included: true },
    ],
    cta: "Start Pro Trial",
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    monthlyPrice: null,
    yearlyPrice: null,
    icon: Building2,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom integrations", included: true },
      { text: "SSO & SAML", included: true },
      { text: "SLA guarantee", included: true },
      { text: "On-premise option", included: true },
    ],
    cta: "Contact Sales",
  },
];

export const comparisonFeatures: ComparisonFeature[] = [
  { name: "Projects", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Storage", free: "1GB", pro: "50GB", enterprise: "Unlimited" },
  { name: "AI Assistance", free: "Basic", pro: "Advanced", enterprise: "Custom" },
  { name: "Custom Domains", free: false, pro: true, enterprise: true },
  { name: "Analytics", free: false, pro: true, enterprise: true },
  { name: "API Access", free: false, pro: true, enterprise: true },
  { name: "Priority Support", free: false, pro: true, enterprise: true },
  { name: "SSO/SAML", free: false, pro: false, enterprise: true },
  { name: "Custom Integrations", free: false, pro: false, enterprise: true },
  { name: "SLA Guarantee", free: false, pro: false, enterprise: true },
];

export const YEARLY_DISCOUNT = 0.17; // 17% discount for yearly billing

// Platform Comparison Data
export interface Platform {
  id: string;
  name: string;
  color: string;
  description: string;
  isHighlighted?: boolean;
}

export interface PlatformFeature {
  name: string;
  description?: string;
  category: "Core" | "AI Capabilities" | "Deployment" | "Collaboration" | "Developer Experience";
  kernel: boolean | string;
  lovable: boolean | string;
  bolt: boolean | string;
  v0: boolean | string;
  replit: boolean | string;
  cursor: boolean | string;
}

export const platforms: Platform[] = [
  {
    id: "kernel",
    name: "Kernel",
    color: "hsl(var(--primary))",
    description: "AI-powered full-stack development platform",
    isHighlighted: true,
  },
  {
    id: "lovable",
    name: "Lovable",
    color: "hsl(340, 82%, 59%)",
    description: "AI web app builder",
  },
  {
    id: "bolt",
    name: "Bolt",
    color: "hsl(45, 93%, 47%)",
    description: "Full-stack AI development",
  },
  {
    id: "v0",
    name: "v0",
    color: "hsl(0, 0%, 100%)",
    description: "Vercel UI generation",
  },
  {
    id: "replit",
    name: "Replit",
    color: "hsl(24, 94%, 53%)",
    description: "Cloud IDE with AI",
  },
  {
    id: "cursor",
    name: "Cursor",
    color: "hsl(220, 70%, 55%)",
    description: "AI-first code editor",
  },
];

export const platformFeatures: PlatformFeature[] = [
  // Core Features
  {
    name: "Visual Builder",
    description: "Drag-and-drop interface builder",
    category: "Core",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: false,
    cursor: false,
  },
  {
    name: "Integrated Code Editor",
    description: "Built-in Monaco-based editor",
    category: "Core",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: true,
  },
  {
    name: "Live Preview",
    description: "Real-time application preview",
    category: "Core",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: true,
    replit: true,
    cursor: false,
  },
  {
    name: "Project Templates",
    description: "Pre-built starter templates",
    category: "Core",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: true,
    replit: true,
    cursor: false,
  },
  // AI Capabilities
  {
    name: "AI Chat Assistant",
    description: "Conversational AI for coding",
    category: "AI Capabilities",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: "Limited",
    replit: true,
    cursor: true,
  },
  {
    name: "AI Code Generation",
    description: "Generate code from natural language",
    category: "AI Capabilities",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: true,
    replit: true,
    cursor: true,
  },
  {
    name: "AI Image Generation",
    description: "Generate images with AI",
    category: "AI Capabilities",
    kernel: true,
    lovable: false,
    bolt: false,
    v0: false,
    replit: false,
    cursor: false,
  },
  {
    name: "Screenshot-to-UI",
    description: "Convert designs to code",
    category: "AI Capabilities",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: true,
    replit: false,
    cursor: false,
  },
  {
    name: "Agent Mode",
    description: "Autonomous multi-step AI actions",
    category: "AI Capabilities",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: true,
  },
  // Deployment
  {
    name: "One-Click Deploy",
    description: "Instant deployment to production",
    category: "Deployment",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: false,
  },
  {
    name: "Custom Domains",
    description: "Connect your own domain",
    category: "Deployment",
    kernel: true,
    lovable: "Pro",
    bolt: "Pro",
    v0: false,
    replit: "Pro",
    cursor: false,
  },
  {
    name: "Built-in Database",
    description: "Integrated database solution",
    category: "Deployment",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: false,
  },
  {
    name: "Edge Functions",
    description: "Serverless backend functions",
    category: "Deployment",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: false,
  },
  {
    name: "Auto SSL Certificates",
    description: "Automatic HTTPS encryption",
    category: "Deployment",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: false,
  },
  // Collaboration
  {
    name: "Real-time Cursors",
    description: "See collaborators in real-time",
    category: "Collaboration",
    kernel: true,
    lovable: true,
    bolt: false,
    v0: false,
    replit: true,
    cursor: false,
  },
  {
    name: "Team Workspaces",
    description: "Shared team environment",
    category: "Collaboration",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: true,
  },
  {
    name: "Git Integration",
    description: "Connect to GitHub/GitLab",
    category: "Collaboration",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: true,
  },
  {
    name: "Version History",
    description: "Track and restore changes",
    category: "Collaboration",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: true,
  },
  // Developer Experience
  {
    name: "TypeScript Support",
    description: "Full TypeScript integration",
    category: "Developer Experience",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: true,
    replit: true,
    cursor: true,
  },
  {
    name: "Design System Builder",
    description: "Create custom design systems",
    category: "Developer Experience",
    kernel: true,
    lovable: false,
    bolt: false,
    v0: false,
    replit: false,
    cursor: false,
  },
  {
    name: "Component Marketplace",
    description: "Browse and install components",
    category: "Developer Experience",
    kernel: true,
    lovable: false,
    bolt: false,
    v0: false,
    replit: false,
    cursor: false,
  },
  {
    name: "Knowledge Base",
    description: "Custom AI context and docs",
    category: "Developer Experience",
    kernel: true,
    lovable: true,
    bolt: false,
    v0: false,
    replit: false,
    cursor: true,
  },
  {
    name: "Multi-file Refactoring",
    description: "AI-powered codebase changes",
    category: "Developer Experience",
    kernel: true,
    lovable: true,
    bolt: true,
    v0: false,
    replit: true,
    cursor: true,
  },
];
