import { ComponentType } from "react";
import { XLogo } from "@/components/ui/x-logo";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  icon: ComponentType<{ className?: string }>;
  href: string;
  label: string;
}

export const footerSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Features", href: "/#features" },
      { label: "Compare", href: "/compare" },
      { label: "Changelog", href: "/changelog" },
      { label: "Install App", href: "/install" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { label: "Request Access", href: "/request-invite" },
      { label: "Redeem Code", href: "/redeem-invite" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Tutorials", href: "/tutorials" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { icon: XLogo, href: "https://x.com/kernel_cool", label: "X" },
];
