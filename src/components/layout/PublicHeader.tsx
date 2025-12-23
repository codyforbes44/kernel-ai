import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { XLogo } from "@/components/ui/x-logo";
import { Button } from "@/components/ui/button";
import { KernelLogo } from "@/components/ui/kernel-logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface NavLink {
  label: string;
  href: string;
  isAnchor?: boolean;
}

const navLinks: NavLink[] = [
  { label: "Features", href: "/#features", isAnchor: true },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = useCallback((href: string) => {
    const anchor = href.split("#")[1];
    const isOnLandingPage = location.pathname === "/";

    if (isOnLandingPage && anchor) {
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (anchor) {
      // Navigate to landing page first, then scroll
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.pathname, navigate]);

  const handleNavClick = (e: React.MouseEvent, link: NavLink) => {
    if (link.isAnchor) {
      e.preventDefault();
      scrollToSection(link.href);
      setIsOpen(false);
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <KernelLogo className="w-8 h-8" />
          <span className="font-bold text-xl">Kernel</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://x.com/kernel_cool"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Follow us on X"
          >
            <XLogo className="h-4 w-4" />
          </a>
          <Button variant="gold" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] pt-12">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://x.com/kernel_cool"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
              >
                <XLogo className="h-5 w-5" />
                Follow on X
              </a>
              <div className="border-t border-border my-4" />
              <SheetClose asChild>
                <Button variant="gold" className="w-full" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
