import { Link } from "react-router-dom";
import { KernelLogo } from "@/components/ui/kernel-logo";
import { XLogo } from "@/components/ui/x-logo";
import { APP_VERSION } from "@/lib/version";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Changelog", href: "/changelog" },
      { label: "Install App", href: "/install" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { label: "Request Access", href: "/request-invite" },
      { label: "Redeem Code", href: "/redeem-invite" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Tutorials", href: "/tutorials" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
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

const socialLinks = [
  { icon: XLogo, href: "https://x.com/kernel_cool", label: "X" },
];

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/40 bg-background/80 backdrop-blur-sm">
      {/* Top holographic accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      <div className="container mx-auto px-4 py-10 sm:py-12 relative z-10">
        {/* Main Footer Grid - Mobile first */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <KernelLogo className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="font-bold text-lg">Kernel</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Build beautiful web applications with AI assistance. From idea to deployment in minutes.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 rounded-lg bg-primary/5 hover:bg-primary/15 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/40 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns - Responsive grid */}
          {footerSections.map((section) => (
            <div key={section.title} className="min-w-0">
              <h4 className="font-semibold text-sm mb-3 sm:mb-4 text-foreground/90">{section.title}</h4>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith("#") || link.href.startsWith("/#") ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Kernel. All rights reserved.
            </p>
            <span className="text-xs text-muted-foreground/50 font-mono">
              v{APP_VERSION}
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
