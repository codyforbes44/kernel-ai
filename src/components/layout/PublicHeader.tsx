import { useState, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Command as CommandIcon } from "lucide-react";
import { XLogo } from "@/components/ui/x-logo";
import { Button } from "@/components/ui/button";
import { KernelLogoAnimated } from "@/components/ui/kernel-logo-animated";
import { CommandNav } from "@/components/layout/CommandNav";
import { useCommandNav } from "@/hooks/useCommandNav";
import { hapticFeedback } from "@/hooks/useHaptic";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
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
  const { isOpen: commandOpen, toggle: toggleCommand, close: closeCommand } = useCommandNav();

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

  const handleCommandClick = () => {
    hapticFeedback("light");
    toggleCommand();
  };

  return (
    <>
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
          {/* Logo - Opens Command Nav */}
          <div className="flex items-center gap-3">
            <KernelLogoAnimated
              size="md"
              variant="animated"
              isActive={commandOpen}
              onClick={handleCommandClick}
              className="cursor-pointer"
            />
            <Link to="/" className="group flex items-center">
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]">
                Kernel
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Minimal with Command Trigger */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Command trigger button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommandClick}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <CommandIcon className="h-4 w-4" />
              <span className="text-sm">Menu</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/30 px-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-6 bg-border/50 mx-2" />

            {/* Quick action links */}
            <a
              href="https://x.com/kernel_cool"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
              aria-label="Follow on X"
            >
              <XLogo className="h-4 w-4" />
            </a>

            <Button variant="outline" size="sm" className="border-border/60 hover:border-primary/40 hover:bg-primary/5" asChild>
              <Link to="/redeem-invite">Have a Code?</Link>
            </Button>

            <Button variant="gold" size="sm" className="shadow-sm shadow-gold/20" asChild>
              <Link to="/request-invite">Request Access</Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCommandClick}
              className="text-muted-foreground"
            >
              <CommandIcon className="h-5 w-5" />
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[300px] border-l border-primary/20 bg-background/95 backdrop-blur-xl"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
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
        </div>
      </header>

      {/* Command Navigation Modal */}
      <CommandNav isOpen={commandOpen} onClose={closeCommand} />
    </>
  );
}
