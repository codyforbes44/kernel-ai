import { cn } from "@/lib/utils";
import { KernelLogoAnimated } from "@/components/ui/kernel-logo-animated";
import { socialLinks } from "@/lib/footer-data";
import { NewsletterForm } from "./NewsletterForm";

interface FooterBrandSectionProps {
  className?: string;
}

export function FooterBrandSection({ className }: FooterBrandSectionProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-center gap-2.5">
        <KernelLogoAnimated size="sm" variant="minimal" />
        <span className="font-bold text-lg tracking-tight">Kernel</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        Build beautiful web applications with AI assistance. From idea to deployment in minutes.
      </p>
      
      {/* Newsletter Signup */}
      <div className="space-y-2 pt-1">
        <p className="text-xs text-muted-foreground/80 font-medium">
          Get updates on new features
        </p>
        <NewsletterForm />
      </div>
      
      {/* Social Links */}
      <nav aria-label="Social media links" className="flex items-center gap-2.5 pt-2">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-2.5 rounded-lg bg-primary/5 hover:bg-primary/15 text-muted-foreground hover:text-primary transition-all duration-200 border border-border/50 hover:border-primary/40 hover:shadow-[0_0_12px_hsl(var(--primary)/0.25)]"
            aria-label={`Follow us on ${social.label}`}
          >
            <social.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          </a>
        ))}
      </nav>
    </div>
  );
}