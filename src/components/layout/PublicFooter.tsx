import { footerSections } from "@/lib/footer-data";
import {
  FooterBrandSection,
  FooterLinkColumn,
  FooterBottomBar,
  FooterDecorations,
} from "./footer";

export function PublicFooter() {
  // Filter out Legal section from main grid (it's in bottom bar)
  const mainSections = footerSections.filter(s => s.title !== "Legal");
  const legalSection = footerSections.find(s => s.title === "Legal");

  return (
    <footer className="relative border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <FooterDecorations />
      
      <div className="container mx-auto px-4 py-10 sm:py-12 lg:py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-10 sm:mb-12 lg:mb-16">
          {/* Brand Section - Full width on mobile, fixed width on desktop */}
          <FooterBrandSection className="lg:w-72 lg:flex-shrink-0" />
          
          {/* Link Columns - Responsive grid */}
          <nav 
            aria-label="Footer navigation"
            className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 lg:gap-10 flex-1"
          >
            {mainSections.map((section) => (
              <FooterLinkColumn key={section.title} section={section} />
            ))}
          </nav>
        </div>

        <FooterBottomBar legalLinks={legalSection?.links} />
      </div>
    </footer>
  );
}