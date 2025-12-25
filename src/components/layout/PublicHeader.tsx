import { useState, useCallback, useEffect } from "react";
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
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  isAnchor?: boolean;
}

const navLinks: NavLink[] = [
  { label: "Features", href: "/#features", isAnchor: true },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((href: string) => {
    const anchor = href.split("#")[1];
    const isOnLandingPage = location.pathname === "/";

    if (isOnLandingPage && anchor) {
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (anchor) {
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
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "border-b",
        scrolled 
          ? "border-border/60 bg-background/90 backdrop-blur-xl shadow-lg shadow-background/50" 
          : "border-transparent bg-transparent backdrop-blur-sm"
      )}
    >
      {/* Holographic accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
      
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <KernelLogo className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-105" />
          <span className="font-bold text-lg sm:text-xl">Kernel</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className={cn(
                "relative text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-2",
                // Holographic underline effect
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px",
                "after:bg-gradient-to-r after:from-primary/0 after:via-primary after:to-primary/0",
                "after:scale-x-0 after:transition-transform after:duration-300",
                "hover:after:scale-x-100"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <a
            href="https://x.com/kernel_cool"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all"
            aria-label="Follow us on X"
          >
            <XLogo className="h-4 w-4" />
          </a>
          <Button variant="outline" size="sm" className="border-border/60 hover:border-primary/40 hover:bg-primary/5" asChild>
            <Link to="/redeem-invite">Have a Code?</Link>
          </Button>
          <Button variant="gold" size="sm" className="shadow-sm shadow-gold/20" asChild>
            <Link to="/request-invite">Request Access</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-[300px] border-l border-primary/20 bg-background/95 backdrop-blur-xl"
          >
            {/* Mobile holographic accent */}
            <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
            
            <nav className="flex flex-col gap-2 mt-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-primary/5 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://x.com/kernel_cool"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-primary/5"
              >
                <XLogo className="h-5 w-5" />
                Follow on X
              </a>
              
              <div className="border-t border-border/40 my-4" />
              
              <SheetClose asChild>
                <Button variant="gold" className="w-full h-12 text-base" asChild>
                  <Link to="/request-invite">Request Early Access</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="outline" className="w-full h-12 text-base mt-2 border-border/60" asChild>
                  <Link to="/redeem-invite">Have an Invite Code?</Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
