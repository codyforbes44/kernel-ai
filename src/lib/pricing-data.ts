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
