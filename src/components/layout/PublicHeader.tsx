import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Command as CommandIcon } from "lucide-react";
import { XLogo } from "@/components/ui/x-logo";
import { Button } from "@/components/ui/button";
import { KernelLogoAnimated } from "@/components/ui/kernel-logo-animated";
import { CommandNav } from "@/components/layout/CommandNav";
import { useCommandNav } from "@/hooks/useCommandNav";
import { hapticFeedback } from "@/hooks/useHaptic";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { isOpen: commandOpen, toggle: toggleCommand, close: closeCommand } = useCommandNav();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <KernelLogoAnimated
            size="md"
            variant="animated"
            isActive={commandOpen}
            onClick={handleCommandClick}
            className="cursor-pointer"
          />

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

          {/* Mobile Navigation - Single Command trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCommandClick}
              className="text-muted-foreground h-10 w-10"
              aria-label="Open menu"
            >
              <CommandIcon className="h-5 w-5" />
            </Button>
            
            <Button variant="gold" size="sm" className="shadow-sm shadow-gold/20" asChild>
              <Link to="/request-invite">Get Access</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Command Navigation Modal */}
      <CommandNav isOpen={commandOpen} onClose={closeCommand} />
    </>
  );
}
