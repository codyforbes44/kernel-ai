import { FooterLink } from "./FooterLink";
import type { FooterSection } from "@/lib/footer-data";

interface FooterLinkColumnProps {
  section: FooterSection;
}

export function FooterLinkColumn({ section }: FooterLinkColumnProps) {
  return (
    <div className="min-w-0">
      <h4 className="font-semibold text-sm mb-3 sm:mb-4 text-foreground/90">
        {section.title}
      </h4>
      <ul className="space-y-2 sm:space-y-3" role="list">
        {section.links.map((link) => (
          <li key={link.label} role="listitem">
            <FooterLink link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}
