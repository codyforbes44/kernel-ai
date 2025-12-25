import { Link } from "react-router-dom";
import type { FooterLink as FooterLinkType } from "@/lib/footer-data";

interface FooterLinkProps {
  link: FooterLinkType;
  className?: string;
}

export function FooterLink({ link, className = "" }: FooterLinkProps) {
  const baseClasses = `text-sm text-muted-foreground hover:text-primary transition-colors duration-200 relative group ${className}`;
  
  const underlineElement = (
    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
  );

  // External links
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {link.label}
        {underlineElement}
      </a>
    );
  }

  // Anchor links (hash links)
  if (link.href.startsWith("#") || link.href.startsWith("/#")) {
    return (
      <a href={link.href} className={baseClasses}>
        {link.label}
        {underlineElement}
      </a>
    );
  }

  // Internal React Router links
  return (
    <Link to={link.href} className={baseClasses}>
      {link.label}
      {underlineElement}
    </Link>
  );
}
