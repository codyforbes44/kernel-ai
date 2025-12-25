import { MessageSquare, Code2, Palette, Zap, Shield, Users, LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: MessageSquare,
    title: "Natural Language to Code",
    description: "Describe what you want in plain English and watch as production-ready code appears instantly."
  },
  {
    icon: Code2,
    title: "Full-Stack Generation",
    description: "Generate complete applications with frontend, backend, and database—all from a single conversation."
  },
  {
    icon: Palette,
    title: "Beautiful by Default",
    description: "Every component comes with thoughtful design, responsive layouts, and polished animations."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Go from idea to deployed app in minutes, not months. Real-time preview as you build."
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "Built-in authentication, role-based access, and security best practices from day one."
  },
  {
    icon: Users,
    title: "Collaborative",
    description: "Work together in real-time. Share projects, iterate on designs, and ship as a team."
  }
];
