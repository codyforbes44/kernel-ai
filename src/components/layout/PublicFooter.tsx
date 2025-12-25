import { footerSections } from "@/lib/footer-data";
import {
  FooterBrandSection,
  FooterLinkColumn,
  FooterBottomBar,
  FooterDecorations,
} from "./footer";

export function PublicFooter() {
  return (
    <footer className="relative border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <FooterDecorations />
      
      <div className="container mx-auto px-4 py-12 sm:py-14 lg:py-16 relative z-10">
        {/* Main Footer Grid */}
        <nav 
          aria-label="Footer navigation"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-14 lg:mb-16"
        >
          <FooterBrandSection />
          
          {footerSections.map((section) => (
            <FooterLinkColumn key={section.title} section={section} />
          ))}
        </nav>

        <FooterBottomBar />
      </div>
    </footer>
  );
}
