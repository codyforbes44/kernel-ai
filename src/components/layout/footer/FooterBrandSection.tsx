import { KernelLogo } from "@/components/ui/kernel-logo";
import { socialLinks } from "@/lib/footer-data";

export function FooterBrandSection() {
  return (
    <div className="col-span-2 sm:col-span-3 md:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <KernelLogo className="w-7 h-7 sm:w-8 sm:h-8" />
        <span className="font-bold text-lg">Kernel</span>
      </div>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Build beautiful web applications with AI assistance. From idea to deployment in minutes.
      </p>
      {/* Social Links */}
      <nav aria-label="Social media links" className="flex items-center gap-3">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-2.5 rounded-lg bg-primary/5 hover:bg-primary/15 text-muted-foreground hover:text-primary transition-all duration-200 border border-transparent hover:border-primary/40 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
            aria-label={`Follow us on ${social.label}`}
          >
            <social.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          </a>
        ))}
      </nav>
    </div>
  );
}
