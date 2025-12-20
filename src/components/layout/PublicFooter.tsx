import { Link } from "react-router-dom";
import { KernelLogo } from "@/components/ui/kernel-logo";

interface FooterLink {
  label: string;
  href: string;
}

const footerLinks: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <KernelLogo className="w-6 h-6" />
            <span className="font-semibold">Kernel</span>
          </div>

          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm text-muted-foreground">
            © {currentYear} Kernel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
