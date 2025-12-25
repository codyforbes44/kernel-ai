import { Link } from "react-router-dom";
import { APP_VERSION } from "@/lib/version";
import type { FooterLink } from "@/lib/footer-data";

interface FooterBottomBarProps {
  legalLinks?: FooterLink[];
}

export function FooterBottomBar({ legalLinks }: FooterBottomBarProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="pt-6 sm:pt-8 border-t border-border/30 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
      {/* Copyright & Version */}
      <div className="flex items-center gap-3 text-center sm:text-left">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Kernel. All rights reserved.
        </p>
        <span className="text-xs text-muted-foreground/50 font-mono hidden sm:inline">
          v{APP_VERSION}
        </span>
      </div>
      
      {/* Legal Links */}
      <nav aria-label="Legal links" className="flex items-center gap-5 sm:gap-6">
        {legalLinks?.map((link) => (
          <Link
            key={link.label}
            to={link.href}
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}