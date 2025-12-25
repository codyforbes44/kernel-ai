import { Lightbulb, Zap, Users, Heart, Sparkles, Code2, Rocket, LucideIcon } from "lucide-react";

export interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const values: Value[] = [
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We push boundaries to create tools that redefine how developers build software.",
  },
  {
    icon: Zap,
    title: "Speed Matters",
    description: "Every feature we build is optimized for developer velocity and productivity.",
  },
  {
    icon: Users,
    title: "Developer-Centric",
    description: "Built by developers, for developers. Your workflow is our priority.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description: "We listen, learn, and grow together with our vibrant developer community.",
  },
];

export const milestones: Milestone[] = [
  {
    year: "2023",
    title: "The Spark",
    description: "Kernel was born from a simple idea: what if AI could truly understand and accelerate the development process?",
    icon: Sparkles,
  },
  {
    year: "2024",
    title: "Rapid Growth",
    description: "Developers joined our platform, building everything from MVPs to production applications.",
    icon: Code2,
  },
  {
    year: "2025",
    title: "Breaking Barriers",
    description: "Launched advanced AI features and expanded our developer community globally.",
    icon: Zap,
  },
  {
    year: "2026",
    title: "The Future is Now",
    description: "Pioneering the next generation of AI-powered development tools and experiences.",
    icon: Rocket,
  },
];
